const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const db = getDb();

// Create order
router.post('/', authenticateToken, (req, res) => {
  const { items, shippingAddress, shippingCity, shippingState, shippingZip } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }

  if (!shippingAddress || !shippingCity || !shippingState || !shippingZip) {
    return res.status(400).json({ error: 'Shipping information is required' });
  }

  // Verify all products first
  const verifyProduct = (item, callback) => {
    db.get('SELECT * FROM products WHERE id = ?', [item.productId], (err, product) => {
      if (err) return callback(err);
      if (!product) return callback(new Error(`Product ${item.productId} not found`));
      if (product.stock < item.quantity) return callback(new Error(`Insufficient stock for ${product.name}`));
      callback(null, { product, quantity: item.quantity });
    });
  };

  let verifiedItems = [];
  let verificationIndex = 0;

  const verifyNext = () => {
    if (verificationIndex >= items.length) {
      // All products verified, calculate total and create order
      const total = verifiedItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Create order
        db.run(
          'INSERT INTO orders (user_id, total, shipping_address, shipping_city, shipping_state, shipping_zip) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, total, shippingAddress, shippingCity, shippingState, shippingZip],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Failed to create order' });
            }

            const orderId = this.lastID;
            let itemsProcessed = 0;
            let hasError = false;

            if (verifiedItems.length === 0) {
              db.run('COMMIT', (err) => {
                if (err) return res.status(500).json({ error: 'Failed to commit order' });
                res.json({ orderId, total, message: 'Order created successfully' });
              });
              return;
            }

            // Create order items and update stock
            verifiedItems.forEach((orderItem) => {
              db.run(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, orderItem.product.id, orderItem.quantity, orderItem.product.price],
                (err) => {
                  if (hasError) return;
                  if (err) {
                    hasError = true;
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Failed to create order items' });
                  }

                  // Update product stock
                  db.run(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [orderItem.quantity, orderItem.product.id],
                    (err) => {
                      if (hasError) return;
                      if (err) {
                        hasError = true;
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Failed to update stock' });
                      }

                      itemsProcessed++;
                      if (itemsProcessed === verifiedItems.length) {
                        db.run('COMMIT', (err) => {
                          if (err) {
                            return res.status(500).json({ error: 'Failed to commit order' });
                          }
                          res.json({
                            orderId,
                            total,
                            message: 'Order created successfully'
                          });
                        });
                      }
                    }
                  );
                }
              );
            });
          }
        );
      });
      return;
    }

    verifyProduct(items[verificationIndex], (err, item) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      verifiedItems.push(item);
      verificationIndex++;
      verifyNext();
    });
  };

  verifyNext();
});

// Get user orders
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT o.*, 
     GROUP_CONCAT(oi.product_id || ':' || oi.quantity || ':' || oi.price) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get order items for each order
      const ordersWithItems = orders.map(order => {
        const items = order.items ? order.items.split(',').map(item => {
          const [productId, quantity, price] = item.split(':');
          return { productId: parseInt(productId), quantity: parseInt(quantity), price: parseFloat(price) };
        }) : [];
        return {
          ...order,
          items
        };
      });

      res.json(ordersWithItems);
    }
  );
});

// Get order by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Get order items
      db.all(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

module.exports = router;

