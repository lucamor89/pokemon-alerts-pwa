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
        // Use allSettled instead of all - shows partial results even if some shops fail
        const results = await Promise.allSettled([
            fetchFromJSONBin(CONFIG.JSONBIN_BADGER_URL, 'Badger Badger'),
            fetchFromJSONBin(CONFIG.JSONBIN_BROTHERHOOD_URL, 'The Brotherhood Games'),
            fetchFromJSONBin(CONFIG.JSONBIN_MYTHIC_URL, 'Mythic Goblin')
        ]);

        // Extract successful results
        const allProducts = [];
        const failedShops = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allProducts.push(...result.value);
            } else {
                // Track which shop failed
                const shopNames = ['Badger Badger', 'The Brotherhood Games', 'Mythic Goblin'];
                failedShops.push(shopNames[index]);
                console.error(`Failed to load ${shopNames[index]}:`, result.reason);
            }
        });

        // Convert to notification format
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
        
        // Show warning if some shops failed (but don't block showing successful results)
        if (failedShops.length > 0) {
            if (failedShops.length === 3) {
                // All shops failed - show error
                showToast('⚠️ Failed to load notifications - check connection');
            } else {
                // Partial failure - show warning
                showToast(`⚠️ Could not load: ${failedShops.join(', ')}`);
            }
        }
        // No toast on success - silent background update
        
    } catch (error) {
        console.error('Error fetching notifications:', error);
        showToast('⚠️ Failed to load notifications');
    } finally {
        showLoading(false);
    }
}

// Fetch from JSONBin with timeout and retry
async function fetchFromJSONBin(url, shopName, retries = 3) {
    const TIMEOUT_MS = 10000; // 10 second timeout
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_MS)
            );
            
            // Race between fetch and timeout
            const fetchPromise = fetch(url, {
                headers: {
                    'X-Master-Key': CONFIG.JSONBIN_KEY
                }
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const products = data.record.products || [];
            
            console.log(`[${shopName}] Loaded ${products.length} products (attempt ${attempt})`);
            return products;
            
        } catch (error) {
            console.warn(`[${shopName}] Attempt ${attempt}/${retries} failed:`, error.message);
            
            // If last attempt, throw error
            if (attempt === retries) {
                throw new Error(`${shopName}: ${error.message}`);
            }
            
            // Wait before retrying (exponential backoff: 1s, 2s, 4s)
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`[${shopName}] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
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

// Navigate to notification from search
function navigateToNotification(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (!notif) return;
    
    // Find which category this notification belongs to
    const category = detectProductType(notif.product_name);
    
    // Close any open modals
    closeSearch();
    
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
        // Clear unpinned_date when pinning (user re-pinned it)
        delete notif.unpinned_date;
        showToast('Notification pinned!');
    } else {
        state.pinnedIds.delete(notifId);
        // Track when item was unpinned (for 30-day grace period)
        notif.unpinned_date = new Date().toISOString();
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

// Clear History (Manual) - Removes read & unpinned notifications
function clearHistory() {
    if (confirm('Are you sure you want to remove all read notifications? This action can\'t be undone.')) {
        const before = state.notifications.length;
        
        // Keep only: Pinned items OR Unread items
        state.notifications = state.notifications.filter(notif => {
            return notif.isPinned || notif.isUnread;
        });
        
        // Clean up orphaned IDs in seenIds (remove any that don't exist in notifications anymore)
        const notifIds = new Set(state.notifications.map(n => n.id));
        state.seenIds = new Set([...state.seenIds].filter(id => notifIds.has(id)));
        
        const removed = before - state.notifications.length;
        
        saveLocalState();
        renderHome();
        closeSettings();
        showToast(`✓ ${removed} notification${removed !== 1 ? 's' : ''} removed`);
    }
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
    // Remove all special characters that could break HTML attributes
    return `${shop}_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
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
            
            // Auto-cleanup: Run once per day
            autoCleanupOldNotifications();
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}

// Auto-cleanup: Remove notifications older than 3 months (except pinned/unread/recently unpinned)
function autoCleanupOldNotifications() {
    const LAST_CLEANUP_KEY = 'pokemon_last_cleanup';
    const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
    const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days grace period after unpinning
    
    try {
        const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);
        const today = new Date().toDateString();
        
        // Only run once per day
        if (lastCleanup === today) {
            return;
        }
        
        const before = state.notifications.length;
        const cutoffDate = new Date(Date.now() - THREE_MONTHS_MS);
        const gracePeriodCutoff = new Date(Date.now() - GRACE_PERIOD_MS);
        
        // Keep: Pinned items, Unread items, recently unpinned items, OR items newer than 3 months
        state.notifications = state.notifications.filter(notif => {
            // Always keep pinned and unread
            if (notif.isPinned || notif.isUnread) {
                return true;
            }
            
            // Keep if unpinned within last 30 days (grace period)
            if (notif.unpinned_date) {
                const unpinnedDate = new Date(notif.unpinned_date);
                if (unpinnedDate > gracePeriodCutoff) {
                    return true; // Still in grace period
                }
            }
            
            // Keep if notification itself is newer than 3 months
            const notifDate = new Date(notif.timestamp);
            return notifDate > cutoffDate;
        });
        
        // Clean up orphaned IDs
        const notifIds = new Set(state.notifications.map(n => n.id));
        state.seenIds = new Set([...state.seenIds].filter(id => notifIds.has(id)));
        
        const removed = before - state.notifications.length;
        
        if (removed > 0) {
            console.log(`[Auto-cleanup] Removed ${removed} old notification(s)`);
            saveLocalState();
        }
        
        // Mark cleanup as done for today
        localStorage.setItem(LAST_CLEANUP_KEY, today);
        
    } catch (e) {
        console.error('Auto-cleanup failed:', e);
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

// Force external browser for shop links (PWA fix - Android specific)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a.view-product-btn');
    if (link && link.href) {
        e.preventDefault();
        e.stopPropagation();
        
        const url = link.href;
        
        // For Android: Create an intent URL that forces external browser
        // This bypasses the PWA's in-app browser
        const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
        
        // Create a temporary link and click it
        const tempLink = document.createElement('a');
        tempLink.href = intentUrl;
        tempLink.style.display = 'none';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
    }
}, true); // Use capture phase
