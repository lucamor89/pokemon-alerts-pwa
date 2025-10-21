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
    "Booster Boxes": ["booster box", "booster case"],
    "Elite Trainer Boxes": ["elite trainer box", "etb"],
    "Ultra-Premium Collections": ["ultra-premium collection", "ultra premium collection"],
    "Premium Collections": ["premium collection"],
    "Figure Collections": ["figure collection"],
    "Tins & Mini-Tins": ["tin", "mini tin", "mini-tin"],
    "3 Pack Blisters": ["3 pack blister", "3-pack blister", "three pack"],
    "1 Pack Blisters": ["1 pack blister", "1-pack blister", "single pack"],
    "Booster Bundles": ["booster bundle"],
    "Trainer's Toolkits": ["trainer's toolkit", "trainers toolkit"],
    "Battle Decks": ["battle deck"],
    "Collection Boxes": ["box"]
};

const ALL_PRODUCT_TYPES = [
    "Booster Boxes", "Elite Trainer Boxes", "Ultra-Premium Collections", "Premium Collections",
    "Figure Collections", "Tins & Mini-Tins", "Booster Bundles", "3 Pack Blisters", "1 Pack Blisters",
    "Trainer's Toolkits", "Battle Decks", "Collection Boxes", "Other"
];

// Global state
let state = {
    notifications: [],
    seenIds: new Set(),
    pinnedIds: new Set(),
    unreadIds: new Set(),
    currentCategory: null,
    lastBackPress: 0,
    longPressTimer: null,
    longPressTarget: null,
    contextMenuOpen: false
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
        state.notifications = allProducts.map(item => {
            const id = generateId(item.name, item.shop);
            return {
                timestamp: item.first_seen || new Date().toISOString(),
                product_name: item.name,
                product_link: item.link || '#',
                shop_name: item.shop,
                price: item.price || null,
                is_new: item.is_new || false,
                id: id,
                isPinned: state.pinnedIds.has(id),
                isUnread: state.unreadIds.has(id)
            };
        });

        saveLocalState();
        renderHome();
        // No toast on success - silent background update
    } catch (error) {
        console.error('Error fetching notifications:', error);
        showToast('⚠️ Failed to load notifications');
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
    const products = data.record.products || [];
    
    return products;
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
        const unseenCount = items.filter(item => !state.seenIds.has(item.id) || item.isUnread).length;
        const hasNew = unseenCount > 0;

        const card = document.createElement('div');
        card.className = 'category-card';
        card.onclick = () => openCategory(category);

        card.innerHTML = `
            <div class="category-name ${hasNew ? 'has-new' : ''}">${category}</div>
            <div class="category-badge">
                ${unseenCount > 0 ? `<span class="badge">${unseenCount}</span>` : ''}
                ${hasNew ? '<div class="red-dot"></div>' : ''}
            </div>
        `;

        container.appendChild(card);
    });
}

// Open category
function openCategory(category, scrollToNotifId = null) {
    state.currentCategory = category;
    
    // Mark all in this category as seen (but respect unread status)
    const grouped = groupNotificationsByType();
    const items = grouped[category];
    items.forEach(item => {
        state.seenIds.add(item.id);
        // Remove from unread when viewing
        if (item.isUnread) {
            state.unreadIds.delete(item.id);
            item.isUnread = false;
        }
    });
    saveLocalState();

    renderCategoryFeed(category);
    switchScreen('categoryScreen');
    
    // Scroll to specific notification if requested
    if (scrollToNotifId) {
        setTimeout(() => {
            const element = document.querySelector(`[data-id="${scrollToNotifId}"]`);
            if (element) {
                // Scroll with proper positioning
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Highlight briefly
                element.style.transition = 'background-color 0.5s';
                element.style.backgroundColor = '#4a5568';
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 1000);
            }
        }, 300); // Longer delay to ensure DOM is ready
    }
}

// Navigate to notification from search/history
function navigateToNotification(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (!notif) return;
    
    // Find which category this notification belongs to
    const category = detectProductType(notif.product_name);
    
    // Close any open modals
    closeSearch();
    closeHistory();
    
    // Open the category and scroll to the notification
    openCategory(category, notifId);
}

// Render category feed
function renderCategoryFeed(category) {
    document.getElementById('categoryTitle').textContent = category;
    
    const grouped = groupNotificationsByType();
    let items = grouped[category];
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

    // Sort: Pinned first, then by timestamp (newest first)
    items = sortNotifications(items);

    container.innerHTML = items.map(notif => `
        <div class="notification-card" data-id="${notif.id}">
            ${notif.isPinned ? '<div class="pin-indicator">📌 Pinned</div>' : ''}
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
    
    // Double requestAnimationFrame for more reliable DOM readiness
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            attachNotificationListeners(container);
        });
    });
}

// Attach event listeners to notification cards (for category feeds)
function attachNotificationListeners(container) {
    const cards = container.querySelectorAll('.notification-card');
    
    cards.forEach(card => {
        const notifId = card.getAttribute('data-id');
        if (!notifId) {
            return;
        }
        
        // Create handler functions
        const handleStart = (e) => {
            // Don't trigger on links or buttons
            if (e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            handleLongPressStart(e, notifId);
        };
        
        const handleEnd = () => {
            handleLongPressEnd();
        };
        
        // Remove any existing listeners (clean slate)
        card.removeEventListener('mousedown', handleStart);
        card.removeEventListener('touchstart', handleStart);
        card.removeEventListener('mouseup', handleEnd);
        card.removeEventListener('touchend', handleEnd);
        card.removeEventListener('mouseleave', handleEnd);
        card.removeEventListener('touchcancel', handleEnd);
        
        // Add fresh listeners
        card.addEventListener('mousedown', handleStart);
        card.addEventListener('touchstart', handleStart, { passive: false });
        card.addEventListener('mouseup', handleEnd);
        card.addEventListener('touchend', handleEnd);
        card.addEventListener('mouseleave', handleEnd);
        card.addEventListener('touchcancel', handleEnd);
        
        // Handle links separately
        const link = card.querySelector('.view-product-btn');
        if (link) {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                handleLongPressEnd();
            });
        }
    });
}

// Sort notifications: Pinned first, then by date
function sortNotifications(items) {
    return items.sort((a, b) => {
        // Pinned items come first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Within same pin status, sort by timestamp (newest first)
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
}

// Long-press handling
function handleLongPressStart(event, notifId) {
    event.preventDefault();
    
    state.longPressTarget = notifId;
    state.longPressTimer = setTimeout(() => {
        showContextMenu(notifId);
    }, 500); // 500ms hold to trigger
}

function handleLongPressEnd() {
    if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
    }
}

// Show context menu
function showContextMenu(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (!notif) return;

    // Haptic feedback (vibration)
    if ('vibrate' in navigator) {
        navigator.vibrate(50); // 50ms vibration
    }

    const menu = document.getElementById('contextMenu');
    const menuTitle = document.getElementById('contextMenuTitle');
    const menuOptions = document.getElementById('contextMenuOptions');

    menuTitle.textContent = notif.product_name.substring(0, 50) + (notif.product_name.length > 50 ? '...' : '');

    const pinText = notif.isPinned ? '📌 Unpin Notification' : '📌 Pin Notification';
    
    menuOptions.innerHTML = `
        <div class="context-option" onclick="togglePin('${notifId}')">
            ${pinText}
        </div>
        <div class="context-option" onclick="markAsUnread('${notifId}')">
            👁️ Mark as Unread
        </div>
    `;

    menu.classList.remove('hidden');
    state.contextMenuOpen = true;
}

function closeContextMenu() {
    const menu = document.getElementById('contextMenu');
    menu.classList.add('hidden');
    state.contextMenuOpen = false;
}

// Toggle pin
function togglePin(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (!notif) return;

    notif.isPinned = !notif.isPinned;
    
    if (notif.isPinned) {
        state.pinnedIds.add(notifId);
        showToast('Notification pinned!');
    } else {
        state.pinnedIds.delete(notifId);
        showToast('Notification unpinned!');
    }

    saveLocalState();
    
    // Re-render current view
    if (state.currentCategory) {
        renderCategoryFeed(state.currentCategory);
    }
    
    closeContextMenu();
}

// Mark as unread
function markAsUnread(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (!notif) return;

    notif.isUnread = true;
    state.unreadIds.add(notifId);
    
    saveLocalState();
    renderHome(); // Update badge counts
    showToast('Marked as unread!');
    
    closeContextMenu();
}

// Go home
function goHome() {
    state.currentCategory = null;
    renderHome();
    switchScreen('homeScreen');
}

// Switch screen
function switchScreen(screenId) {
    // Remove active from all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        // Force reset transform
        screen.style.transform = '';
    });
    
    // Activate target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        // Force correct transform
        targetScreen.style.transform = 'translateX(0)';
        // Reset scroll position
        const content = targetScreen.querySelector('.content');
        if (content) {
            content.scrollTop = 0;
        }
    }
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
        state.pinnedIds.clear();
        state.unreadIds.clear();
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
        const sortedNotifs = sortNotifications([...state.notifications]);
        container.innerHTML = sortedNotifs.map(notif => `
            <div class="notification-card search-result" data-navigate-id="${notif.id}">
                ${notif.isPinned ? '<div class="pin-indicator">📌 Pinned</div>' : ''}
                <div class="notification-header">
                    <div class="shop-name">🏪 ${notif.shop_name}</div>
                    <div class="notification-time">🕐 ${formatDate(notif.timestamp)}</div>
                </div>
                <div class="product-name">${notif.product_name}</div>
                <div class="notification-info">
                    ${notif.price ? `<span>💰 ${notif.price}</span>` : ''}
                    ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
                </div>
                <div class="tap-hint">👆 Tap to view in category</div>
            </div>
        `).join('');
        
        // Add click listeners to history cards
        container.querySelectorAll('.search-result').forEach(card => {
            card.addEventListener('click', function(e) {
                const notifId = this.getAttribute('data-navigate-id');
                if (notifId) {
                    navigateToNotification(notifId);
                }
            });
        });
    }
    
    document.getElementById('historyModal').classList.remove('hidden');
}

function closeHistory() {
    document.getElementById('historyModal').classList.add('hidden');
}

// Search
function openSearch() {
    document.getElementById('searchModal').classList.remove('hidden');
    const searchInput = document.getElementById('searchInput');
    searchInput.focus();
    
    // Dismiss keyboard when user presses Enter/Go
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchInput.blur(); // Dismiss keyboard
        }
    });
}

function closeSearch() {
    document.getElementById('searchModal').classList.add('hidden');
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const results = document.getElementById('searchResults');
    
    if (!query) {
        results.innerHTML = '';
        return;
    }

    let filtered = [];

    // Check for special commands
    if (query === '/unread') {
        filtered = state.notifications.filter(notif => 
            !state.seenIds.has(notif.id) || notif.isUnread
        );
    } else if (query === '/pinned') {
        filtered = state.notifications.filter(notif => notif.isPinned);
    } else {
        // Normal search
        filtered = state.notifications.filter(notif =>
            notif.product_name.toLowerCase().includes(query) ||
            notif.shop_name.toLowerCase().includes(query)
        );
    }

    if (filtered.length === 0) {
        results.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No results found</div>
            </div>
        `;
    } else {
        const sortedFiltered = sortNotifications(filtered);
        results.innerHTML = sortedFiltered.map(notif => `
            <div class="notification-card search-result" data-navigate-id="${notif.id}">
                ${notif.isPinned ? '<div class="pin-indicator">📌 Pinned</div>' : ''}
                <div class="notification-header">
                    <div class="shop-name">🏪 ${notif.shop_name}</div>
                    <div class="notification-time">🕐 ${formatDate(notif.timestamp)}</div>
                </div>
                <div class="product-name">${notif.product_name}</div>
                <div class="notification-info">
                    ${notif.price ? `<span>💰 ${notif.price}</span>` : ''}
                    ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
                </div>
                <div class="tap-hint">👆 Tap to view in category</div>
            </div>
        `).join('');
        
        // Add click listeners to search result cards
        results.querySelectorAll('.search-result').forEach(card => {
            card.addEventListener('click', function(e) {
                const notifId = this.getAttribute('data-navigate-id');
                if (notifId) {
                    navigateToNotification(notifId);
                }
            });
        });
    }
});

// Back button handling
function setupBackButton() {
    window.addEventListener('popstate', (e) => {
        // Priority 1: If context menu is open, close it
        if (state.contextMenuOpen) {
            closeContextMenu();
            // Prevent default navigation
            window.history.pushState(null, '', window.location.href);
            return;
        }
        
        // Priority 2: If in a category, go back to home
        if (state.currentCategory) {
            goHome();
            // Prevent default navigation - we handle it ourselves
            window.history.pushState(null, '', window.location.href);
            return;
        }
        
        // Priority 3: If on home screen, double-tap to exit
        const now = Date.now();
        if (now - state.lastBackPress < 2000) {
            // User pressed back twice quickly - let them exit
            // Don't prevent navigation this time
            return;
        } else {
            // First back press on home - show toast
            state.lastBackPress = now;
            showToast('Press back again to exit');
            // Prevent actual navigation
            window.history.pushState(null, '', window.location.href);
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
    const spinner = document.getElementById('headerSpinner');
    if (spinner) {
        spinner.classList.toggle('hidden', !show);
    }
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
            seenIds: Array.from(state.seenIds),
            pinnedIds: Array.from(state.pinnedIds),
            unreadIds: Array.from(state.unreadIds)
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
            state.pinnedIds = new Set(data.pinnedIds || []);
            state.unreadIds = new Set(data.unreadIds || []);
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}

// Service Worker Registration with Force Update
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pokemon-alerts-pwa/service-worker.js')
        .then(registration => {
            console.log('[App] Service Worker registered');
            
            // Force check for updates on every page load
            registration.update();
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[App] New service worker found, installing...');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[App] New version available, reloading...');
                        // Tell the new SW to take over immediately
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            });
            
            // Reload when new SW takes control
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[App] New service worker activated, reloading page...');
                window.location.reload();
            });
        })
        .catch(err => console.error('[App] Service Worker registration failed:', err));
}
