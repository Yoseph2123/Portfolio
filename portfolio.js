// --- DOM Elements ---
const header = document.querySelector('.header');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const toggleIcon = menuToggle ? menuToggle.querySelector('i') : null;

// --- Header Scroll Effect ---
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Mobile Menu Toggle ---
if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        
        if (navMenu.classList.contains('show')) {
            toggleIcon.classList.remove('bx-menu');
            toggleIcon.classList.add('bx-x');
        } else {
            toggleIcon.classList.remove('bx-x');
            toggleIcon.classList.add('bx-menu');
        }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
            if (toggleIcon) {
                toggleIcon.classList.remove('bx-x');
                toggleIcon.classList.add('bx-menu');
            }
        });
    });
}

// --- Active Navigation Link on Scroll ---
window.addEventListener('scroll', () => {
    let current = '';
    const allSections = document.querySelectorAll('section');

    allSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (current && link.getAttribute('href') && link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// --- Scroll Reveal Animations ---
function revealOnScroll() {
    const windowHeight = window.innerHeight;
    const elementVisible = 120;
    const allReveals = document.querySelectorAll('.reveal');

    allReveals.forEach(reveal => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
}

revealOnScroll();
window.addEventListener('scroll', revealOnScroll);

// --- Contact Form Handling ---
const form = document.getElementById('contactForm');
if (form) {
    form.addEventListener('submit', () => {
        const btn = form.querySelector('button');
        if (btn) {
            btn.innerHTML = 'Sending... <i class="bx bx-loader-alt bx-spin"></i>';
        }
    });
}

// ==========================================
// --- TOAST NOTIFICATION SYSTEM ---
// ==========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconClass = type === 'success' ? 'bx bx-check-circle' : 'bx bx-error-circle';
    toast.innerHTML = `<i class='${iconClass}'></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// --- ADMIN / OWNER SECURITY SYSTEM ---
// ==========================================
// Default admin passcode - change this anytime!
const DEFAULT_ADMIN_PASSCODE = 'yoseph2026';

function getStoredPasscode() {
    return localStorage.getItem('portfolio_admin_passcode') || DEFAULT_ADMIN_PASSCODE;
}

function isAdminLoggedIn() {
    return sessionStorage.getItem('portfolio_admin_session') === 'true' ||
           localStorage.getItem('portfolio_admin_persistent') === 'true';
}

function authenticateAdmin(enteredPasscode) {
    const actualPasscode = getStoredPasscode();
    if (enteredPasscode === actualPasscode) {
        sessionStorage.setItem('portfolio_admin_session', 'true');
        localStorage.setItem('portfolio_admin_persistent', 'true');
        sessionStorage.setItem('portfolio_active_passcode', enteredPasscode);
        applyAdminState(true);
        showToast('Admin Mode Unlocked! You can now upload and manage videos.');
        return true;
    }
    return false;
}

function logoutAdmin() {
    sessionStorage.removeItem('portfolio_admin_session');
    localStorage.removeItem('portfolio_admin_persistent');
    sessionStorage.removeItem('portfolio_active_passcode');
    applyAdminState(false);
    showToast('Exited Admin Mode. Viewing portfolio as a public visitor.');
}

function applyAdminState(isAdmin) {
    const authBtn = document.getElementById('adminAuthBtn');

    if (isAdmin) {
        document.body.classList.add('is-admin');
        if (authBtn) {
            authBtn.outerHTML = `
                <div class="admin-status-badge" id="adminAuthBadge">
                    <i class='bx bx-shield-quarter'></i> Admin
                    <button class="admin-logout-btn" id="logoutAdminBtn" title="Exit Admin Mode">Logout</button>
                </div>
            `;
            const logoutBtn = document.getElementById('logoutAdminBtn');
            if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
        }
    } else {
        document.body.classList.remove('is-admin');
        const authBadge = document.getElementById('adminAuthBadge');
        if (authBadge) {
            authBadge.outerHTML = `
                <button class="admin-auth-toggle-btn" id="adminAuthBtn" title="Owner Admin Access" aria-label="Admin Access">
                    <i class='bx bx-lock-alt'></i>
                </button>
            `;
            const newBtn = document.getElementById('adminAuthBtn');
            if (newBtn) newBtn.addEventListener('click', openAdminLoginModal);
        }
    }

    renderVideos();
}

function checkUrlForAdminKey() {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    const passParam = params.get('pass');

    if (adminParam === 'true' || adminParam === '' || passParam) {
        const candidate = passParam || adminParam || '';
        if (candidate === getStoredPasscode()) {
            authenticateAdmin(candidate);
        } else if (isAdminLoggedIn()) {
            applyAdminState(true);
        } else {
            // Open modal to prompt for passcode
            openAdminLoginModal();
        }
    } else if (isAdminLoggedIn()) {
        applyAdminState(true);
    }
}

function openAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const pwdInput = document.getElementById('adminPasswordInput');
    if (pwdInput) {
        pwdInput.value = '';
        setTimeout(() => pwdInput.focus(), 150);
    }
}

function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function setupAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    const authBtn = document.getElementById('adminAuthBtn');
    const closeBtn = document.getElementById('closeAdminLoginModalBtn');
    const form = document.getElementById('adminLoginForm');

    if (authBtn) authBtn.addEventListener('click', openAdminLoginModal);
    if (closeBtn) closeBtn.addEventListener('click', closeAdminLoginModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAdminLoginModal();
        });
    }

    // Secret double-click on footer logo also opens admin modal
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        footerLogo.style.cursor = 'pointer';
        footerLogo.addEventListener('dblclick', openAdminLoginModal);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('adminPasswordInput');
            if (!input) return;

            const entered = input.value.trim();
            if (authenticateAdmin(entered)) {
                closeAdminLoginModal();
            } else {
                showToast('Incorrect admin passcode.', 'error');
                input.value = '';
                input.focus();
            }
        });
    }
}

// ==========================================
// --- CATEGORY NORMALIZATION & FILTERING ---
// ==========================================
function normalizeCategory(str) {
    if (!str) return '';
    const s = str.toLowerCase();
    if (s.includes('reel') || s.includes('short')) return 'reels';
    if (s.includes('cinemat')) return 'cinematic';
    if (s.includes('commerc')) return 'commercial';
    if (s.includes('motion')) return 'motion';
    if (s.includes('music')) return 'music';
    return s.replace(/[^a-z0-9]/g, '');
}

function matchesFilter(video, filter) {
    if (!filter || filter === 'all') return true;
    const target = normalizeCategory(filter);

    let cats = [];
    if (Array.isArray(video.categories) && video.categories.length > 0) {
        cats = video.categories;
    } else if (typeof video.category === 'string') {
        cats = video.category.split(',').map(s => s.trim());
    }

    return cats.some(c => normalizeCategory(c) === target);
}

// ==========================================
// --- INDEXEDDB VIDEO STORAGE SYSTEM ---
// ==========================================
const DB_NAME = 'PortfolioVideosDB';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openVideoDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getStoredVideos() {
    try {
        const db = await openVideoDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    } catch (err) {
        console.warn('IndexedDB read error, using empty array', err);
        return [];
    }
}

async function saveVideoToDB(videoObj) {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(videoObj);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function deleteVideoFromDB(id) {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

// ==========================================
// --- SAMPLE DEFAULT SHOWCASE VIDEOS ---
// ==========================================
const sampleVideos = [
    {
        id: 'sample-1',
        title: 'Cinematic Travel & Adventure Showreel',
        category: 'Cinematic',
        categories: ['Cinematic'],
        software: 'Premiere Pro, DaVinci Resolve',
        description: 'Immersive travel piece featuring natural color grading, dynamic speed ramping, custom visual flow, and rhythmic audio design.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        isCustom: false,
        sourceType: 'url'
    },
    {
        id: 'sample-2',
        title: 'Commercial Brand & Product Promo',
        category: 'Commercial',
        categories: ['Commercial'],
        software: 'After Effects, Premiere Pro',
        description: 'High-energy commercial advertisement with kinetic typography, modern lower-thirds, product highlight pacing, and sound effects.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
        isCustom: false,
        sourceType: 'url'
    },
    {
        id: 'sample-3',
        title: 'Viral Social Media Reel / Short',
        category: 'Reels/Shorts',
        categories: ['Reels/Shorts'],
        software: 'CapCut Pro, Premiere Pro',
        description: 'Fast-paced vertical reel designed for maximum hook retention, beat-synchronized transitions, and animated subtitles.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        isCustom: false,
        sourceType: 'url'
    }
];

// Active state
let allVideos = [];
let activeFilter = 'all';
let currentActiveObjectUrls = new Map();
let editingVideoId = null;

// ==========================================
// --- VIDEO THUMBNAIL CAPTURE UTILITY ---
// ==========================================
function captureVideoThumbnail(file) {
    return new Promise((resolve) => {
        try {
            const video = document.createElement('video');
            const fileUrl = URL.createObjectURL(file);
            video.src = fileUrl;
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';

            video.addEventListener('loadedmetadata', () => {
                video.currentTime = Math.min(1.0, video.duration / 2);
            });

            video.addEventListener('seeked', () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 360;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    URL.revokeObjectURL(fileUrl);
                    resolve(dataUrl);
                } catch (e) {
                    URL.revokeObjectURL(fileUrl);
                    resolve(null);
                }
            });

            video.addEventListener('error', () => {
                URL.revokeObjectURL(fileUrl);
                resolve(null);
            });

            setTimeout(() => {
                URL.revokeObjectURL(fileUrl);
                resolve(null);
            }, 3000);
        } catch (e) {
            resolve(null);
        }
    });
}

function getYouTubeInfo(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
        const id = match[1];
        return {
            id,
            embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
            thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        };
    }
    return null;
}

// ==========================================
// --- RENDER VIDEOS GALLERY ---
// ==========================================
function renderVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    const filtered = allVideos.filter(item => matchesFilter(item, activeFilter));
    const isAdmin = isAdminLoggedIn();

    if (filtered.length === 0) {
        const filterDisplayName = activeFilter === 'all' ? 'showcase' : activeFilter;
        const uploadCta = isAdmin ? `
            <button class="btn btn-primary" onclick="document.getElementById('openUploadModalBtn').click()">
                <i class='bx bx-cloud-upload'></i> Upload to ${escapeHtml(filterDisplayName)}
            </button>
        ` : '';

        grid.innerHTML = `
            <div class="videos-empty-state glass-card">
                <i class='bx bx-film'></i>
                <h3>No videos found in "${escapeHtml(filterDisplayName)}"</h3>
                <p>Explore other categories or check back soon for new projects.</p>
                ${uploadCta}
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        let thumbSrc = item.thumbnail;
        if (!thumbSrc) {
            thumbSrc = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
        }

        const softwareList = item.software ? item.software.split(',').map(s => s.trim()).filter(Boolean) : [];
        const tagsHtml = softwareList.map(soft => `
            <span class="software-tag"><i class='bx bx-film'></i> ${escapeHtml(soft)}</span>
        `).join('');

        const cats = Array.isArray(item.categories) && item.categories.length > 0 
            ? item.categories 
            : [item.category || 'Cinematic'];
        const categoryBadgesHtml = cats.map(c => `
            <span class="video-badge-pill">${escapeHtml(c)}</span>
        `).join('');

        // My Upload badge (only shown to admin or with custom tag)
        const isCustomBadge = (item.isCustom && isAdmin) ? `<span class="video-badge custom-badge"><i class='bx bx-check'></i> My Upload</span>` : '';
        
        // Card action buttons (Edit & Delete) — ONLY visible in Admin mode!
        const cardActionBtns = (item.isCustom && isAdmin) ? `
            <div class="card-action-btns">
                <button class="btn-icon-secondary edit-categories-btn" data-id="${item.id}" title="Change Categories">
                    <i class='bx bx-purchase-tag-alt'></i>
                </button>
                <button class="btn-danger-icon delete-video-btn" data-id="${item.id}" title="Delete Video">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        ` : '';

        return `
            <div class="video-card glass-card reveal active" data-id="${item.id}">
                <div class="video-thumb-wrapper" onclick="playVideo('${item.id}')">
                    <img src="${thumbSrc}" alt="${escapeHtml(item.title)}" class="video-thumb" loading="lazy" />
                    <div class="video-thumb-gradient"></div>
                    <div class="video-play-btn"><i class='bx bx-play'></i></div>
                    <div class="video-badges-row">${categoryBadgesHtml}</div>
                    ${isCustomBadge}
                </div>
                <div class="video-info">
                    <h3>${escapeHtml(item.title)}</h3>
                    ${tagsHtml ? `<div class="video-software-tags">${tagsHtml}</div>` : ''}
                    <p>${escapeHtml(item.description || 'Edited video showcase.')}</p>
                    <div class="video-card-footer">
                        <button class="btn btn-sm" onclick="playVideo('${item.id}')">
                            <i class='bx bx-play-circle'></i> Watch Video
                        </button>
                        ${cardActionBtns}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach delete handlers
    grid.querySelectorAll('.delete-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            deleteVideo(id);
        });
    });

    // Attach edit categories handlers
    grid.querySelectorAll('.edit-categories-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            openEditCategoryModal(id);
        });
    });

    revealOnScroll();
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================
// --- INITIALIZE & LOAD VIDEOS ---
// ==========================================
async function initVideos() {
    try {
        const stored = await getStoredVideos();
        
        const processedStored = stored.map(item => {
            const categories = Array.isArray(item.categories) && item.categories.length > 0
                ? item.categories
                : (item.category ? item.category.split(',').map(s => s.trim()) : ['Cinematic']);

            if (item.sourceType === 'file' && item.videoBlob) {
                const url = URL.createObjectURL(item.videoBlob);
                currentActiveObjectUrls.set(item.id, url);
                return { ...item, categories, videoUrl: url, isCustom: true };
            }
            return { ...item, categories, isCustom: true };
        });

        // Try fetching server-published videos if served over HTTP/HTTPS
        let serverVideos = [];
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            try {
                const res = await fetch('upload_video.php');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        serverVideos = data;
                    }
                }
            } catch (e) {
                // PHP server not configured or static host
            }
        }

        // Deduplicate
        const existingIds = new Set(processedStored.map(v => v.id));
        const filteredServer = serverVideos.filter(v => !existingIds.has(v.id));

        // Combine custom uploads + server videos + sample showcase items
        allVideos = [...processedStored, ...filteredServer, ...sampleVideos];
        renderVideos();
    } catch (err) {
        console.error('Error loading videos:', err);
        allVideos = [...sampleVideos];
        renderVideos();
    }
}

// Delete video (Protected)
async function deleteVideo(id) {
    if (!isAdminLoggedIn()) {
        showToast('Unauthorized: You must be in Admin mode to delete videos.', 'error');
        return;
    }

    if (!confirm('Are you sure you want to remove this video from your showcase?')) return;

    try {
        await deleteVideoFromDB(id);

        if (currentActiveObjectUrls.has(id)) {
            URL.revokeObjectURL(currentActiveObjectUrls.get(id));
            currentActiveObjectUrls.delete(id);
        }

        // If server video, notify server with admin passcode
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            try {
                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);
                formData.append('admin_passcode', getStoredPasscode());
                await fetch('upload_video.php', { method: 'POST', body: formData });
            } catch (e) {}
        }

        allVideos = allVideos.filter(v => v.id !== id);
        renderVideos();
        showToast('Video removed successfully.');
    } catch (err) {
        console.error('Delete error', err);
        showToast('Could not delete video. Please try again.', 'error');
    }
}

// ==========================================
// --- EDIT CATEGORIES MODAL ---
// ==========================================
function openEditCategoryModal(id) {
    if (!isAdminLoggedIn()) {
        showToast('Unauthorized: Please unlock Admin Mode first.', 'error');
        return;
    }

    const video = allVideos.find(v => v.id === id);
    if (!video) return;

    editingVideoId = id;
    const modal = document.getElementById('editCategoryModal');
    const titleElem = document.getElementById('editCategoryVideoTitle');
    const chipsContainer = document.getElementById('editModalCategoryChips');

    if (!modal || !chipsContainer) return;

    titleElem.textContent = `Editing: "${video.title}"`;

    const currentCats = Array.isArray(video.categories) && video.categories.length > 0
        ? video.categories
        : [video.category || 'Cinematic'];

    chipsContainer.querySelectorAll('.category-chip').forEach(chip => {
        const val = chip.getAttribute('data-value');
        const isActive = currentCats.some(c => normalizeCategory(c) === normalizeCategory(val));
        if (isActive) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeEditCategoryModal() {
    const modal = document.getElementById('editCategoryModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    editingVideoId = null;
}

function setupEditCategoryModal() {
    const modal = document.getElementById('editCategoryModal');
    const closeBtn = document.getElementById('closeEditCategoryModalBtn');
    const cancelBtn = document.getElementById('cancelEditCategoryBtn');
    const saveBtn = document.getElementById('saveCategoryChangesBtn');
    const chipsContainer = document.getElementById('editModalCategoryChips');

    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', closeEditCategoryModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeEditCategoryModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEditCategoryModal();
    });

    if (chipsContainer) {
        chipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.category-chip');
            if (!chip) return;
            chip.classList.toggle('active');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            if (!editingVideoId) return;

            const selectedChips = Array.from(chipsContainer.querySelectorAll('.category-chip.active'))
                .map(c => c.getAttribute('data-value'));

            if (selectedChips.length === 0) {
                showToast('Please select at least one category.', 'error');
                return;
            }

            const video = allVideos.find(v => v.id === editingVideoId);
            if (!video) return;

            video.categories = selectedChips;
            video.category = selectedChips[0];

            try {
                const storedList = await getStoredVideos();
                const dbItem = storedList.find(v => v.id === editingVideoId);
                if (dbItem) {
                    dbItem.categories = selectedChips;
                    dbItem.category = selectedChips[0];
                    await saveVideoToDB(dbItem);
                }
                renderVideos();
                closeEditCategoryModal();
                showToast(`Updated categories to: ${selectedChips.join(', ')}`);
            } catch (err) {
                console.error('Error saving updated categories:', err);
                showToast('Failed to update categories.', 'error');
            }
        });
    }
}

// ==========================================
// --- THEATER / LIGHTBOX VIDEO PLAYER ---
// ==========================================
function playVideo(id) {
    const video = allVideos.find(v => v.id === id);
    if (!video) return;

    const modal = document.getElementById('videoPlayerModal');
    const playerWrapper = document.getElementById('playerWrapper');
    const titleElem = document.getElementById('playerModalTitle');
    const tagsElem = document.getElementById('playerTags');
    const descElem = document.getElementById('playerDesc');

    if (!modal || !playerWrapper) return;

    titleElem.innerHTML = `<i class='bx bx-play-circle accent'></i> ${escapeHtml(video.title)}`;
    descElem.textContent = video.description || '';

    const cats = Array.isArray(video.categories) && video.categories.length > 0 
        ? video.categories 
        : [video.category || 'Cinematic'];
    let tagsHtml = cats.map(c => `<span class="video-badge-pill" style="position:static;">${escapeHtml(c)}</span>`).join('');
    
    if (video.software) {
        const softwareList = video.software.split(',').map(s => s.trim()).filter(Boolean);
        tagsHtml += softwareList.map(s => `<span class="software-tag"><i class='bx bx-film'></i> ${escapeHtml(s)}</span>`).join('');
    }
    tagsElem.innerHTML = tagsHtml;

    const ytInfo = getYouTubeInfo(video.videoUrl);
    if (ytInfo) {
        playerWrapper.innerHTML = `
            <iframe 
                src="${ytInfo.embedUrl}" 
                title="${escapeHtml(video.title)}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>
        `;
    } else {
        playerWrapper.innerHTML = `
            <video controls autoplay playsinline style="width:100%; height:100%; background:#000;">
                <source src="${video.videoUrl}" type="video/mp4" />
                Your browser does not support HTML5 video.
            </video>
        `;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeVideoPlayer() {
    const modal = document.getElementById('videoPlayerModal');
    const playerWrapper = document.getElementById('playerWrapper');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (playerWrapper) {
        playerWrapper.innerHTML = '';
    }
}

// ==========================================
// --- UPLOAD MODAL & FORM LOGIC ---
// ==========================================
let selectedVideoFile = null;
let currentUploadSource = 'file';

function setupCategoryChips(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('click', (e) => {
        const chip = e.target.closest('.category-chip');
        if (!chip) return;

        chip.classList.toggle('active');

        const activeChips = container.querySelectorAll('.category-chip.active');
        if (activeChips.length === 0) {
            chip.classList.add('active');
        }

        const hiddenInput = document.getElementById('videoCategoryInput');
        if (hiddenInput) {
            const vals = Array.from(container.querySelectorAll('.category-chip.active'))
                .map(c => c.getAttribute('data-value'));
            hiddenInput.value = vals.join(',');
        }
    });
}

function setUploadModalActiveChips(categories = ['Cinematic']) {
    const container = document.getElementById('categoryChips');
    if (!container) return;

    container.querySelectorAll('.category-chip').forEach(chip => {
        const val = chip.getAttribute('data-value');
        const shouldBeActive = categories.some(c => normalizeCategory(c) === normalizeCategory(val));
        if (shouldBeActive) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });

    const anyActive = container.querySelectorAll('.category-chip.active');
    if (anyActive.length === 0) {
        const first = container.querySelector('.category-chip');
        if (first) first.classList.add('active');
    }

    const hiddenInput = document.getElementById('videoCategoryInput');
    if (hiddenInput) {
        const vals = Array.from(container.querySelectorAll('.category-chip.active'))
            .map(c => c.getAttribute('data-value'));
        hiddenInput.value = vals.join(',');
    }
}

function getSelectedUploadCategories() {
    const container = document.getElementById('categoryChips');
    if (!container) return ['Cinematic'];

    const activeChips = Array.from(container.querySelectorAll('.category-chip.active'))
        .map(c => c.getAttribute('data-value'));

    return activeChips.length > 0 ? activeChips : ['Cinematic'];
}

function setupUploadModal() {
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openUploadModalBtn');
    const closeBtn = document.getElementById('closeUploadModalBtn');
    const cancelBtn = document.getElementById('cancelUploadBtn');

    if (!modal || !openBtn) return;

    function openModal() {
        if (!isAdminLoggedIn()) {
            openAdminLoginModal();
            return;
        }

        let preSelectCat = 'Cinematic';
        if (activeFilter && activeFilter !== 'all') {
            preSelectCat = activeFilter;
        }
        setUploadModalActiveChips([preSelectCat]);

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        resetUploadForm();
    }

    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeVideoPlayer();
            closeEditCategoryModal();
            closeAdminLoginModal();
        }
    });

    const closePlayerBtn = document.getElementById('closePlayerModalBtn');
    const playerModal = document.getElementById('videoPlayerModal');
    if (closePlayerBtn) closePlayerBtn.addEventListener('click', closeVideoPlayer);
    if (playerModal) {
        playerModal.addEventListener('click', (e) => {
            if (e.target === playerModal) closeVideoPlayer();
        });
    }

    const tabSourceFile = document.getElementById('tabSourceFile');
    const tabSourceUrl = document.getElementById('tabSourceUrl');
    const sourceFileContent = document.getElementById('sourceFileContent');
    const sourceUrlContent = document.getElementById('sourceUrlContent');

    if (tabSourceFile && tabSourceUrl) {
        tabSourceFile.addEventListener('click', () => {
            currentUploadSource = 'file';
            tabSourceFile.classList.add('active');
            tabSourceUrl.classList.remove('active');
            sourceFileContent.style.display = 'block';
            sourceUrlContent.style.display = 'none';
        });

        tabSourceUrl.addEventListener('click', () => {
            currentUploadSource = 'url';
            tabSourceUrl.classList.add('active');
            tabSourceFile.classList.remove('active');
            sourceFileContent.style.display = 'none';
            sourceUrlContent.style.display = 'block';
        });
    }

    const dropZone = document.getElementById('videoDropZone');
    const fileInput = document.getElementById('videoFileInput');
    const previewStatus = document.getElementById('filePreviewStatus');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files.length > 0) {
                handleFileSelect(fileInput.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        if (!file.type.startsWith('video/')) {
            showToast('Please select a valid video file (.mp4, .webm, .mov)', 'error');
            return;
        }
        selectedVideoFile = file;
        dropZone.style.display = 'none';
        previewStatus.style.display = 'flex';
        fileNameDisplay.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;

        const titleInput = document.getElementById('videoTitleInput');
        if (titleInput && !titleInput.value.trim()) {
            const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedVideoFile = null;
            if (fileInput) fileInput.value = '';
            dropZone.style.display = 'block';
            previewStatus.style.display = 'none';
        });
    }

    setupCategoryChips('categoryChips');

    const uploadForm = document.getElementById('videoUploadForm');
    const saveBtn = document.getElementById('saveVideoSubmitBtn');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isAdminLoggedIn()) {
                showToast('Unauthorized: You must unlock Admin mode first.', 'error');
                return;
            }

            const title = document.getElementById('videoTitleInput').value.trim();
            const categories = getSelectedUploadCategories();
            const software = document.getElementById('videoSoftwareInput').value.trim();
            const desc = document.getElementById('videoDescInput').value.trim();
            const urlInput = document.getElementById('videoUrlInput').value.trim();

            if (!title) {
                showToast('Please provide a video title.', 'error');
                return;
            }

            if (currentUploadSource === 'file' && !selectedVideoFile) {
                showToast('Please choose a video file to upload.', 'error');
                return;
            }

            if (currentUploadSource === 'url' && !urlInput) {
                showToast('Please provide a valid video link.', 'error');
                return;
            }

            const originalBtnHtml = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Saving...';

            try {
                const newId = 'video-' + Date.now();
                let videoThumbnail = null;
                let videoObject = null;

                if (currentUploadSource === 'file') {
                    videoThumbnail = await captureVideoThumbnail(selectedVideoFile);

                    videoObject = {
                        id: newId,
                        title,
                        category: categories[0],
                        categories: categories,
                        software: software || 'Premiere Pro',
                        description: desc,
                        sourceType: 'file',
                        videoBlob: selectedVideoFile,
                        thumbnail: videoThumbnail,
                        uploadDate: new Date().toISOString()
                    };

                    await saveVideoToDB(videoObject);

                    const blobUrl = URL.createObjectURL(selectedVideoFile);
                    currentActiveObjectUrls.set(newId, blobUrl);

                    allVideos.unshift({
                        ...videoObject,
                        videoUrl: blobUrl,
                        isCustom: true
                    });

                    // Server upload with admin passcode
                    tryServerUpload(selectedVideoFile, title, categories.join(','), software, desc);
                } else {
                    const ytInfo = getYouTubeInfo(urlInput);
                    if (ytInfo) {
                        videoThumbnail = ytInfo.thumbnail;
                    }

                    videoObject = {
                        id: newId,
                        title,
                        category: categories[0],
                        categories: categories,
                        software: software || 'Video Editor',
                        description: desc,
                        sourceType: 'url',
                        videoUrl: urlInput,
                        thumbnail: videoThumbnail,
                        uploadDate: new Date().toISOString()
                    };

                    await saveVideoToDB(videoObject);
                    allVideos.unshift({ ...videoObject, isCustom: true });
                }

                const primaryCategory = categories[0] || 'all';
                switchFilter(primaryCategory);

                closeModal();
                showToast(`Video added to ${categories.join(', ')}!`);

                const videosSection = document.getElementById('videos');
                if (videosSection) {
                    videosSection.scrollIntoView({ behavior: 'smooth' });
                }
            } catch (err) {
                console.error('Save error:', err);
                showToast('Failed to save video: ' + err.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalBtnHtml;
            }
        });
    }

    function resetUploadForm() {
        if (uploadForm) uploadForm.reset();
        selectedVideoFile = null;
        if (fileInput) fileInput.value = '';
        if (dropZone) dropZone.style.display = 'block';
        if (previewStatus) previewStatus.style.display = 'none';
        if (tabSourceFile) tabSourceFile.click();
    }
}

// Background sync to upload_video.php if running on PHP server
async function tryServerUpload(file, title, category, software, desc) {
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('software', software);
        formData.append('description', desc);
        formData.append('admin_passcode', getStoredPasscode());

        const res = await fetch('upload_video.php', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                console.log('Video published to server storage:', data.video);
            }
        }
    } catch (e) {
        console.info('Server upload endpoint not reachable.');
    }
}

// ==========================================
// --- CATEGORY FILTER BUTTONS & SWITCHER ---
// ==========================================
function switchFilter(targetFilter) {
    activeFilter = targetFilter;
    const filterContainer = document.getElementById('videoFilters');
    if (filterContainer) {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => {
            const btnFilter = b.getAttribute('data-filter');
            if (targetFilter === 'all') {
                if (btnFilter === 'all') b.classList.add('active');
                else b.classList.remove('active');
            } else if (normalizeCategory(btnFilter) === normalizeCategory(targetFilter)) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }
    renderVideos();
}

function setupCategoryFilters() {
    const filterContainer = document.getElementById('videoFilters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const filterVal = btn.getAttribute('data-filter') || 'all';
        switchFilter(filterVal);
    });
}

// ==========================================
// --- RUN ON PAGE READY ---
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initVideos();
    setupAdminLoginModal();
    checkUrlForAdminKey();
    setupUploadModal();
    setupEditCategoryModal();
    setupCategoryFilters();
});
