// Configuration
const CONFIG = {
    JSONBIN_KEY: '$2a$10$jNt7ux6m2zwkNzaePahv0.1DpYvW.QUpqrd9T81.8YjecalMAlc8K',
    JSONBIN_BADGER_URL: 'https://api.jsonbin.io/v3/b/68c6afc8ae596e708fee5eb1',
    JSONBIN_BROTHERHOOD_URL: 'https://api.jsonbin.io/v3/b/68ed7ca9ae596e708f1212e7',
    JSONBIN_MYTHIC_URL: 'https://api.jsonbin.io/v3/b/68ed7d3e43b1c97be9665da4',
    REFRESH_INTERVAL: 60000, // 60 seconds
    STORAGE_KEY: 'pokemon_stock_alerts',
    VAPID_PUBLIC_KEY: 'BIbQyAj8Aoma4B5dqJcs89To6JI3O38t5uFzWQVGVil4F3Bxw0DBYdnKKCLlznFmtC-Ob6bPynMC-K-I3S1zSz8'
};

// Lucide Icons - SVG Helper Functions
const icons = {
    settings: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    search: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    store: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>',
    clock: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    poundSterling: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 7c0-5.333-8-5.333-8 0"/><path d="M10 7v14"/><path d="M6 21h12"/><path d="M6 13h10"/></svg>',
    pin: '<svg class="icon-svg" viewBox="0 0 24 24"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>',
    link: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    trash: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    bell: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
    info: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    package: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>'
};

function getIcon(name, className = '') {
    return icons[name] ? icons[name].replace('class="icon-svg"', `class="icon-svg ${className}"`) : '';
}


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
    loadThemePreference(); // Load theme before anything else
    loadLocalState();
    fetchAllNotifications();
    setupAutoRefresh();
    setupBackButton();
    checkPushPermission(); // Check push notification permission state
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
                <div class="empty-state-icon">
                    <svg class="icon-svg" style="width: 48px; height: 48px;" viewBox="0 0 24 24"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
                </div>
                <div class="empty-state-text">No notifications in ${category}</div>
            </div>
        `;
        return;
    }

    // Sort: Pinned first, then by timestamp (newest first)
    items = sortNotifications(items);

    container.innerHTML = items.map(notif => `
        <div class="notification-card" data-id="${notif.id}">
            ${notif.isPinned ? '<div class="pin-indicator"><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg> Pinned</div>' : ''}
            <div class="notification-header">
                <div class="shop-name"><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg> ${notif.shop_name}</div>
                <div class="notification-time"><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${formatDate(notif.timestamp)}</div>
            </div>
            <div class="product-name">${notif.product_name}</div>
            <div class="notification-info">
                ${notif.price ? `<span><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><path d="M18 7c0-5.333-8-5.333-8 0"/><path d="M10 7v14"/><path d="M6 21h12"/><path d="M6 13h10"/></svg> ${notif.price}</span>` : ''}
                ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
            </div>
            <a href="${notif.product_link}" class="view-product-btn" target="_blank" rel="noopener">
                <svg class="icon-svg inline-icon" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> View Product
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

    const pinIcon = '<svg class="icon-svg inline-icon" viewBox="0 0 24 24"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
    const pinText = notif.isPinned ? `${pinIcon} Unpin Notification` : `${pinIcon} Pin Notification`;
    
    menuOptions.innerHTML = `
        <div class="context-option" onclick="togglePin('${notifId}')">
            ${pinText}
        </div>
        <div class="context-option" onclick="markAsUnread('${notifId}')">
            <svg class="icon-svg inline-icon" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> Mark as Unread
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

// Theme Toggle (Dark/Light Mode)
function toggleTheme() {
    const body = document.body;
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');
    
    // Get checkbox state (it's already toggled by the user click)
    const isLightMode = toggle.checked;
    
    // Apply theme
    if (isLightMode) {
        body.classList.add('light-mode');
        label.textContent = 'Light';
    } else {
        body.classList.remove('light-mode');
        label.textContent = 'Dark';
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

// Load theme preference on startup
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');
    
    // Default to dark mode if no preference saved
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (toggle) toggle.checked = true;
        if (label) label.textContent = 'Light';
    } else {
        document.body.classList.remove('light-mode');
        if (toggle) toggle.checked = false;
        if (label) label.textContent = 'Dark';
    }
}

// Push Notifications Toggle
async function togglePushNotifications() {
    const toggle = document.getElementById('pushToggle');
    const label = document.getElementById('pushLabel');
    const isEnabled = toggle.checked;
    
    if (isEnabled) {
        // User wants to enable push notifications
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // Subscribe to push notifications
                await subscribeToPush();
                label.textContent = 'On';
                localStorage.setItem('pushNotifications', 'enabled');
                showToast('✓ Push notifications enabled');
            } else {
                // Permission denied
                toggle.checked = false;
                label.textContent = 'Off';
                localStorage.setItem('pushNotifications', 'disabled');
                showToast('Push notifications blocked - check browser settings');
            }
        } catch (error) {
            console.error('Push notification error:', error);
            toggle.checked = false;
            label.textContent = 'Off';
            showToast('Failed to enable push notifications');
        }
    } else {
        // User wants to disable push notifications
        await unsubscribeFromPush();
        label.textContent = 'Off';
        localStorage.setItem('pushNotifications', 'disabled');
        showToast('Push notifications disabled');
    }
}

// Subscribe to push notifications
async function subscribeToPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            // Create new subscription
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY || '')
            });
            
            console.log('[Push] Subscribed:', subscription.endpoint);
            
            // Send subscription to backend server
            try {
                const response = await fetch('https://your-render-url.onrender.com/api/subscribe', {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    console.log('[Push] Subscription sent to backend');
                } else {
                    console.error('[Push] Failed to send subscription to backend:', response.status);
                }
            } catch (error) {
                console.error('[Push] Error sending subscription to backend:', error);
            }
        }
        
        return subscription;
    } catch (error) {
        console.error('[Push] Subscription failed:', error);
        throw error;
    }
}

// Unsubscribe from push notifications
async function unsubscribeFromPush() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
            await subscription.unsubscribe();
            console.log('[Push] Unsubscribed');
            
            // Remove subscription from backend server
            try {
                const response = await fetch('https://your-render-url.onrender.com/api/unsubscribe', {
                    method: 'POST',
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                    console.log('[Push] Subscription removed from backend');
                } else {
                    console.error('[Push] Failed to remove subscription from backend:', response.status);
                }
            } catch (error) {
                console.error('[Push] Error removing subscription from backend:', error);
            }
        }
    } catch (error) {
        console.error('[Push] Unsubscribe failed:', error);
    }
}

// Check push notification permission state on startup
async function checkPushPermission() {
    const toggle = document.getElementById('pushToggle');
    const label = document.getElementById('pushLabel');
    
    if (!('Notification' in window)) {
        // Browser doesn't support notifications
        toggle.disabled = true;
        label.textContent = 'Not Supported';
        return;
    }
    
    const permission = Notification.permission;
    const savedPref = localStorage.getItem('pushNotifications');
    
    if (permission === 'granted' && savedPref === 'enabled') {
        // Check if actually subscribed
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                toggle.checked = true;
                label.textContent = 'On';
            } else {
                // Permission granted but not subscribed - re-subscribe
                toggle.checked = false;
                label.textContent = 'Off';
            }
        } catch (error) {
            toggle.checked = false;
            label.textContent = 'Off';
        }
    } else if (permission === 'denied') {
        // User blocked notifications at browser level
        toggle.checked = false;
        label.textContent = 'Blocked';
        localStorage.setItem('pushNotifications', 'disabled');
    } else {
        // Default state (not asked yet or default)
        toggle.checked = false;
        label.textContent = 'Off';
    }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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
                <div class="empty-state-icon">
                    <svg class="icon-svg" style="width: 48px; height: 48px;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <div class="empty-state-text">No results found</div>
            </div>
        `;
    } else {
        const sortedFiltered = sortNotifications(filtered);
        results.innerHTML = sortedFiltered.map(notif => `
            <div class="notification-card search-result" data-navigate-id="${notif.id}">
                ${notif.isPinned ? '<div class="pin-indicator"><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><line x1="12" x2="12" y1="17" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg> Pinned</div>' : ''}
                <div class="notification-header">
                    <div class="shop-name"><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg> ${notif.shop_name}</div>
                    <div class="notification-time"><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${formatDate(notif.timestamp)}</div>
                </div>
                <div class="product-name">${notif.product_name}</div>
                <div class="notification-info">
                    ${notif.price ? `<span><svg class="icon-svg inline-icon" viewBox="0 0 24 24"><path d="M18 7c0-5.333-8-5.333-8 0"/><path d="M10 7v14"/><path d="M6 21h12"/><path d="M6 13h10"/></svg> ${notif.price}</span>` : ''}
                    ${notif.is_new ? '<span class="new-badge">NEW PRODUCT!</span>' : ''}
                </div>
                <div class="tap-hint">Tap to view in category</div>
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
