// Configuration globale
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    UPLOAD_ENDPOINT: '/api/ocr/process',
    RESULTS_ENDPOINT: '/api/ocr/results',
    AUTH_ENDPOINT: '/api/auth'
};

// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
    showNotification(`Erreur: ${message}`, 'error');
    console.error('Erreur globale:', { message, source, lineno, colno, error });
    return true;
};

// Gestion des notifications
function showNotification(message, type = 'info', duration = 5000) {
    // Supprimer les notifications existantes
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                ${getNotificationIcon(type)}
                <span class="ml-2">${message}</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current hover:opacity-75">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    return notification;
}

function getNotificationIcon(type) {
    const icons = {
        success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>`,
        info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`
    };
    return icons[type] || icons.info;
}

// Fonctions utilitaires
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: `<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
        </svg>`,
        jpg: `<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>`,
        jpeg: `<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>`,
        png: `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>`,
        tiff: `<svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>`,
        tif: `<svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>`
    };
    return icons[extension] || `<svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
    </svg>`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Gestion de l'authentification
class AuthManager {
    constructor() {
        this.tokenKey = 'ocr_auth_token';
        this.userKey = 'ocr_user_data';
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = 'login.html';
    }

    async checkAuth() {
        if (!this.isAuthenticated() && 
            !window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('register.html') && 
            !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }

    // Méthode pour tester la connexion
    async testConnection() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.AUTH_ENDPOINT}/me?token=${token}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

/* // API Client
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    getToken() {
        const auth = new AuthManager();
        return auth.getToken();
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        }; 
        */
       // API Client - VERSION MODIFIÉE pour query parameters
class APIClient {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    getToken() {
        const auth = new AuthManager();
        return auth.getToken();
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        let url = `${this.baseURL}${endpoint}`;
        
        // AJOUT: Si un token est disponible, l'ajouter comme query parameter
        if (token) {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}token=${token}`;
        }
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // SUPPRIMER: L'ancien code qui ajoutait le token dans les headers
        // const token = this.getToken();
        // if (token) {
        //     headers['Authorization'] = `Bearer ${token}`;
        // }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                // Vérifier si c'est une erreur d'authentification
                if (response.status === 401 || response.status === 403) {
                    // Token invalide ou expiré
                    const auth = new AuthManager();
                    auth.logout();
                    showNotification('Session expirée. Veuillez vous reconnecter.', 'error');
                    window.location.href = 'login.html';
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Vérifier si la réponse est vide
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async uploadFile(file, language = 'fra+eng', onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);

        const token = this.getToken();
        let url = `${this.baseURL}${CONFIG.UPLOAD_ENDPOINT}`;
        
        // AJOUT: Ajouter le token comme query parameter
        if (token) {
            url = `${url}?token=${token}`;
        }
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            // Suivi de la progression
            xhr.upload.addEventListener('progress', (event) => {
                if (onProgress && event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (error) {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload aborted'));
            });

            xhr.open('POST', url);
        
            xhr.send(formData);
        });
    }

    // Méthode pour récupérer les infos utilisateur avec query parameter
    async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const response = await fetch(`${this.baseURL}${CONFIG.AUTH_ENDPOINT}/me?token=${token}`);
            
            if (response.ok) {
                const user = await response.json();
                const auth = new AuthManager();
                auth.setUser(user);
                return user;
            }
        } catch (error) {
            console.error('Erreur récupération utilisateur:', error);
        }
        return null;
    }

    async login(username, password) {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.AUTH_ENDPOINT}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.access_token) {
            const auth = new AuthManager();
            auth.setToken(data.access_token);
            
            // Récupérer les informations utilisateur avec le token
            const user = await this.getCurrentUser();
            if (user) {
                auth.setUser(user);
            }
            
            return data;
        } else {
            throw new Error('Token non reçu');
        }
    }

    async register(userData) {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.AUTH_ENDPOINT}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    // Autres méthodes restent inchangées...
    async processOCR(documentId) {
        return this.request(`${CONFIG.PROCESS_ENDPOINT}/${documentId}`, {
            method: 'POST'
        });
    }

    async getResults(processId) {
        return this.request(`${CONFIG.RESULTS_ENDPOINT}/${processId}`);
    }

    async getHistory(page = 1, limit = 10) {
        return this.request(`${CONFIG.RESULTS_ENDPOINT}?page=${page}&limit=${limit}`);
    }

    async exportResult(processId, format = 'json') {
        return this.request(`${CONFIG.EXPORT_ENDPOINT}/${processId}`, {
            method: 'POST',
            body: JSON.stringify({ format }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Initialiser le client API - UNE SEULE FOIS
const api = new APIClient();
const auth = new AuthManager();

// Initialiser l'application
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier l'authentification sur les pages protégées
    if (!window.location.pathname.includes('index.html') && 
        !window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html')) {
        auth.checkAuth();
    }

    // Gérer les formulaires de connexion/déconnexion
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    });

    // Afficher les informations utilisateur
    const user = auth.getUser();
    if (user) {
        const userElements = document.querySelectorAll('[data-user]');
        userElements.forEach(element => {
            const field = element.getAttribute('data-user');
            if (field === 'username' && user.username) {
                element.textContent = user.username;
            } else if (field === 'email' && user.email) {
                element.textContent = user.email;
            } else if (field === 'full_name' && user.full_name) {
                element.textContent = user.full_name;
            }
        });
    }

    // Initialiser les tooltips
    initializeTooltips();

    // Initialiser les composants spécifiques à la page
    if (typeof initPage === 'function') {
        initPage();
    }
});

function initializeTooltips() {
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltip = event.currentTarget;
    const text = tooltip.getAttribute('data-tooltip');
    if (!text) return;

    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-text';
    tooltipEl.textContent = text;
    tooltip.appendChild(tooltipEl);
}

function hideTooltip(event) {
    const tooltip = event.currentTarget;
    const tooltipEl = tooltip.querySelector('.tooltip-text');
    if (tooltipEl) {
        tooltip.removeChild(tooltipEl);
    }
}

// Fonctions globales accessibles depuis le HTML
window.showNotification = showNotification;
window.formatFileSize = formatFileSize;
window.formatDate = formatDate;
window.auth = auth;
window.api = api;