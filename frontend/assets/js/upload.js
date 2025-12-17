// Variables globales
let selectedFiles = [];
let uploadQueue = [];
let isProcessing = false;
let currentProcessId = null;

// Initialisation de la page
function initPage() {
    initializeUploadZone();
    initializeFileInput();
    updateProcessButton();
}

// Initialiser la zone de dépôt
function initializeUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    if (!uploadZone || !fileInput) return;

    // Cliquer sur la zone déclenche le file input
    uploadZone.addEventListener('click', () => fileInput.click());

    // Gérer le drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

// Initialiser l'input fichier
function initializeFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
        // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers à nouveau
        fileInput.value = '';
    });
}

// Gérer les fichiers sélectionnés
function handleFiles(files) {
    const validFiles = files.filter(file => isValidFile(file));
    
    if (validFiles.length === 0 && files.length > 0) {
        showNotification('Certains fichiers ne sont pas supportés. Formats acceptés : PDF, JPG, PNG, TIFF', 'error');
        return;
    }

    // Ajouter les fichiers valides à la liste
    validFiles.forEach(file => {
        if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
        }
    });

    // Mettre à jour l'affichage
    updateFileList();
    updateProcessButton();
}

// Vérifier si un fichier est valide
function isValidFile(file) {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/tiff',
        'image/tif'
    ];
    
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    
    return allowedTypes.includes(file.type) || allowedExtensions.includes(extension);
}

// Mettre à jour la liste des fichiers
function updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }

    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="result-card p-4 flex items-center justify-between fade-in">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    ${getFileIcon(file.name)}
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900 truncate max-w-xs">
                        ${file.name}
                    </p>
                    <p class="text-xs text-gray-500">
                        ${formatFileSize(file.size)}
                    </p>
                </div>
            </div>
            <button onclick="removeFile(${index})" 
                    class="text-gray-400 hover:text-red-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

// Supprimer un fichier de la liste
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateProcessButton();
}

// Mettre à jour l'état du bouton de traitement
function updateProcessButton() {
    const processButton = document.getElementById('processButton');
    if (!processButton) return;

    processButton.disabled = selectedFiles.length === 0 || isProcessing;
    processButton.textContent = isProcessing ? 'Traitement en cours...' : 'Démarrer l\'analyse';
}

// Gérer le processus OCR
async function processOCR() {
    if (selectedFiles.length === 0 || isProcessing) return;

    const language = document.getElementById('languageSelect').value;
    const documentType = document.getElementById('documentType').value;
    
    isProcessing = true;
    updateProcessButton();
    
    // Afficher la barre de progression
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');
    
    if (progressContainer) progressContainer.classList.remove('hidden');
    
    try {
        // Traiter chaque fichier
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Mettre à jour la progression
            const progress = Math.round((i / selectedFiles.length) * 100);
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progressPercent) progressPercent.textContent = `${progress}%`;
            if (progressText) progressText.textContent = `Traitement du fichier ${i + 1}/${selectedFiles.length}`;
            
            // Uploader le fichier
            if (progressText) progressText.textContent = `Upload du fichier ${i + 1}/${selectedFiles.length}: ${file.name}`;
            
            const result = await api.uploadFile(file, language, (uploadProgress) => {
                // Calculer la progression globale
                const fileProgress = uploadProgress / selectedFiles.length;
                const totalProgress = (i * 100) + fileProgress;
                if (progressBar) progressBar.style.width = `${Math.min(totalProgress, 100)}%`;
                if (progressPercent) progressPercent.textContent = `${Math.round(Math.min(totalProgress, 100))}%`;
            });
            
            console.log('Résultat upload:', result);
            
            // Vérifier si la réponse contient success ou process_id
            if (result && (result.success || result.process_id)) {
                // Stocker l'ID du processus pour le suivi
                currentProcessId = result.process_id || result.result?.process_id;
                
                // Mettre à jour la progression
                const finalProgress = Math.round(((i + 1) / selectedFiles.length) * 100);
                if (progressBar) progressBar.style.width = `${finalProgress}%`;
                if (progressPercent) progressPercent.textContent = `${finalProgress}%`;
                if (progressText) progressText.textContent = `Fichier ${i + 1}/${selectedFiles.length} traité avec succès`;
                
                // Rediriger vers la page des résultats après le dernier fichier
                if (i === selectedFiles.length - 1) {
                    showNotification('Traitement terminé ! Redirection vers les résultats...', 'success');
                    
                    // Attendre 2 secondes puis rediriger
                    setTimeout(() => {
                        window.location.href = `results.html?process_id=${currentProcessId}`;
                    }, 2000);
                }
            } else {
                // Si la réponse n'a pas le format attendu, essayer de parser l'erreur
                const errorMsg = result?.detail || result?.error || result?.message || 'Erreur lors du traitement';
                throw new Error(errorMsg);
            }
        }
        
    } catch (error) {
        console.error('OCR Processing Error:', error);
        
        // Afficher un message d'erreur détaillé
        let errorMessage = 'Erreur lors du traitement';
        if (error.message) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        showNotification(`Erreur : ${errorMessage}`, 'error');
        
        // Réinitialiser l'état
        isProcessing = false;
        updateProcessButton();
        
        // Cacher la barre de progression
        if (progressContainer) progressContainer.classList.add('hidden');
        
        // Réinitialiser les fichiers sélectionnés pour permettre un nouvel essai
        selectedFiles = [];
        updateFileList();
    }
}

// Exposer les fonctions globales
window.removeFile = removeFile;

// Attacher les événements
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    
    // Attacher le bouton de traitement
    const processButton = document.getElementById('processButton');
    if (processButton) {
        processButton.addEventListener('click', processOCR);
    }
    
    // Ajouter un raccourci clavier pour upload (Ctrl + U)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            document.getElementById('fileInput').click();
        }
    });
});