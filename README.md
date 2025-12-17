# OCR Intelligent - Application d'Extraction Automatique de Données

## 📋 Description
Application web complète pour l'extraction OCR intelligente depuis des documents scannés. Transformez vos PDF, images et documents en données structurées automatiquement.

## ✨ Fonctionnalités

### Backend (FastAPI)
- **API RESTful** avec documentation Swagger/OpenAPI
- **Traitement OCR** avec Tesseract
- **Base de données** SQLite avec SQLAlchemy
- **Authentification** JWT sécurisée
- **Upload de fichiers** avec validation
- **Export multiple** (JSON, CSV, Excel)
- **Traitement par lots**
- **Gestion des sessions utilisateur**

### Frontend (HTML/CSS/JS)
- **Interface moderne** avec Tailwind CSS
- **Upload drag & drop**
- **Visualisation des résultats**
- **Historique des traitements**
- **Responsive design**
- **Authentification complète**

## 🚀 Installation Rapide

### Prérequis
- Python 3.9+
- Tesseract OCR
- Node.js (optionnel pour un serveur frontend plus avancé)

### Installation sur macOS
```bash
# 1. Installer Tesseract
brew install tesseract

# 2. Cloner et configurer
git clone <repository>
cd ocr-intelligent

# 3. Installer les dépendances Python
cd backend
pip install -r requirements.txt

# 4. Démarrer le backend
python start.py