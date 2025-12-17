// Variables globales
let historyData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let totalItems = 0;
let totalPages = 1;
let deleteItemId = null;
let searchTimeout = null;

// Initialisation de la page
function initPage() {
    loadHistory();
    setupEventListeners();
}

// Charger l'historique
async function loadHistory() {
    try {
        showLoadingState(true);
        
        // Dans une version réelle, on récupérerait les données de l'API
        // Pour l'exemple, on simule des données
        await simulateApiCall();
        
        // Appliquer les filtres
        filterHistory();
        
        // Mettre à jour les statistiques
        updateStatistics();
        
    } catch (error) {
        console.error('Load History Error:', error);
        showNotification('Erreur lors du chargement de l\'historique', 'error');
        showEmptyState(true);
    } finally {
        showLoadingState(false);
    }
}

// Simuler un appel API (à remplacer par un vrai appel)
async function simulateApiCall() {
    return new Promise(resolve => {
        setTimeout(() => {
            // Données d'exemple
            historyData = [
                {
                    id: '1',
                    filename: 'facture_janvier.pdf',
                    original_filename: 'facture_janvier.pdf',
                    document_type: 'invoice',
                    status: 'completed',
                    confidence: 0.92,
                    file_size: 2456789,
                    page_count: 3,
                    processing_time: 4.5,
                    upload_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    extracted_data_count: 15,
                    preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: '2',
                    filename: 'recu_restaurant.jpg',
                    original_filename: 'recu_restaurant.jpg',
                    document_type: 'receipt',
                    status: 'completed',
                    confidence: 0.87,
                    file_size: 1234567,
                    page_count: 1,
                    processing_time: 2.3,
                    upload_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    extracted_data_count: 8,
                    preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: '3',
                    filename: 'contrat_location.pdf',
                    original_filename: 'contrat_location.pdf',
                    document_type: 'contract',
                    status: 'completed',
                    confidence: 0.95,
                    file_size: 5678901,
                    page_count: 8,
                    processing_time: 12.7,
                    upload_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    extracted_data_count: 32,
                    preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                },
                {
                    id: '4',
                    filename: 'formulaire_inscription.png',
                    original_filename: 'formulaire_inscription.png',
                    document_type: 'form',
                    status: 'processing',
                    confidence: null,
                    file_size: 987654,
                    page_count: 2,
                    processing_time: null,
                    upload_date: new Date().toISOString(),
                    extracted_data_count: 0,
                    preview_url: null
                },
                {
                    id: '5',
                    filename: 'lettre_recommandation.tiff',
                    original_filename: 'lettre_recommandation.tiff',
                    document_type: 'letter',
                    status: 'failed',
                    confidence: 0.42,
                    file_size: 3456789,
                    page_count: 2,
                    processing_time: 3.8,
                    upload_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    extracted_data_count: 5,
                    preview_url: null
                }
            ];
            
            // Ajouter plus de données pour la pagination
            for (let i = 6; i <= 25; i++) {
                historyData.push({
                    id: i.toString(),
                    filename: `document_${i}.pdf`,
                    original_filename: `document_${i}.pdf`,
                    document_type: ['invoice', 'receipt', 'contract', 'form'][Math.floor(Math.random() * 4)],
                    status: ['completed', 'processing', 'failed'][Math.floor(Math.random() * 3)],
                    confidence: Math.random() * 0.5 + 0.5,
                    file_size: Math.floor(Math.random() * 5000000) + 100000,
                    page_count: Math.floor(Math.random() * 10) + 1,
                    processing_time: Math.random() * 10 + 1,
                    upload_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    extracted_data_count: Math.floor(Math.random() * 20) + 5,
                    preview_url: Math.random() > 0.2 ? 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' : null
                });
            }
            
            resolve();
        }, 1000);
    });
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Recherche avec debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => filterHistory(), 300);
        });
    }
    
    // Fermer la modal avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDeleteModal();
        }
    });
}

// Filtrer l'historique
function filterHistory() {
    const statusFilter = document.getElementById('statusFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const periodFilter = document.getElementById('periodFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    
    filteredData = historyData.filter(item => {
        // Filtre par statut
        if (statusFilter !== 'all' && item.status !== statusFilter) {
            return false;
        }
        
        // Filtre par type
        if (typeFilter !== 'all' && item.document_type !== typeFilter) {
            return false;
        }
        
        // Filtre par période
        if (periodFilter !== 'all') {
            const itemDate = new Date(item.upload_date);
            const now = new Date();
            
            switch (periodFilter) {
                case 'today':
                    if (itemDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (itemDate < weekAgo) return false;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    if (itemDate < monthAgo) return false;
                    break;
                case 'year':
                    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    if (itemDate < yearAgo) return false;
                    break;
            }
        }
        
        // Filtre par recherche
        if (searchInput && !item.filename.toLowerCase().includes(searchInput) && 
            !item.original_filename.toLowerCase().includes(searchInput)) {
            return false;
        }
        
        return true;
    });
    
    // Trier par date (plus récent d'abord)
    filteredData.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
    
    // Mettre à jour l'affichage
    totalItems = filteredData.length;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    currentPage = 1;
    
    updatePagination();
    updateTable();
    updateResultsCount();
}

// Mettre à jour le tableau
function updateTable() {
    const tableBody = document.getElementById('historyTable');
    const emptyState = document.getElementById('emptyState');
    
    if (!tableBody || !emptyState) return;
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Calculer les éléments à afficher pour la page actuelle
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const pageItems = filteredData.slice(startIndex, endIndex);
    
    tableBody.innerHTML = pageItems.map(item => `
        <tr>
            <td>
                <div class="flex items-center">
                    ${getFileIcon(item.filename)}
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                            ${item.filename}
                        </div>
                        <div class="text-sm text-gray-500">
                            ${formatFileSize(item.file_size)}
                            ${item.page_count > 1 ? ` · ${item.page_count} pages` : ''}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${getDocumentTypeLabel(item.document_type)}
                </span>
            </td>
            <td>
                ${getStatusBadge(item.status)}
            </td>
            <td>
                ${item.confidence ? `
                    <div class="flex items-center">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full ${getConfidenceColorClass(item.confidence)}" 
                                 style="width: ${item.confidence * 100}%"></div>
                        </div>
                        <span class="ml-2 text-sm text-gray-600">${(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                ` : '<span class="text-gray-400">-</span>'}
            </td>
            <td class="text-sm text-gray-900">
                ${formatDate(item.upload_date)}
            </td>
            <td class="text-sm text-gray-900">
                ${item.processing_time ? `${item.processing_time.toFixed(1)}s` : '-'}
            </td>
            <td>
                <div class="flex space-x-2">
                    ${item.status === 'completed' ? `
                        <button onclick="viewResult('${item.id}')" 
                                class="text-blue-600 hover:text-blue-900" 
                                title="Voir les résultats">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    ` : ''}
                    ${item.status === 'completed' ? `
                        <button onclick="exportSingle('${item.id}')" 
                                class="text-green-600 hover:text-green-900" 
                                title="Exporter">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                        </button>
                    ` : ''}
                    <button onclick="openDeleteModal('${item.id}')" 
                            class="text-red-600 hover:text-red-900" 
                            title="Supprimer">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Mettre à jour la pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const totalItemsEl = document.getElementById('totalItems');
    const pageButtons = document.getElementById('pageButtons');
    
    if (!pagination || !currentPageEl || !totalPagesEl || !totalItemsEl || !pageButtons) return;
    
    if (filteredData.length <= itemsPerPage) {
        pagination.classList.add('hidden');
        return;
    }
    
    pagination.classList.remove('hidden');
    
    currentPageEl.textContent = currentPage;
    totalPagesEl.textContent = totalPages;
    totalItemsEl.textContent = filteredData.length;
    
    // Générer les boutons de page
    let buttons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajuster le début si on est près de la fin
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Bouton pour la première page
    if (startPage > 1) {
        buttons += `
            <button onclick="goToPage(1)" 
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
            </button>
            ${startPage > 2 ? '<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>' : ''}
        `;
    }
    
    // Boutons des pages
    for (let i = startPage; i <= endPage; i++) {
        buttons += `
            <button onclick="goToPage(${i})" 
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium 
                           ${i === currentPage ? 'bg-blue-50 text-blue-600 border-blue-500 z-10' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                ${i}
            </button>
        `;
    }
    
    // Bouton pour la dernière page
    if (endPage < totalPages) {
        buttons += `
            ${endPage < totalPages - 1 ? '<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>' : ''}
            <button onclick="goToPage(${totalPages})" 
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                ${totalPages}
            </button>
        `;
    }
    
    pageButtons.innerHTML = buttons;
}

// Mettre à jour les statistiques
function updateStatistics() {
    const totalDocs = historyData.length;
    const completedDocs = historyData.filter(d => d.status === 'completed').length;
    const successRate = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;
    const totalProcessingTime = historyData.filter(d => d.processing_time).reduce((sum, d) => sum + d.processing_time, 0);
    const avgProcessingTime = completedDocs > 0 ? (totalProcessingTime / completedDocs).toFixed(1) : 0;
    const totalPages = historyData.reduce((sum, d) => sum + (d.page_count || 0), 0);
    
    document.getElementById('totalDocuments').textContent = totalDocs.toLocaleString();
    document.getElementById('successRate').textContent = `${successRate}%`;
    document.getElementById('avgProcessingTime').textContent = `${avgProcessingTime}s`;
    document.getElementById('totalPages').textContent = totalPages.toLocaleString();
}

// Mettre à jour le compteur de résultats
function updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = filteredData.length.toLocaleString();
    }
}

// Fonctions de pagination
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
        updatePagination();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        updateTable();
        updatePagination();
    }
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateTable();
        updatePagination();
    }
}

// Fonctions utilitaires
function getDocumentTypeLabel(type) {
    const labels = {
        'invoice': 'Facture',
        'receipt': 'Reçu',
        'contract': 'Contrat',
        'form': 'Formulaire',
        'letter': 'Lettre',
        'report': 'Rapport'
    };
    return labels[type] || type;
}

function getStatusBadge(status) {
    const badges = {
        'completed': '<span class="badge status-completed">Terminé</span>',
        'processing': '<span class="badge status-processing">En cours</span>',
        'failed': '<span class="badge status-failed">Échoué</span>',
        'pending': '<span class="badge status-pending">En attente</span>'
    };
    return badges[status] || `<span class="badge">${status}</span>`;
}

function getConfidenceColorClass(confidence) {
    if (confidence > 0.8) return 'bg-green-500';
    if (confidence > 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
}

// Fonctions d'affichage
function showLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.classList.toggle('hidden', !show);
    }
}

function showEmptyState(show) {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.toggle('hidden', !show);
    }
}

// Fonctions d'action
function viewResult(id) {
    window.location.href = `results.html?process_id=${id}`;
}

function exportSingle(id) {
    showNotification('Export en cours...', 'info');
    // Dans une version réelle, on appellerait l'API
    setTimeout(() => {
        showNotification('Document exporté avec succès', 'success');
    }, 1000);
}

function openDeleteModal(id) {
    deleteItemId = id;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeDeleteModal() {
    deleteItemId = null;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

async function confirmDelete() {
    if (!deleteItemId) return;
    
    try {
        showNotification('Suppression en cours...', 'info');
        
        // Dans une version réelle, on appellerait l'API
        // await api.deleteDocument(deleteItemId);
        
        // Simuler la suppression
        historyData = historyData.filter(item => item.id !== deleteItemId);
        filteredData = filteredData.filter(item => item.id !== deleteItemId);
        
        closeDeleteModal();
        filterHistory();
        updateStatistics();
        
        showNotification('Document supprimé avec succès', 'success');
        
    } catch (error) {
        console.error('Delete Error:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

function refreshHistory() {
    loadHistory();
    showNotification('Historique actualisé', 'success');
}

async function exportAll() {
    showNotification('Export de tous les documents en cours...', 'info');
    
    // Simuler l'export
    setTimeout(() => {
        showNotification('Tous les documents ont été exportés avec succès', 'success');
    }, 2000);
}

function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('typeFilter').value = 'all';
    document.getElementById('periodFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    filterHistory();
}

// Recherche avec debounce
function debouncedSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterHistory(), 300);
    }
}

// Exposer les fonctions globales
window.prevPage = prevPage;
window.nextPage = nextPage;
window.goToPage = goToPage;
window.viewResult = viewResult;
window.exportSingle = exportSingle;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.refreshHistory = refreshHistory;
window.exportAll = exportAll;
window.clearFilters = clearFilters;
window.filterHistory = filterHistory;
window.debouncedSearch = debouncedSearch;

// Initialiser la page
document.addEventListener('DOMContentLoaded', initPage);