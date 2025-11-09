// Cart management
const cart = {
    getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    },

    saveCart(cartItems) {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    },

    addToCart(productId, quantity = 1) {
        let cartItems = this.getCart();
        const existingItem = cartItems.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({ productId, quantity });
        }

        this.saveCart(cartItems);
        this.updateCartCount();
        alert('Product added to cart!');
    },

    removeFromCart(productId) {
        let cartItems = this.getCart();
        cartItems = cartItems.filter(item => item.productId !== productId);
        this.saveCart(cartItems);
        this.updateCartCount();
        if (window.location.pathname === '/cart') {
            this.displayCart();
        }
    },

    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        let cartItems = this.getCart();
        const item = cartItems.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart(cartItems);
            this.updateCartCount();
            if (window.location.pathname === '/cart') {
                this.displayCart();
            }
        }
    },

    updateCartCount() {
        const cartItems = this.getCart();
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('#cartCount');
        cartCountElements.forEach(el => {
            if (el) el.textContent = count;
        });
    },

    async displayCart() {
        const cartItems = this.getCart();
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');

        if (!cartItemsContainer) return;

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Your cart is empty.</p></div>';
            if (cartTotalElement) cartTotalElement.textContent = '0.00';
            return;
        }

        let total = 0;
        let html = '';

        for (const item of cartItems) {
            try {
                const product = await api.get(`/api/products/${item.productId}`);
                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                html += `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="cart-item-details">
                            <h3>${product.name}</h3>
                            <p>${product.category}</p>
                            <p>Price: $${product.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-quantity">
                            <label>Qty:</label>
                            <input type="number" value="${item.quantity}" min="1" 
                                   onchange="cart.updateQuantity(${product.id}, parseInt(this.value))">
                        </div>
                        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                        <button class="cart-item-remove" onclick="cart.removeFromCart(${product.id})">Remove</button>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading product:', error);
            }
        }

        cartItemsContainer.innerHTML = html;
        if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2);
    },

    getCartTotal() {
        const cartItems = this.getCart();
        // This is a simplified version - in a real app, you'd need to fetch product prices
        return cartItems.length;
    },

    clearCart() {
        localStorage.removeItem('cart');
        this.updateCartCount();
    }
};

