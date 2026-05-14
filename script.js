// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Sort Products
function sortProducts() {
    const sortOption = document.getElementById('sortOption').value;
    const products = Array.from(document.querySelectorAll('.product-card'));
    
    products.sort((a, b) => {
        if (sortOption === 'priceLow') {
            return parseInt(a.dataset.price) - parseInt(b.dataset.price);
        } else if (sortOption === 'priceHigh') {
            return parseInt(b.dataset.price) - parseInt(a.dataset.price);
        } else if (sortOption === 'ratingHigh') {
            return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        }
        return 0;
    });
    
    const container = document.getElementById('productContainer');
    products.forEach(product => {
        container.appendChild(product);
    });
}

// Filter Products
function filterProducts() {
    const genderFilter = document.getElementById('genderFilter').value;
    const colorFilter = document.getElementById('colorFilter').value;
    const priceFilter = parseInt(document.getElementById('priceFilter').value);
    
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const gender = product.dataset.gender;
        const color = product.dataset.color;
        const price = parseInt(product.dataset.price);
        
        let show = true;
        
        // Gender filter
        if (genderFilter !== 'all' && gender !== genderFilter) {
            show = false;
        }
        
        // Color filter
        if (colorFilter !== 'all' && color !== colorFilter) {
            show = false;
        }
        
        // Price filter
        if (price > priceFilter) {
            show = false;
        }
        
        product.style.display = show ? 'block' : 'none';
    });
}

// Quick Category Selection
function selectCategory(category) {
    document.getElementById('genderFilter').value = category;
    filterProducts();
    // Close sidebar if it's open
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
}

// Reset all filters
function resetFilters() {
    document.getElementById('genderFilter').value = 'all';
    document.getElementById('colorFilter').value = 'all';
    document.getElementById('priceFilter').value = '10000';
    document.getElementById('sortOption').value = '';
    filterProducts();
}
