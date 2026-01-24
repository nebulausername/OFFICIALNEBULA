// API Base URL
const API_BASE = '/api';

// Auth Token
let authToken = localStorage.getItem('authToken');

// State
let currentView = 'overview';
let categories = [];
let products = [];
let orders = [];
let customers = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
        loadAllData();
    } else {
        showLogin();
    }

    setupEventListeners();
});

function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Add Product Button
    document.getElementById('addProductBtn').addEventListener('click', openAddProductModal);

    // Product Form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    // Order Filter
    document.getElementById('orderStatusFilter').addEventListener('change', filterOrders);
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadAllData();
        } else {
            errorDiv.textContent = data.message || 'Login fehlgeschlagen';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Verbindungsfehler';
        errorDiv.classList.add('show');
    }
}

function handleLogout() {
    authToken = null;
    localStorage.removeItem('authToken');
    showLogin();
}

function showLogin() {
    document.getElementById('dashboardPage').classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');
}

// View Switching
function switchView(view) {
    currentView = view;

    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === view) {
            item.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');

    // Load view-specific data
    switch (view) {
        case 'overview':
            loadOverview();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
    }
}

// Load All Data
async function loadAllData() {
    await Promise.all([
        loadCategories(),
        loadProducts(),
        loadOrders(),
        loadCustomers(),
    ]);
    loadOverview();
}

// API Fetch Helper
async function apiFetch(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    if (response.status === 401) {
        handleLogout();
        throw new Error('Unauthorized');
    }

    return response.json();
}

// Load Categories
async function loadCategories() {
    try {
        const data = await apiFetch('/categories');
        categories = data.categories || [];

        // Populate category dropdown
        const select = document.getElementById('productCategory');
        select.innerHTML = '<option value="">Kategorie wählen</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load Products
async function loadProducts() {
    try {
        const data = await apiFetch('/products');
        products = data.products || [];
        renderProductsTable();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProductsTable() {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        const price = parseFloat(product.price);

        tr.innerHTML = `
            <td>
                ${product.cover_image
                ? `<img src="${product.cover_image}" class="product-img" alt="${product.name}">`
                : '<div class="product-img" style="background: var(--dark-light);"></div>'}
            </td>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>€${price.toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td>${product.category?.name || '-'}</td>
            <td>
                <button class="action-btn" onclick="editProduct('${product.id}')">Bearbeiten</button>
                <button class="action-btn action-btn-danger" onclick="deleteProduct('${product.id}')">Löschen</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load Orders
async function loadOrders() {
    try {
        const data = await apiFetch('/requests'); // Using Request model
        orders = data.requests || [];
        renderOrdersTable();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderOrdersTable(filteredOrders = null) {
    const tbody = document.querySelector('#ordersTable tbody');
    tbody.innerHTML = '';

    const ordersToRender = filteredOrders || orders;

    ordersToRender.forEach(order => {
        const tr = document.createElement('tr');
        const total = parseFloat(order.total_sum);
        const date = new Date(order.created_at).toLocaleDateString('de-DE');
        const itemCount = order.request_items?.length || 0;

        tr.innerHTML = `
            <td>#${order.id.substring(0, 8)}</td>
            <td>${order.user?.full_name || order.user?.username || 'Unbekannt'}</td>
            <td>${itemCount} Artikel</td>
            <td>€${total.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${formatStatus(order.status)}</span></td>
            <td>${date}</td>
            <td>
                <button class="action-btn" onclick="viewOrder('${order.id}')">Details</button>
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="margin-left: 0.5rem; padding: 0.4rem; border-radius: 6px; background: var(--dark-light); color: var(--text); border: 1px solid var(--border);">
                    <option value="">Status ändern</option>
                    <option value="pending">Ausstehend</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="processing">In Bearbeitung</option>
                    <option value="shipped">Versendet</option>
                    <option value="completed">Abgeschlossen</option>
                    <option value="cancelled">Storniert</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterOrders() {
    const status = document.getElementById('orderStatusFilter').value;
    if (!status) {
        renderOrdersTable();
    } else {
        const filtered = orders.filter(o => o.status === status);
        renderOrdersTable(filtered);
    }
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Ausstehend',
        'confirmed': 'Bestätigt',
        'processing': 'In Bearbeitung',
        'shipped': 'Versendet',
        'completed': 'Abgeschlossen',
        'cancelled': 'Storniert',
    };
    return statusMap[status] || status;
}

// Load Customers
async function loadCustomers() {
    try {
        const data = await apiFetch('/users');
        customers = data.users || [];
        renderCustomersTable();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function renderCustomersTable() {
    const tbody = document.querySelector('#customersTable tbody');
    tbody.innerHTML = '';

    customers.forEach(customer => {
        const tr = document.createElement('tr');
        const date = new Date(customer.created_at).toLocaleDateString('de-DE');
        const orderCount = customer._count?.requests || 0;

        tr.innerHTML = `
            <td>${customer.telegram_id || '-'}</td>
            <td>${customer.full_name || '-'}</td>
            <td>@${customer.username || '-'}</td>
            <td>${orderCount}</td>
            <td>${date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Load Overview
function loadOverview() {
    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => {
        return sum + parseFloat(order.total_sum || 0);
    }, 0);

    const totalOrders = orders.length;
    const totalCustomers = customers.length;

    // Find top product
    const productSales = {};
    orders.forEach(order => {
        order.request_items?.forEach(item => {
            if (!productSales[item.name_snapshot]) {
                productSales[item.name_snapshot] = 0;
            }
            productSales[item.name_snapshot] += item.quantity_snapshot;
        });
    });

    const topProduct = Object.keys(productSales).length > 0
        ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b)
        : '-';

    // Update stats
    document.getElementById('totalRevenue').textContent = `€${totalRevenue.toFixed(2)}`;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('topProduct').textContent = topProduct;

    // Recent orders
    const recentOrders = [...orders].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    ).slice(0, 5);

    const tbody = document.querySelector('#recentOrdersTable tbody');
    tbody.innerHTML = '';

    recentOrders.forEach(order => {
        const tr = document.createElement('tr');
        const total = parseFloat(order.total_sum);
        const date = new Date(order.created_at).toLocaleDateString('de-DE');

        tr.innerHTML = `
            <td>#${order.id.substring(0, 8)}</td>
            <td>${order.user?.full_name || order.user?.username || 'Unbekannt'}</td>
            <td>€${total.toFixed(2)}</td>
            <td><span class="status-badge status-${order.status}">${formatStatus(order.status)}</span></td>
            <td>${date}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Product Modal Functions
function openAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Neues Produkt';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

window.closeProductModal = closeProductModal;

async function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productModalTitle').textContent = 'Produkt bearbeiten';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productSku').value = product.sku;
    document.getElementById('productPrice').value = parseFloat(product.price);
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productCategory').value = product.category_id || '';
    document.getElementById('productImageUrl').value = product.cover_image || '';

    document.getElementById('productModal').classList.add('active');
}

window.editProduct = editProduct;

async function handleProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('productId').value;
    const data = {
        name: document.getElementById('productName').value,
        sku: document.getElementById('productSku').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value,
        category_id: document.getElementById('productCategory').value || null,
        cover_image: document.getElementById('productImageUrl').value || null,
        in_stock: parseInt(document.getElementById('productStock').value) > 0,
    };

    try {
        if (id) {
            // Update
            await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        } else {
            // Create
            await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        }

        closeProductModal();
        await loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Fehler beim Speichern');
    }
}

async function deleteProduct(id) {
    if (!confirm('Produkt wirklich löschen?')) return;

    try {
        await apiFetch(`/products/${id}`, {
            method: 'DELETE',
        });
        await loadProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Fehler beim Löschen');
    }
}

window.deleteProduct = deleteProduct;

// Order Functions
async function viewOrder(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const total = parseFloat(order.total_sum);
    const date = new Date(order.created_at).toLocaleString('de-DE');
    const contactInfo = order.contact_info || {};

    let itemsHtml = '';
    order.request_items?.forEach(item => {
        const price = parseFloat(item.price_snapshot);
        const subtotal = price * item.quantity_snapshot;
        itemsHtml += `
            <div class="order-item">
                <strong>${item.name_snapshot}</strong><br>
                ${item.quantity_snapshot}x €${price.toFixed(2)} = €${subtotal.toFixed(2)}
            </div>
        `;
    });

    document.getElementById('orderDetails').innerHTML = `
        <p><strong>Bestellnummer:</strong> #${order.id.substring(0, 8)}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${formatStatus(order.status)}</span></p>
        <p><strong>Datum:</strong> ${date}</p>
        <p><strong>Kunde:</strong> ${order.user?.full_name || order.user?.username || 'Unbekannt'}</p>
        <p><strong>Gesamt:</strong> €${total.toFixed(2)}</p>
        
        <h3>Kontaktdaten</h3>
        <p><strong>Name:</strong> ${contactInfo.name || '-'}</p>
        <p><strong>Adresse:</strong> ${contactInfo.street || '-'}, ${contactInfo.city || '-'}</p>
        <p><strong>Telegram:</strong> ${contactInfo.telegram || '-'}</p>
        
        <h3>Bestellte Artikel</h3>
        ${itemsHtml}
        
        ${order.note ? `<h3>Notiz</h3><p>${order.note}</p>` : ''}
    `;

    document.getElementById('orderModal').classList.add('active');
}

window.viewOrder = viewOrder;

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

window.closeOrderModal = closeOrderModal;

async function updateOrderStatus(id, status) {
    if (!status) return;

    try {
        await apiFetch(`/requests/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        await loadOrders();
        await loadOverview();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Fehler beim Aktualisieren');
    }
}

window.updateOrderStatus = updateOrderStatus;
