const API_BASE_URL = 'http://localhost:8000/api/ocr';

// ⭐⭐ AJOUTER CETTE LIGNE (déclaration manquante) ⭐⭐
let currentResult = null;
let currentTab = 'structured';

// Initialisation - seulement sur la page results.html
document.addEventListener('DOMContentLoaded', async () => {
    // Vérifier qu'on est bien sur la page results.html
    const loadingState = document.getElementById('loadingState');
    const resultsContent = document.getElementById('resultsContent');
    
    if (!loadingState && !resultsContent) {
        // Pas sur la page results.html, ne rien faire
        return;
    }
    
    // Vérifier s'il y a un process_id dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const processId = urlParams.get('process_id');
    
    if (processId) {
        await loadResultById(processId);
    } else {
        // Pas de process_id, afficher un message d'erreur
        showErrorState('Aucun identifiant de traitement fourni');
    }
});

// Fonction loadResultById
async function loadResultById(processId) {
    try {
        const token = localStorage.getItem('auth_token');
        let url = `${API_BASE_URL}/results/${processId}`;
        
        // Ajouter le token en query parameter si disponible
        if (token) {
            url += `?token=${token}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        // ⭐⭐ CORRECT : Assignation sans redéclaration ⭐⭐
        currentResult = await response.json();
        displayResult(currentResult);
        
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showErrorState(`Erreur lors du chargement: ${error.message}`);
    }
}


function displayResult(result) {
    // Cacher l'état de chargement
    const loadingState = document.getElementById('loadingState');
    const resultsContent = document.getElementById('resultsContent');
    const errorState = document.getElementById('errorState');
    
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (resultsContent) resultsContent.classList.remove('hidden');
    
    // Mettre à jour les informations du document
    if (result.filename) {
        const fileNameEl = document.getElementById('fileName');
        if (fileNameEl) fileNameEl.textContent = result.filename;
    }
    
    if (result.document_type) {
        const docTypeEl = document.getElementById('documentType');
        if (docTypeEl) docTypeEl.textContent = result.document_type;
    }
    
    if (result.total_pages) {
        const pageCountEl = document.getElementById('pageCount');
        if (pageCountEl) pageCountEl.textContent = result.total_pages;
    }
    
    if (result.average_confidence !== undefined) {
        const confidenceEl = document.getElementById('confidenceScore');
        if (confidenceEl) {
            const percent = Math.round(result.average_confidence * 100);
            confidenceEl.textContent = `${percent}% confiance`;
        }
    }
    
    // Afficher les données structurées
    if (result.structured_data) {
        displayStructuredData(result.structured_data);
    }
    
    // Afficher le texte brut
    if (result.text) {
        const rawTextEl = document.getElementById('rawText');
        if (rawTextEl) rawTextEl.textContent = result.text;
    }
    
    // Afficher les zones
    if (result.zones && result.zones.length > 0) {
        displayZones(result.zones);
    }
    
    // Mettre à jour le statut
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.textContent = 'Terminé';
        statusBadge.className = 'badge status-completed';
    }
    
    // Mettre à jour le process ID
    const processIdEl = document.getElementById('processId');
    if (processIdEl && result.process_id) {
        processIdEl.textContent = `ID: ${result.process_id}`;
    }
}

function displayStructuredData(structuredData) {
    const tbody = document.getElementById('structuredData');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (structuredData.fields) {
        Object.entries(structuredData.fields).forEach(([fieldName, fieldValues]) => {
            if (Array.isArray(fieldValues) && fieldValues.length > 0) {
                fieldValues.forEach(fieldValue => {
                    const row = document.createElement('tr');
                    const value = fieldValue.value || (typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue));
                    const confidence = fieldValue.confidence !== undefined ? 
                        `${Math.round(fieldValue.confidence * 100)}%` : 'N/A';
                    
                    row.innerHTML = `
                        <td class="font-medium">${fieldName}</td>
                        <td>${value}</td>
                        <td>${confidence}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
    }
    
    // Si pas de champs, afficher les entités
    if (structuredData.entities && Object.keys(structuredData.entities).length > 0) {
        Object.entries(structuredData.entities).forEach(([entityType, values]) => {
            if (Array.isArray(values)) {
                values.forEach(value => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="font-medium">${entityType}</td>
                        <td>${value}</td>
                        <td>N/A</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
    }
}

function displayZones(zones) {
    const zonesList = document.getElementById('zonesList');
    if (!zonesList) return;
    
    zonesList.innerHTML = zones.map((zone, index) => `
        <div class="border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
                <span class="font-medium">Zone ${index + 1}</span>
                <span class="text-xs px-2 py-1 bg-gray-100 rounded">${zone.type || 'texte'}</span>
            </div>
            ${zone.text ? `<p class="text-sm text-gray-700 mt-2">${zone.text}</p>` : ''}
            ${zone.position ? `
                <p class="text-xs text-gray-500 mt-2">
                    Position: (${zone.position.x}, ${zone.position.y}) - 
                    Taille: ${zone.position.width}x${zone.position.height}
                </p>
            ` : ''}
        </div>
    `).join('');
}

function showErrorState(message) {
    const loadingState = document.getElementById('loadingState');
    const resultsContent = document.getElementById('resultsContent');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loadingState) loadingState.classList.add('hidden');
    if (resultsContent) resultsContent.classList.add('hidden');
    if (errorState) errorState.classList.remove('hidden');
    if (errorMessage) errorMessage.textContent = message;
}

function switchTab(tabName) {
    currentTab = tabName;
    
    // Mettre à jour les boutons d'onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Afficher/masquer les contenus
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (targetTab) targetTab.classList.remove('hidden');
}

// Exposer les fonctions globales
window.switchTab = switchTab;
window.exportResult = function(format) {
    if (!currentResult || !currentResult.process_id) {
        alert('Aucun résultat à exporter');
        return;
    }
    
    const url = `${API_BASE_URL}/results/${currentResult.process_id}/download/${format}`;
    const token = localStorage.getItem('auth_token');
    const finalUrl = token ? `${url}?token=${token}` : url;
    
    window.open(finalUrl, '_blank');
};

window.processAnother = function() {
    window.location.href = 'upload.html';
};

window.saveToHistory = function() {
    if (currentResult) {
        // Sauvegarder dans localStorage
        let history = JSON.parse(localStorage.getItem('ocr_history') || '[]');
        history.push(currentResult);
        localStorage.setItem('ocr_history', JSON.stringify(history));
        alert('Résultat sauvegardé dans l\'historique');
    }
};

window.shareResult = function() {
    if (currentResult && currentResult.process_id) {
        const url = `${window.location.origin}${window.location.pathname}?process_id=${currentResult.process_id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Lien copié dans le presse-papier !');
        });
    }
};

// Cette fonction n'est plus nécessaire pour la page results.html individuelle
// Elle est gardée pour compatibilité avec history.html si nécessaire
function setupEventListeners() {
    // Filtre par type (seulement si l'élément existe)
    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', filterResults);
    }
    
    // Recherche (seulement si l'élément existe)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterResults, 300));
    }
}

function showTab(tabName) {
    currentTab = tabName;
    
    // Mettre à jour l'état des onglets
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-gray-500');
    });
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add('active');
    activeTab.classList.remove('text-gray-500');
    
    // Filtrer les résultats
    filterResults();
}

function filterResults() {
    const filterTypeEl = document.getElementById('filterType');
    const searchInputEl = document.getElementById('searchInput');
    
    if (!filterTypeEl || !searchInputEl) return; // Ne rien faire si les éléments n'existent pas
    
    const filterType = filterTypeEl.value;
    const searchQuery = searchInputEl.value.toLowerCase();
    
    let filteredResults = [...allResults];
    
    // Filtrer par type
    if (filterType !== 'all') {
        filteredResults = filteredResults.filter(result => 
            result.document_type === filterType
        );
    }
    
    // Filtrer par recherche
    if (searchQuery) {
        filteredResults = filteredResults.filter(result => 
            result.filename.toLowerCase().includes(searchQuery) ||
            JSON.stringify(result.extracted_data).toLowerCase().includes(searchQuery)
        );
    }
    
    // Filtrer par onglet
    switch (currentTab) {
        case 'recent':
            // Trier par date récente (limiter aux 10 derniers)
            filteredResults.sort((a, b) => new Date(b.timestamp || b.extraction_date) - new Date(a.timestamp || a.extraction_date));
            filteredResults = filteredResults.slice(0, 10);
            break;
            
        case 'high-confidence':
            // Résultats avec haute confiance (> 90%)
            filteredResults = filteredResults.filter(result => result.confidence >= 0.9);
            filteredResults.sort((a, b) => b.confidence - a.confidence);
            break;
            
        case 'all':
        default:
            // Trier par date récente
            filteredResults.sort((a, b) => new Date(b.timestamp || b.extraction_date) - new Date(a.timestamp || a.extraction_date));
            break;
    }
    
    displayResults(filteredResults);
}

function displayResults(results = null) {
    const container = document.getElementById('resultsContainer');
    if (!container) return; // Ne rien faire si l'élément n'existe pas
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
                <p class="mt-1 text-sm text-gray-500">Aucun résultat ne correspond aux critères.</p>
                <div class="mt-6">
                    <a href="upload.html" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Télécharger un document
                    </a>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    results.forEach(result => {
        const date = new Date(result.timestamp || result.extraction_date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const confidencePercent = Math.round(result.confidence * 100);
        const confidenceColor = confidencePercent >= 90 ? 'green' : confidencePercent >= 70 ? 'yellow' : 'red';
        
        html += `
            <div class="result-card bg-white rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">${result.filename}</h3>
                        <p class="text-sm text-gray-500 mt-1">Traité le ${formattedDate}</p>
                        <span class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            ${result.document_type || 'Document'}
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${confidenceColor}-100 text-${confidenceColor}-800">
                            ${confidencePercent}% confiance
                        </span>
                    </div>
                </div>
                
                <!-- Données extraites -->
                <div class="mb-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Données extraites :</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${renderExtractedFields(result.extracted_data)}
                    </div>
                </div>
                
                <!-- Actions -->
                <div class="flex justify-end space-x-3 mt-4">
                    <button onclick="viewResultDetails('${result.process_id}')" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Voir Détails
                    </button>
                    <button onclick="exportResult('${result.process_id}', 'json')" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        JSON
                    </button>
                    <button onclick="exportResult('${result.process_id}', 'csv')" class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        CSV
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderExtractedFields(data) {
    if (!data || !data.fields) return '<p class="text-gray-500">Aucune donnée extraite</p>';
    
    let html = '';
    const fields = data.fields;
    
    // Prendre les 4 premiers champs les plus importants
    const importantFields = Object.entries(fields).slice(0, 4);
    
    importantFields.forEach(([fieldName, fieldValues]) => {
        if (fieldValues && fieldValues.length > 0) {
            const value = fieldValues[0].value;
            html += `
                <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-xs font-medium text-gray-500 uppercase mb-1">${fieldName}</p>
                    <p class="text-sm font-semibold text-gray-900 truncate">${value}</p>
                </div>
            `;
        }
    });
    
    return html;
}

async function viewResultDetails(processId) {
    try {
        showLoadingModal();
        
        // Récupérer les détails du résultat
        const result = allResults.find(r => r.process_id === processId);
        
        if (!result) {
            throw new Error('Résultat non trouvé');
        }
        
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) {
            throw new Error('Modal content non trouvé');
        }
        
        modalContent.innerHTML = `
            <div class="space-y-6">
                <!-- En-tête -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900">${result.filename}</h4>
                            <p class="text-sm text-gray-600">Type: ${result.document_type}</p>
                            <p class="text-sm text-gray-600">Confiance: ${Math.round(result.confidence * 100)}%</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            ✓ Extrait
                        </span>
                    </div>
                </div>
                
                <!-- Données extraites complètes -->
                <div>
                    <h5 class="text-md font-medium text-gray-900 mb-3">Données extraites :</h5>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre class="text-sm text-gray-800 whitespace-pre-wrap">${JSON.stringify(result.extracted_data, null, 2)}</pre>
                    </div>
                </div>
                
                <!-- Zones détectées -->
                ${result.zones && result.zones.length > 0 ? `
                <div>
                    <h5 class="text-md font-medium text-gray-900 mb-3">Zones détectées (${result.zones.length}) :</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${result.zones.map((zone, index) => `
                            <div class="border border-gray-200 rounded-lg p-3">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-gray-700">Zone ${index + 1}</span>
                                    <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                        ${zone.type || 'texte'}
                                    </span>
                                </div>
                                <div class="text-xs text-gray-600">
                                    Position: (${zone.x}, ${zone.y}) - Taille: ${zone.width}x${zone.height}
                                </div>
                                ${zone.text ? `<div class="mt-2 text-sm text-gray-800 truncate">"${zone.text}"</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Texte brut -->
                ${result.raw_text ? `
                <div>
                    <h5 class="text-md font-medium text-gray-900 mb-3">Texte brut extrait :</h5>
                    <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <p class="text-sm text-gray-800 whitespace-pre-wrap">${result.raw_text}</p>
                    </div>
                </div>
                ` : ''}
                
                <!-- Métadonnées -->
                <div>
                    <h5 class="text-md font-medium text-gray-900 mb-3">Métadonnées :</h5>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-xs text-gray-500">Temps de traitement</p>
                            <p class="text-sm font-medium">${result.processing_time.toFixed(2)}s</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-xs text-gray-500">Nombre de pages</p>
                            <p class="text-sm font-medium">${result.page_count || 1}</p>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <p class="text-xs text-gray-500">Process ID</p>
                            <p class="text-sm font-medium font-mono">${result.process_id}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = `Résultat: ${result.filename}`;
        }
        openModal();
        
    } catch (error) {
        console.error('Erreur:', error);
        showErrorModal('Impossible de charger les détails');
    }
}

async function exportResult(processId, format) {
    try {
        showNotification(`Export en cours au format ${format.toUpperCase()}...`, 'info');
        
        const token = localStorage.getItem('auth_token');
        let downloadUrl;
        
        if (token) {
            // Export via l'API
            const response = await fetch(`${API_BASE_URL}/results/${processId}/export/${format}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                downloadFile(url, `ocr_result_${processId}.${format}`);
            } else {
                // Fallback sur l'export local
                exportLocalResult(processId, format);
            }
        } else {
            // Export local
            exportLocalResult(processId, format);
        }
        
    } catch (error) {
        console.error('Erreur d\'export:', error);
        showNotification('Erreur lors de l\'export', 'error');
    }
}

function exportLocalResult(processId, format) {
    const result = allResults.find(r => r.process_id === processId);
    
    if (!result) {
        showNotification('Résultat non trouvé', 'error');
        return;
    }
    
    let content, filename, mimeType;
    
    switch (format) {
        case 'json':
            content = JSON.stringify(result, null, 2);
            filename = `ocr_result_${processId}.json`;
            mimeType = 'application/json';
            break;
            
        case 'csv':
            content = convertToCSV(result);
            filename = `ocr_result_${processId}.csv`;
            mimeType = 'text/csv';
            break;
            
        case 'excel':
            // Pour Excel, on utiliserait une bibliothèque comme SheetJS
            // Ici, on exporte en CSV pour simplifier
            content = convertToCSV(result);
            filename = `ocr_result_${processId}.csv`;
            mimeType = 'text/csv';
            break;
            
        default:
            showNotification('Format non supporté', 'error');
            return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    downloadFile(url, filename);
}

function convertToCSV(result) {
    let csv = 'Field,Value,Confidence\n';
    
    if (result.extracted_data && result.extracted_data.fields) {
        Object.entries(result.extracted_data.fields).forEach(([fieldName, fieldValues]) => {
            fieldValues.forEach(fieldValue => {
                csv += `"${fieldName}","${fieldValue.value}",${fieldValue.confidence}\n`;
            });
        });
    }
    
    return csv;
}

function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Export terminé avec succès', 'success');
}

// Utilitaires
function showLoading() {
    const container = document.getElementById('resultsContainer');
    if (!container) return; // Ne rien faire si l'élément n'existe pas
    container.innerHTML = `
        <div class="text-center py-12">
            <svg class="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600">Chargement des résultats...</p>
        </div>
    `;
}

function showLoadingModal() {
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return; // Ne rien faire si l'élément n'existe pas
    modalContent.innerHTML = `
        <div class="text-center py-8">
            <svg class="animate-spin mx-auto h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-600">Chargement des détails...</p>
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById('resultsContainer');
    if (!container) return; // Ne rien faire si l'élément n'existe pas
    container.innerHTML = `
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
            <p class="mt-1 text-sm text-gray-500">${message}</p>
            <div class="mt-6">
                <button onclick="loadResults()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Réessayer
                </button>
            </div>
        </div>
    `;
}

function showErrorModal(message) {
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return; // Ne rien faire si l'élément n'existe pas
    modalContent.innerHTML = `
        <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
            <p class="mt-1 text-sm text-gray-500">${message}</p>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const colors = {
        info: 'blue',
        success: 'green',
        error: 'red',
        warning: 'yellow'
    };
    
    const color = colors[type];
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-md shadow-lg bg-${color}-100 border border-${color}-400 text-${color}-700`;
    notification.innerHTML = `
        <div class="flex items-center">
            <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>' :
                  type === 'error' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' :
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'}
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function openModal() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.classList.add('hidden');
    }
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

// Gérer les clics en dehors de la modale (seulement si la modale existe)
const resultModal = document.getElementById('resultModal');
if (resultModal) {
    resultModal.addEventListener('click', (e) => {
    if (e.target.id === 'resultModal') {
        closeModal();
    }
});
}