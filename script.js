// ===============================================
// GLOBAL STATE & VARIABLES
// ===============================================
let cart = JSON.parse(localStorage.getItem('azorCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('azorWishlist')) || [];
let currentQuickViewId = null;
let currentQuickViewQty = 1;

// ===============================================
// INITIALIZATION
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistCount();
    setupEventListeners();
    updatePriceDisplay();
});

function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('keyup', handleSearch);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Prevent body scroll when modal is open
    document.querySelectorAll('.modal').forEach(modal => {
        const observer = new MutationObserver(function() {
            if (modal.classList.contains('active')) {
                document.body.classList.add('no-scroll');
            } else {
                document.body.classList.remove('no-scroll');
            }
        });
        observer.observe(modal, { attributes: true });
    });
}

// ===============================================
// NAVBAR & MENU FUNCTIONS
// ===============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebarFilter');
    sidebar.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebarFilter');
    sidebar.classList.remove('active');
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('navLinks').classList.remove('active');
    }
}

// ===============================================
// SEARCH FUNCTIONALITY
// ===============================================
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const title = product.querySelector('h3').textContent.toLowerCase();
        const matches = title.includes(searchTerm);
        product.style.display = matches || searchTerm === '' ? 'block' : 'none';
    });

    updateResultsCount();
}

// ===============================================
// FILTERING & SORTING
// ===============================================
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const colorFilter = document.getElementById('colorFilter').value;
    const priceFilter = parseInt(document.getElementById('priceFilter').value);
    const ratingFilter = parseFloat(document.getElementById('ratingFilter').value);
    
    const products = document.querySelectorAll('.product-card');
    let visibleCount = 0;
    
    products.forEach(product => {
        const gender = product.dataset.gender;
        const color = product.dataset.color;
        const price = parseInt(product.dataset.price);
        const rating = parseFloat(product.dataset.rating);
        
        let show = true;
        
        if (categoryFilter !== 'all' && gender !== categoryFilter) {
            show = false;
        }
        
        if (colorFilter !== 'all' && color !== colorFilter) {
            show = false;
        }
        
        if (price > priceFilter) {
            show = false;
        }
        
        if (ratingFilter !== 'all' && rating < ratingFilter) {
            show = false;
        }
        
        product.style.display = show ? 'block' : 'none';
        if (show) visibleCount++;
    });

    updateResultsCount();
}

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
        } else if (sortOption === 'newest') {
            return parseInt(b.dataset.id) - parseInt(a.dataset.id);
        }
        return 0;
    });
    
    const container = document.getElementById('productContainer');
    products.forEach(product => {
        container.appendChild(product);
    });
}

function resetFilters() {
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('colorFilter').value = 'all';
    document.getElementById('priceFilter').value = '10000';
    document.getElementById('ratingFilter').value = 'all';
    document.getElementById('sortOption').value = '';
    document.getElementById('searchInput').value = '';
    filterProducts();
    updatePriceDisplay();
}

function updateResultsCount() {
    const visibleProducts = document.querySelectorAll('.product-card[style="display: block"]').length;
    const totalProducts = document.querySelectorAll('.product-card').length;
    const countElement = document.getElementById('resultsCount');
    
    if (visibleProducts === 0) {
        countElement.textContent = 'No products found';
    } else {
        countElement.textContent = `Showing ${visibleProducts} of ${totalProducts} products`;
    }
}

function updatePriceDisplay() {
    const priceInput = document.getElementById('priceFilter');
    const priceValue = document.getElementById('priceValue');
    priceValue.textContent = priceInput.value;
}

document.getElementById('priceFilter')?.addEventListener('input', updatePriceDisplay);

// ===============================================
// QUICK VIEW MODAL
// ===============================================
function openQuickView(id, title, price, image, rating, reviews) {
    currentQuickViewId = id;
    currentQuickViewQty = 1;
    
    document.getElementById('qvTitle').textContent = title;
    document.getElementById('qvPrice').textContent = price;
    document.getElementById('qvImage').src = image;
    document.getElementById('qvRating').textContent = `⭐ ${rating}`;
    document.getElementById('qvReviews').textContent = `(${reviews} reviews)`;
    document.getElementById('qvQty').value = 1;
    
    document.getElementById('quickViewModal').classList.add('active');
}

function closeQuickView() {
    document.getElementById('quickViewModal').classList.remove('active');
}

function increaseQty() {
    const input = document.getElementById('qvQty');
    if (parseInt(input.value) < 10) {
        input.value = parseInt(input.value) + 1;
        currentQuickViewQty = parseInt(input.value);
    }
}

function decreaseQty() {
    const input = document.getElementById('qvQty');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        currentQuickViewQty = parseInt(input.value);
    }
}

function addFromQuickView() {
    const title = document.getElementById('qvTitle').textContent;
    const priceText = document.getElementById('qvPrice').textContent;
    const price = parseInt(priceText.replace('₹', '').replace(',', ''));
    const image = document.getElementById('qvImage').src;
    const qty = parseInt(document.getElementById('qvQty').value);
    
    for (let i = 0; i < qty; i++) {
        addToCart(currentQuickViewId, title, price, image);
    }
    
    closeQuickView();
    openCart();
}

// ===============================================
// CART FUNCTIONS
// ===============================================
function addToCart(id, title, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            title: title,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${title} added to cart!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    displayCartItems();
}

function updateCartQuantity(id, quantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        updateCartCount();
        displayCartItems();
    }
}

function displayCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartSummary.style.display = 'none';
        return;
    }
    
    cartSummary.style.display = 'block';
    let itemsHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
                </div>
            </div>
        `;
    });
    
    cartItemsDiv.innerHTML = itemsHTML;
    updateCartSummary(subtotal);
}

function updateCartSummary(subtotal) {
    const shipping = subtotal > 0 ? 100 : 0;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = '₹' + subtotal.toLocaleString();
    document.getElementById('shipping').textContent = '₹' + shipping.toLocaleString();
    document.getElementById('total').textContent = '₹' + total.toLocaleString();
    
    // Also update checkout summary
    document.getElementById('checkoutSubtotal').textContent = '₹' + subtotal.toLocaleString();
    document.getElementById('checkoutShipping').textContent = '₹' + shipping.toLocaleString();
    document.getElementById('checkoutTotal').textContent = '₹' + total.toLocaleString();
}

function saveCart() {
    localStorage.setItem('azorCart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function openCart() {
    displayCartItems();
    document.getElementById('cartModal').classList.add('active');
}

function closeCart() {
    document.getElementById('cartModal').classList.remove('active');
}

function proceedToCheckout() {
    closeCart();
    document.getElementById('checkoutModal').classList.add('active');
    displayCheckoutItems();
}

function displayCheckoutItems() {
    const checkoutItemsDiv = document.getElementById('checkoutItems');
    let itemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        itemsHTML += `
            <div class="checkout-item">
                <span>${item.title} (x${item.quantity})</span>
                <span>₹${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    checkoutItemsDiv.innerHTML = itemsHTML || '<p style="text-align: center; color: #999;">No items in cart</p>';
}

// ===============================================
// LOGIN & SIGNUP
// ===============================================
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('navLinks').classList.remove('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Store user info in localStorage
    localStorage.setItem('azorUser', JSON.stringify({ email: email, loggedIn: true }));
    
    showNotification('Logged in successfully!');
    closeLoginModal();
    
    // Update UI to show user is logged in
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    localStorage.setItem('azorUser', JSON.stringify({ 
        name: name, 
        email: email, 
        loggedIn: true 
    }));
    
    showNotification('Account created successfully!');
    closeLoginModal();
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// ===============================================
// CHECKOUT
// ===============================================
function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Generate order ID
    const orderId = 'AZR' + Date.now();
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Show success modal
    document.getElementById('orderId').textContent = orderId;
    closeCheckout();
    document.getElementById('orderSuccessModal').classList.add('active');
}

function closeOrderSuccess() {
    document.getElementById('orderSuccessModal').classList.remove('active');
    openCart();
}

// ===============================================
// WISHLIST
// ===============================================
function toggleWishlist(button, id) {
    const index = wishlist.indexOf(id);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        button.classList.remove('active');
    } else {
        wishlist.push(id);
        button.classList.add('active');
    }
    
    localStorage.setItem('azorWishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

function updateWishlistCount() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
    
    // Update active state for all wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach((btn, index) => {
        const productId = parseInt(btn.closest('.product-card').dataset.id);
        if (wishlist.includes(productId)) {
            btn.classList.add('active');
        }
    });
}

function showWishlist() {
    const wishlistItemsDiv = document.getElementById('wishlistItems');
    
    if (wishlist.length === 0) {
        wishlistItemsDiv.innerHTML = '<p class="empty-wishlist">Your wishlist is empty</p>';
    } else {
        let itemsHTML = '';
        
        wishlist.forEach(id => {
            const product = document.querySelector(`[data-id="${id}"]`);
            if (product) {
                const title = product.querySelector('h3').textContent;
                const image = product.querySelector('img').src;
                const price = product.querySelector('.price').textContent;
                
                itemsHTML += `
                    <div class="wishlist-item">
                        <img src="${image}" alt="${title}" class="wishlist-item-image">
                        <div class="wishlist-item-name">${title}</div>
                    </div>
                `;
            }
        });
        
        wishlistItemsDiv.innerHTML = itemsHTML;
    }
    
    document.getElementById('wishlistModal').classList.add('active');
}

function closeWishlistModal() {
    document.getElementById('wishlistModal').classList.remove('active');
}

// ===============================================
// NOTIFICATIONS
// ===============================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 400;
        animation: slideInDown 0.3s ease-out;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// ===============================================
// NEWSLETTER
// ===============================================
function subscribeNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification(`Newsletter subscription confirmed for ${email}!`);
    e.target.reset();
}

// ===============================================
// INITIALIZATION ON PAGE LOAD
// ===============================================
window.addEventListener('load', function() {
    updateResultsCount();
    filterProducts();
    updateWishlistCount();
});
