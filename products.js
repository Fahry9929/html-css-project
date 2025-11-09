// Product listing and display logic
const products = {
    currentPage: 1,
    currentFilters: {
        category: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        sort: ''
    },

    async loadCategories() {
        try {
            const categories = await api.get('/api/products/categories/list');
            this.displayCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    displayCategories(categories) {
        const categoryFilters = document.getElementById('categoryFilters');
        if (!categoryFilters) return;

        let html = '';
        categories.forEach(category => {
            html += `
                <label>
                    <input type="checkbox" value="${category}" onchange="products.toggleCategory('${category}', this)">
                    ${category}
                </label>
            `;
        });
        categoryFilters.innerHTML = html;
    },

    toggleCategory(category, checkbox) {
        if (checkbox.checked) {
            this.currentFilters.category = category;
            // Uncheck other checkboxes
            const allCheckboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
            allCheckboxes.forEach(cb => {
                if (cb !== checkbox) cb.checked = false;
            });
        } else {
            this.currentFilters.category = '';
        }
        this.currentPage = 1;
        this.loadProducts();
    },

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.currentFilters.search = searchInput.value;
            this.currentPage = 1;
            this.loadProducts();
        }
    },

    applyFilters() {
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const sortSelect = document.getElementById('sortSelect');

        if (minPrice) this.currentFilters.minPrice = minPrice.value;
        if (maxPrice) this.currentFilters.maxPrice = maxPrice.value;
        if (sortSelect) this.currentFilters.sort = sortSelect.value;

        this.currentPage = 1;
        this.loadProducts();
    },

    clearFilters() {
        this.currentFilters = {
            category: '',
            search: '',
            minPrice: '',
            maxPrice: '',
            sort: ''
        };

        const searchInput = document.getElementById('searchInput');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const sortSelect = document.getElementById('sortSelect');
        const categoryCheckboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');

        if (searchInput) searchInput.value = '';
        if (minPrice) minPrice.value = '';
        if (maxPrice) maxPrice.value = '';
        if (sortSelect) sortSelect.value = '';
        categoryCheckboxes.forEach(cb => cb.checked = false);

        this.currentPage = 1;
        this.loadProducts();
    },

    async loadProducts(page = 1) {
        this.currentPage = page;
        const productsGrid = document.getElementById('productsGrid');
        const pagination = document.getElementById('pagination');

        if (!productsGrid) return;

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: 12
            });

            if (this.currentFilters.category) {
                params.append('category', this.currentFilters.category);
            }
            if (this.currentFilters.search) {
                params.append('search', this.currentFilters.search);
            }
            if (this.currentFilters.minPrice) {
                params.append('minPrice', this.currentFilters.minPrice);
            }
            if (this.currentFilters.maxPrice) {
                params.append('maxPrice', this.currentFilters.maxPrice);
            }
            if (this.currentFilters.sort) {
                params.append('sort', this.currentFilters.sort);
            }

            const response = await api.get(`/api/products?${params.toString()}`);
            this.displayProducts(response.products);
            this.displayPagination(response.totalPages, response.page);
        } catch (error) {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
        }
    },

    displayProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = '<p>No products found.</p>';
            return;
        }

        let html = '';
        products.forEach(product => {
            html += `
                <div class="product-card" onclick="window.location.href='/product?id=${product.id}'">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <p class="product-category">${product.category}</p>
                        <button class="btn" onclick="event.stopPropagation(); cart.addToCart(${product.id}, 1)">Add to Cart</button>
                    </div>
                </div>
            `;
        });
        productsGrid.innerHTML = html;
    },

    displayPagination(totalPages, currentPage) {
        const pagination = document.getElementById('pagination');
        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        if (currentPage > 1) {
            html += `<button onclick="products.loadProducts(${currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="${i === currentPage ? 'active' : ''}" onclick="products.loadProducts(${i})">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<span>...</span>`;
            }
        }

        // Next button
        if (currentPage < totalPages) {
            html += `<button onclick="products.loadProducts(${currentPage + 1})">Next</button>`;
        }

        pagination.innerHTML = html;
    }
};

