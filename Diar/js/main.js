let storeData = { collections: [], products: [] };
let cart = [];
let wishlist = [];
let currentFilter = 'all';

const $ = id => document.getElementById(id);
const findProduct = id => storeData.products.find(p => p.id === id);
const img = (src, alt) =>
    `<img src="${src}" alt="${alt}" onerror="this.src='https://placehold.co/600x800/4A121A/C5A059?text=Deyar'">`;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/store-data.json');
        storeData = await response.json();
    } catch (error) {
        showToast('Could not load products', 'Please open this site through a local web server (see README).');
    }

    renderCollections();
    renderProducts('all');
    updateCartUI();

    $('cartBtn').onclick = toggleCart;
    $('wishlistBtn').onclick = () =>
        showToast('Wishlist', `You have ${wishlist.length} saved pieces in your favorites.`);
});

/* ---------- Collections ---------- */
function setActiveFilter(containerId, filter) {
    document.querySelectorAll(`#${containerId} .filter-btn`).forEach(btn =>
        btn.classList.toggle('active', btn.dataset.filter === filter));
}

function renderCollections(filter = 'all') {
    const collections = storeData.collections.filter(c => filter === 'all' || c.gender === filter);

    $('collectionsGrid').innerHTML = collections.map(c => `
        <div class="collection-card" onclick="renderProducts('${c.gender}')">
            ${img(c.image, c.title)}
            <div class="collection-overlay">
                <span>${c.subtitle}</span>
                <h3>${c.title}</h3>
                <span class="collection-link">Explore Collection</span>
            </div>
        </div>`).join('');

    setActiveFilter('collectionFilters', filter);
}

/* ---------- products ---------- */


function renderProducts(filter) {
    currentFilter = filter;
    const products = storeData.products.filter(p => filter === 'all' || p.gender === filter);

    $('productsGrid').innerHTML = products.map(p => `
        <div class="product-card">
            <div class="product-img-wrapper" onclick="openProductModal(${p.id})">
                ${img(p.image, p.name)}
                <button class="wishlist-toggle" aria-label="Wishlist" onclick="event.stopPropagation(); toggleWishlist(${p.id})">
                    <i class="${wishlist.includes(p.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div>
                    <div class="product-meta">
                        <span><i class="fa-solid fa-star"></i> ${p.rating} (${p.reviews})</span>
                        <span>${p.gender}'s</span>
                    </div>
                    <h3 class="product-name" onclick="openProductModal(${p.id})">${p.name}</h3>
                    <p class="product-desc">${p.description}</p>
                </div>
                <div class="product-footer">
                    <span class="product-price">${p.price} SEK</span>
                    <button class="add-to-bag-btn" onclick="addToCart(${p.id})">Add to Bag</button>
                </div>
            </div>
        </div>`).join('');

    setActiveFilter('productFilters', filter);
}

/* ---------- Product modal ---------- */
function openProductModal(id) {
    const p = findProduct(id);

    $('modalContent').innerHTML = `
        <button class="close-modal" aria-label="Close modal" onclick="closeProductModal()">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="modal-img">${img(p.image, p.name)}</div>
        <div class="modal-info">
            <div>
                <div class="modal-meta">
                    <span>${p.gender}'s • ${p.category}</span>
                    <span><i class="fa-solid fa-star"></i> ${p.rating} (${p.reviews})</span>
                </div>
                <h2>${p.name}</h2>
                <div class="modal-price">$${p.price}.00</div>
                <p class="modal-desc">${p.description}</p>
                <div class="modal-section">
                    <h4>Available Colors:</h4>
                    <div class="modal-colors">${p.colors.map(c => `<span>${c}</span>`).join('')}</div>
                </div>
                <div class="modal-section">
                    <h4>Garment Details:</h4>
                    <ul>${p.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            </div>
            <button class="btn btn-primary btn-block" onclick="addToCart(${p.id}); closeProductModal()">Add to Shopping Bag</button>
        </div>`;

    $('productModal').classList.add('active');
}

function closeProductModal() {
    $('productModal').classList.remove('active');
}

/* ---------- Wishlist ---------- */
function toggleWishlist(id) {
    const name = findProduct(id).name;

    if (wishlist.includes(id)) {
        wishlist = wishlist.filter(item => item !== id);
        showToast('Removed', `${name} removed from favorites.`);
    } else {
        wishlist.push(id);
        showToast('Saved', `${name} added to favorites.`);
    }

    $('wishlistBadge').textContent = wishlist.length;
    renderProducts(currentFilter);
}

/* ---------- Cart ---------- */
function toggleCart() {
    $('cartDrawer').classList.toggle('active');
}

function addToCart(id) {
    const product = findProduct(id);
    const item = cart.find(i => i.id === id);

    if (item) item.quantity++;
    else cart.push({ ...product, quantity: 1 });

    updateCartUI();
    showToast('Added to Bag', `${product.name} has been added to your shopping bag.`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    $('cartBadge').textContent = count;
    $('cartSubtotal').textContent = `$${subtotal}.00`;
    $('cartBody').innerHTML = cart.length
        ? cart.map(i => `
            <div class="cart-item">
                ${img(i.image, i.name)}
                <div>
                    <h4>${i.name}</h4>
                    <div class="cart-item-price">$${i.price}.00 × ${i.quantity}</div>
                </div>
                <button class="cart-remove" aria-label="Remove" onclick="removeFromCart(${i.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>`).join('')
        : '<p class="cart-empty">Your shopping bag is currently empty.</p>';
}

function checkout() {
    if (!cart.length) {
        showToast('Bag is Empty', 'Please add items to your shopping bag before checkout.');
        return;
    }
    toggleCart();
    showToast('Secure Checkout Initiated', 'Thank you for supporting Afghan women artisans with your Deyar purchase.');
    cart = [];
    updateCartUI();
}

/* ---------- Toast ---------- */
function showToast(title, description) {
    $('toastTitle').textContent = title;
    $('toastDesc').textContent = description;
    $('toast').classList.add('active');
    setTimeout(() => $('toast').classList.remove('active'), 3500);
}