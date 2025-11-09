# E-Commerce Website

A full-stack e-commerce website built with Node.js, Express, SQLite, and vanilla HTML/CSS/JavaScript.

## Features

- **Product Listing**: Browse products with pagination, search, and filters
- **Product Details**: View detailed product information
- **Shopping Cart**: Add products to cart, update quantities, remove items
- **User Authentication**: Register and login with JWT tokens
- **Checkout**: Place orders with shipping information
- **Order Management**: View order history (for logged-in users)
- **Traditional Design**: Clean, professional e-commerce design

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML, CSS, JavaScript (vanilla, no frameworks)

## Installation

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
/programming
  /public
    index.html (homepage)
    product.html (product detail page)
    cart.html (shopping cart)
    login.html (user login)
    register.html (user registration)
    checkout.html (checkout page)
    /css
      style.css (main stylesheet)
    /js
      api.js (API communication)
      auth.js (authentication)
      cart.js (cart management)
      products.js (product listing)
  /server
    server.js (Express server)
    /routes
      auth.js (authentication routes)
      products.js (product routes)
      orders.js (order routes)
    /models
      database.js (database setup and schema)
    /middleware
      auth.js (JWT authentication middleware)
    /data
      database.db (SQLite database - created automatically)
  package.json
  README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token (protected)

### Products
- `GET /api/products` - Get all products (supports query parameters: category, search, minPrice, maxPrice, sort, page, limit)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/list` - Get all categories

### Orders
- `POST /api/orders` - Create a new order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)

## Sample Data

The database is automatically seeded with 20+ sample products across multiple categories:
- Electronics
- Clothing
- Books
- Home & Garden
- Sports

## Usage

1. **Browse Products**: Visit the homepage to see all available products
2. **Search**: Use the search bar to find specific products
3. **Filter**: Use the sidebar filters to narrow down products by category, price, etc.
4. **View Product**: Click on a product to see detailed information
5. **Add to Cart**: Click "Add to Cart" to add products to your shopping cart
6. **View Cart**: Click "Cart" in the navigation to view your cart
7. **Register/Login**: Create an account or login to place orders
8. **Checkout**: Proceed to checkout and enter shipping information to place an order

## Database

The SQLite database is created automatically when you first run the server. The database file is located at `server/data/database.db`.

### Tables
- `users` - User accounts
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Protected routes require valid JWT tokens
- Change the JWT_SECRET in production (set via environment variable)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens (default: 'your-secret-key-change-in-production')

## License

ISC

