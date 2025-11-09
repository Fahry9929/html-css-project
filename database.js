const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/database.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database with tables
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Products table
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT NOT NULL,
        stock INTEGER DEFAULT 100,
        specifications TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Orders table
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total REAL NOT NULL,
        shipping_address TEXT NOT NULL,
        shipping_city TEXT NOT NULL,
        shipping_state TEXT NOT NULL,
        shipping_zip TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Order items table
      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Check if products table is empty and seed data
      db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row.count === 0) {
          seedDatabase().then(() => resolve()).catch(reject);
        } else {
          resolve();
        }
      });
    });
  });
}

// Seed database with sample products
function seedDatabase() {
  return new Promise((resolve, reject) => {
    const products = [
      // Electronics
      {
        name: 'Laptop Computer',
        description: 'High-performance laptop with 16GB RAM, 512GB SSD, Intel i7 processor. Perfect for work and gaming.',
        price: 1299.99,
        image: 'https://via.placeholder.com/400x400?text=Laptop',
        category: 'Electronics',
        stock: 25,
        specifications: '16GB RAM, 512GB SSD, Intel i7, 15.6" Display'
      },
      {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
        price: 249.99,
        image: 'https://via.placeholder.com/400x400?text=Headphones',
        category: 'Electronics',
        stock: 50,
        specifications: 'Bluetooth 5.0, Noise Cancelling, 30hr Battery'
      },
      {
        name: 'Smartphone',
        description: 'Latest smartphone with 128GB storage, dual camera, and fast charging.',
        price: 799.99,
        image: 'https://via.placeholder.com/400x400?text=Smartphone',
        category: 'Electronics',
        stock: 40,
        specifications: '128GB Storage, Dual Camera, 6.5" Display, Fast Charge'
      },
      {
        name: 'Tablet',
        description: '10-inch tablet perfect for reading, browsing, and light productivity tasks.',
        price: 399.99,
        image: 'https://via.placeholder.com/400x400?text=Tablet',
        category: 'Electronics',
        stock: 30,
        specifications: '10" Display, 64GB Storage, Wi-Fi, 10hr Battery'
      },
      {
        name: 'Smart Watch',
        description: 'Fitness tracking smartwatch with heart rate monitor and GPS.',
        price: 299.99,
        image: 'https://via.placeholder.com/400x400?text=Smart+Watch',
        category: 'Electronics',
        stock: 45,
        specifications: 'GPS, Heart Rate Monitor, Water Resistant, 7-day Battery'
      },
      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt available in multiple colors and sizes.',
        price: 19.99,
        image: 'https://via.placeholder.com/400x400?text=T-Shirt',
        category: 'Clothing',
        stock: 100,
        specifications: '100% Cotton, Multiple Colors, Sizes S-XL'
      },
      {
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans with stretch for comfort and durability.',
        price: 59.99,
        image: 'https://via.placeholder.com/400x400?text=Jeans',
        category: 'Clothing',
        stock: 75,
        specifications: 'Classic Fit, Stretch Denim, Sizes 28-40'
      },
      {
        name: 'Winter Jacket',
        description: 'Warm and waterproof winter jacket perfect for cold weather.',
        price: 149.99,
        image: 'https://via.placeholder.com/400x400?text=Jacket',
        category: 'Clothing',
        stock: 40,
        specifications: 'Waterproof, Insulated, Multiple Sizes, Hood Included'
      },
      {
        name: 'Running Shoes',
        description: 'Lightweight running shoes with cushioned sole for maximum comfort.',
        price: 89.99,
        image: 'https://via.placeholder.com/400x400?text=Running+Shoes',
        category: 'Clothing',
        stock: 60,
        specifications: 'Lightweight, Cushioned Sole, Sizes 7-12, Multiple Colors'
      },
      {
        name: 'Dress Shirt',
        description: 'Formal dress shirt suitable for business and special occasions.',
        price: 49.99,
        image: 'https://via.placeholder.com/400x400?text=Dress+Shirt',
        category: 'Clothing',
        stock: 55,
        specifications: '100% Cotton, Wrinkle Resistant, Sizes S-XL'
      },
      // Books
      {
        name: 'Programming Guide',
        description: 'Comprehensive guide to modern web development and programming best practices.',
        price: 39.99,
        image: 'https://via.placeholder.com/400x400?text=Programming+Book',
        category: 'Books',
        stock: 80,
        specifications: 'Hardcover, 500 pages, Published 2023'
      },
      {
        name: 'Mystery Novel',
        description: 'Bestselling mystery novel with twists and turns that will keep you guessing.',
        price: 14.99,
        image: 'https://via.placeholder.com/400x400?text=Mystery+Novel',
        category: 'Books',
        stock: 120,
        specifications: 'Paperback, 350 pages, Bestseller'
      },
      {
        name: 'Cookbook',
        description: 'Collection of delicious recipes from around the world with beautiful photography.',
        price: 29.99,
        image: 'https://via.placeholder.com/400x400?text=Cookbook',
        category: 'Books',
        stock: 65,
        specifications: 'Hardcover, 400 pages, Full Color Photos'
      },
      {
        name: 'Science Fiction',
        description: 'Award-winning science fiction novel exploring future technologies and humanity.',
        price: 16.99,
        image: 'https://via.placeholder.com/400x400?text=Sci-Fi+Book',
        category: 'Books',
        stock: 90,
        specifications: 'Paperback, 450 pages, Award Winner'
      },
      // Home & Garden
      {
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with thermal carafe to keep coffee hot for hours.',
        price: 79.99,
        image: 'https://via.placeholder.com/400x400?text=Coffee+Maker',
        category: 'Home & Garden',
        stock: 35,
        specifications: '12-Cup Capacity, Programmable, Thermal Carafe'
      },
      {
        name: 'Garden Tools Set',
        description: 'Complete set of gardening tools including shovel, rake, and pruners.',
        price: 49.99,
        image: 'https://via.placeholder.com/400x400?text=Garden+Tools',
        category: 'Home & Garden',
        stock: 25,
        specifications: '5-Piece Set, Durable Steel, Ergonomic Handles'
      },
      {
        name: 'Throw Pillows',
        description: 'Set of 2 decorative throw pillows to enhance your living space.',
        price: 24.99,
        image: 'https://via.placeholder.com/400x400?text=Pillows',
        category: 'Home & Garden',
        stock: 70,
        specifications: 'Set of 2, Multiple Colors, 18x18 inches'
      },
      {
        name: 'Dining Table',
        description: 'Solid wood dining table that seats 6 people comfortably.',
        price: 599.99,
        image: 'https://via.placeholder.com/400x400?text=Dining+Table',
        category: 'Home & Garden',
        stock: 10,
        specifications: 'Solid Wood, Seats 6, 72x36 inches, Multiple Finishes'
      },
      // Sports
      {
        name: 'Basketball',
        description: 'Official size basketball with premium leather for indoor and outdoor play.',
        price: 29.99,
        image: 'https://via.placeholder.com/400x400?text=Basketball',
        category: 'Sports',
        stock: 85,
        specifications: 'Official Size, Premium Leather, Indoor/Outdoor'
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with extra cushioning for comfortable practice.',
        price: 34.99,
        image: 'https://via.placeholder.com/400x400?text=Yoga+Mat',
        category: 'Sports',
        stock: 60,
        specifications: 'Non-Slip, Extra Cushioning, 72x24 inches, Multiple Colors'
      },
      {
        name: 'Tennis Racket',
        description: 'Professional-grade tennis racket with graphite frame for power and control.',
        price: 129.99,
        image: 'https://via.placeholder.com/400x400?text=Tennis+Racket',
        category: 'Sports',
        stock: 30,
        specifications: 'Graphite Frame, Strung, Grip Size 4 3/8'
      },
      {
        name: 'Dumbbell Set',
        description: 'Adjustable dumbbell set with weights from 5lbs to 50lbs per hand.',
        price: 199.99,
        image: 'https://via.placeholder.com/400x400?text=Dumbbells',
        category: 'Sports',
        stock: 20,
        specifications: 'Adjustable 5-50lbs, Quick Change, Storage Stand Included'
      }
    ];

    const stmt = db.prepare(`INSERT INTO products (name, description, price, image, category, stock, specifications) 
                             VALUES (?, ?, ?, ?, ?, ?, ?)`);
    
    products.forEach(product => {
      stmt.run(
        product.name,
        product.description,
        product.price,
        product.image,
        product.category,
        product.stock,
        product.specifications
      );
    });

    stmt.finalize((err) => {
      if (err) reject(err);
      else {
        console.log('Database seeded with sample products');
        resolve();
      }
    });
  });
}

// Get database instance
function getDb() {
  return db;
}

module.exports = {
  initDatabase,
  getDb
};

