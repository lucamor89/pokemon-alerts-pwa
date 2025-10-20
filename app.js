// Configuration
const CONFIG = {
    JSONBIN_KEY: '$2a$10$jNt7ux6m2zwkNzaePahv0.1DpYvW.QUpqrd9T81.8YjecalMAlc8K',
    JSONBIN_BADGER_URL: 'https://api.jsonbin.io/v3/b/68c6afc8ae596e708fee5eb1',
    JSONBIN_BROTHERHOOD_URL: 'https://api.jsonbin.io/v3/b/68ed7ca9ae596e708f1212e7',
    JSONBIN_MYTHIC_URL: 'https://api.jsonbin.io/v3/b/68ed7d3e43b1c97be9665da4',
    REFRESH_INTERVAL: 60000, // 60 seconds
    STORAGE_KEY: 'pokemon_stock_alerts'
};

// Product type detection
const PRODUCT_TYPES = {
    "Booster Box": ["booster box", "booster case"],
    "Elite Trainer Box": ["elite trainer box", "etb"],
    "Ultra-Premium Collection": ["ultra-premium collection", "ultra premium collection"],
    "Premium Collection": ["premium collection"],
    "Figure Collection": ["figure collection"],
    "3 Pack Blister": ["3 pack blister", "3-pack blister", "three pack"],
    "1 Pack Blister": ["1 pack blister", "1-pack blister", "single pack"],
    "Booster Bundle": ["booster bundle"],
    "Trainer's Toolkit": ["trainer's toolkit", "trainers toolkit"],
    "Battle Deck": ["battle deck"],
    "Box": ["box"]
};

const ALL_PRODUCT_TYPES = [
    "Booster Box", "Elite Trainer Box", "Ultra-Premium Collection", "Premium Collection",
    "Figure Collection", "Booster Bundle", "3 Pack Blister", "1 Pack Blister",
    "Trainer's Toolkit", "Battle Deck", "Box", "Other"
];

// Global state
let state = {
    notifications: [],
    seenIds: new Set(),
    currentCategory: null,
    lastBackPress: 0
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadLocalState();
    fetchAllNotifications();
    setupAutoRefresh();
    setupBackButton();
});

// Fetch notifications from all JSONBin stores
async function fetchAllNotifications() {
    showLoading(true);
    
    try {
        const [badger, brotherhood, mythic] = await Promise.all([
            fetchFromJSONBin(CONFIG.JSONBIN_BADGER_URL, 'Badger Badger'),
            fetchFromJSONBin(CONFIG.JSONBIN_BROTHERHOOD_URL, 'The Brotherhood Games'),
            fetchFromJSONBin(CONFIG.JSONBIN_MYTHIC_URL, 'Mythic Goblin')
        ]);

        // Combine and convert to notification format
        const allProducts = [...badger, ...brotherhood, ...mythic];
        state.notifications = allProducts.map(item => ({
            timestamp: item.first_seen || new Date().toISOString(),  // FIXED: Use first_seen from backend!
            product_name: item.name,
            product_link: item.link || '#',
            shop_name: item.shop,
            price: item.price || null,
            is_new: item.is_new || false,  // Track if product is new
            id: generateId(item.name, item.shop)
        }));

        saveLocalState();
        renderHome();
        showToast('Notifications updated!');
    } catch (error) {
        console.error('Error fetching notifications:', error);
        showToast('Failed to load notifications');
    } finally {
        showLoading(false);
    }
}

// Fetch from JSONBin
async function fetchFromJSONBin(url, shopName) {
    const response = await fetch(url, {
        headers: {
            'X-Master-Key': CONFIG.JSONBIN_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from ${shopName}`);
    }

    const data = await response.json();
    
    // NEW: Read from "products" array instead of "known_products"
    const products = data.record.products || [];
    
    return products;  // Already has name, link, price, in_stock, shop!
}

// Detect product type
function detectProductType(productName) {
    const nameLower = productName.toLowerCase();
    
    for (const [type, keywords] of Object.entries(PRODUCT_TYPES)) {
        if (type === "Box") continue;
        for (const keyword of keywords) {
            if (nameLower.includes(keyword)) {
                return type;
            }
        }
    }
    
    if (nameLower.includes("box")) {
        return "Box";
    }
    
    return "Other";
}

// Group notifications by type
function groupNotificationsByType() {
    const grouped = {};
    
    for (const type of ALL_PRODUCT_TYPES) {
        grouped[type] = [];
    }
    
    state.notifications.forEach(notif => {
        const type = detectProductType(notif.product_name);
        grouped[type].push(notif);
    });
    
    return grouped;
}

// Render home screen
function renderHome() {
    const grouped = groupNotificationsByType();
    const container = document.getElementById('categoryList');
    container.innerHTML = '';

    ALL_PRODUCT_TYPES.forEach(category => {
        const items = grouped[category];
        const unseenCount = items.filter(item => !state.seenIds.has(item.id)).length;
        const hasNew = unseenCount > 0;

        const card = document.createElement('div');
        card.className = 'category-card';
        card.onclick = () => openCategory(category);

        card.innerHTML = `
            <div class="category-name ${hasNew ? 'has-new' : ''}">${category}</div>
            <div class="category-badge">
                ${items.length > 0 ? `<span class="badge">${items.length}</span>` : ''}
                ${hasNew ? '<div class="red-dot"></div>' : ''}
            </div>
        `;

        container.appendChild(card);
    });
}

// Open category
function openCategory(category) {
    state.currentCategory = category;
    
    // Mark all in this category as seen
    const grouped = groupNotificationsByType();
    const items = grouped[category];
    items.forEach(item => state.seenIds.add(item.id));
    saveLocalState();

    renderCategoryFeed(category);
    switchScreen('categoryScreen');
}

// Render category feed
function renderCategoryFeed(category) {
    document.getElementById('categoryTitle').textContent = category;
    
    const grouped = groupNotificationsByType();
    const items = grouped[category];
    const container = document.getElementById('notificationFeed');
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">No notifications in ${category}</div>
            </div>
        `;
        return;
    }

    container.innerHTML = items.reverse().map(notif => `
        <div class="notification-card">
            <div class="notification-header">
                <div class="shop-name">🏪 ${notif.shop_name}</div>
                <div class="notification-time">🕐 ${formatDate(notif.timestamp)}</div>
            </div>
            <div class="product-name">${notif.product_name}</div>
            <div class="notification-info">
                ${notif.price ? `<span>💰 ${notif.price}</span>` : ''}
                ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
            </div>
            <a href="${notif.product_link}" class="view-product-btn" target="_blank" rel="noopener">
                🔗 View Product
            </a>
        </div>
    `).join('');
}

// Go home
function goHome() {
    state.currentCategory = null;
    renderHome();
    switchScreen('homeScreen');
}

// Switch screen
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Settings
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function confirmClearHistory() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        state.notifications = [];
        state.seenIds.clear();
        saveLocalState();
        renderHome();
        closeSettings();
        showToast('History cleared');
    }
}

// History
function openHistory() {
    const container = document.getElementById('historyContent');
    
    if (state.notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⏰</div>
                <div class="empty-state-text">No notification history</div>
            </div>
        `;
    } else {
        container.innerHTML = state.notifications.slice().reverse().map(notif => `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="shop-name">🏪 ${notif.shop_name}</div>
                    <div class="notification-time">🕐 ${formatDate(notif.timestamp)}</div>
                </div>
                <div class="product-name">${notif.product_name}</div>
                <div class="notification-info">
                    ${notif.price ? `<span>💰 ${notif.price}</span>` : ''}
                    ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
                </div>
                <a href="${notif.product_link}" class="view-product-btn" target="_blank" rel="noopener">
                    🔗 View Product
                </a>
            </div>
        `).join('');
    }
    
    document.getElementById('historyModal').classList.remove('hidden');
}

function closeHistory() {
    document.getElementById('historyModal').classList.add('hidden');
}

// Search
function openSearch() {
    document.getElementById('searchModal').classList.remove('hidden');
    document.getElementById('searchInput').focus();
}

function closeSearch() {
    document.getElementById('searchModal').classList.add('hidden');
    document.getElementById('searchInput').value = '';
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const results = document.getElementById('searchResults');
    
    if (!query) {
        results.innerHTML = '';
        return;
    }

    const filtered = state.notifications.filter(notif =>
        notif.product_name.toLowerCase().includes(query) ||
        notif.shop_name.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No results found</div>
            </div>
        `;
    } else {
        results.innerHTML = filtered.map(notif => `
            <div class="notification-card">
                <div class="notification-header">
                    <div class="shop-name">🏪 ${notif.shop_name}</div>
                    <div class="notification-time">🕐 ${formatDate(notif.timestamp)}</div>
                </div>
                <div class="product-name">${notif.product_name}</div>
                <div class="notification-info">
                    ${notif.price ? `<span>💰 ${notif.price}</span>` : ''}
                    ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
                </div>
                <a href="${notif.product_link}" class="view-product-btn" target="_blank" rel="noopener">
                    🔗 View Product
                </a>
            </div>
        `).join('');
    }
});

// Back button handling
function setupBackButton() {
    window.addEventListener('popstate', (e) => {
        if (state.currentCategory) {
            goHome();
        } else {
            // Double tap to exit
            const now = Date.now();
            if (now - state.lastBackPress < 2000) {
                // User wants to exit
                window.history.back();
            } else {
                state.lastBackPress = now;
                showToast('Press again to exit');
                // Prevent actual navigation
                window.history.pushState(null, '', window.location.href);
            }
        }
    });

    // Initialize history state
    window.history.pushState(null, '', window.location.href);
}

// Utility functions
function generateId(name, shop) {
    return `${shop}_${name}`.replace(/\s+/g, '_');
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showLoading(show) {
    document.getElementById('loadingIndicator').classList.toggle('hidden', !show);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function setupAutoRefresh() {
    setInterval(fetchAllNotifications, CONFIG.REFRESH_INTERVAL);
}

// Local storage
function saveLocalState() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
            notifications: state.notifications,
            seenIds: Array.from(state.seenIds)
        }));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
}

function loadLocalState() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            state.notifications = data.notifications || [];
            state.seenIds = new Set(data.seenIds || []);
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}
