#!/usr/bin/env python3
"""
Script de démarrage de l'application OCR Intelligent
"""

import os
import sys
import uvicorn
from pathlib import Path
import subprocess

# Ajouter le répertoire parent au chemin Python
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

def check_dependencies():
    """Vérifie les dépendances nécessaires"""
    print("🔍 Vérification des dépendances...")
    
    # Vérifier Tesseract
    try:
        import pytesseract
        tesseract_path = os.getenv('TESSERACT_PATH', '/usr/local/bin/tesseract')
        if not os.path.exists(tesseract_path):
            print(f"⚠️  Tesseract non trouvé à {tesseract_path}")
            print("📦 Installation recommandée:")
            print("   macOS: brew install tesseract")
            print("   Linux: sudo apt-get install tesseract-ocr tesseract-ocr-fra")
            print("   Windows: Télécharger depuis GitHub UB-Mannheim/tesseract")
        else:
            print("✅ Tesseract OK")
    except ImportError:
        print("❌ pytesseract non installé")
        return False
    
    # Vérifier les autres dépendances Python
    dependencies = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'ASGI server'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('pillow', 'PIL'),
        ('pandas', 'Pandas'),
        ('passlib', 'Passlib'),
        ('python_jose', 'JWT')
    ]
    
    for module, name in dependencies:
        try:
            __import__(module.replace('-', '_'))
            print(f"✅ {name} OK")
        except ImportError as e:
            print(f"❌ {name} non installé: {e}")
            return False
    
    return True

def create_directories():
    """Crée les répertoires nécessaires"""
    directories = [
        'uploads',
        'uploads/anonymous',
        'uploads/exports',
        'static',
        'static/previews',
        'logs',
        'models'
    ]
    
    for directory in directories:
        dir_path = Path(directory)
        dir_path.mkdir(exist_ok=True, parents=True)
        print(f"📁 Créé: {directory}")

def print_welcome():
    """Affiche le message de bienvenue"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║                                                             ║
    ║           OCR INTELLIGENT - APPLICATION DE DÉMO            ║
    ║                                                             ║
    ╚════════════════════════════════════════════════════════════╝
    
    📍 Backend:  http://localhost:8000
    📍 API Docs: http://localhost:8000/docs
    📍 Frontend: http://localhost:3000 (si lancé séparément)
    
    🔑 Identifiants démo:
        • Utilisateur: demo
        • Mot de passe: demo123
    
    🔒 Authentification:
        • JWT tokens avec expiration
        • Hash des mots de passe avec argon2
        • Protection contre les attaques courantes
    
    ⚠️  Note: Cette application utilise une base de données en mémoire
              pour la démo. Les données seront perdues au redémarrage.
    """)

def run_tests():
    """Exécute les tests d'authentification"""
    print("\n🧪 Exécution des tests d'authentification...")
    try:
        result = subprocess.run(
            [sys.executable, "test_auth.py"],
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("⚠️  Avertissements:", result.stderr)
    except Exception as e:
        print(f"❌ Erreur lors des tests: {e}")

def main():
    """Fonction principale"""
    print("🚀 Démarrage de l'application OCR Intelligent...")
    
    # Vérifier les dépendances
    if not check_dependencies():
        print("\n❌ Dépendances manquantes. Installation:")
        print("   pip install -r requirements.txt")
        sys.exit(1)
    
    # Créer les répertoires
    create_directories()
    
    # Afficher le message de bienvenue
    print_welcome()
    
    # Exécuter les tests
    run_tests()
    
    # Démarrer le serveur
    print("\n🌐 Démarrage du serveur... (Ctrl+C pour arrêter)")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        reload_dirs=["app"]
    )

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Arrêt de l'application")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        sys.exit(1)