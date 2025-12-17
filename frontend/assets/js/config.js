// Configuration globale
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            ME: '/api/auth/me',
            REFRESH: '/api/auth/refresh',
            LOGOUT: '/api/auth/logout'
        },
        OCR: {
            PROCESS: '/api/ocr/process',
            BATCH_PROCESS: '/api/ocr/batch-process',
            RESULTS: '/api/ocr/results',
            STATS: '/api/ocr/stats',
            DOWNLOAD: '/api/ocr/results/{id}/download/{format}'
        }
    },
    DEMO_CREDENTIALS: {
        USERNAME: 'demo',
        PASSWORD: 'demo123'
    }
};

// Pas de déclaration de 'api' ici - elle sera déclarée dans main.js