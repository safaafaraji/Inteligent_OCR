#!/usr/bin/env python3
"""
Script de démarrage simplifié
"""

import os
import sys
import uvicorn
from pathlib import Path

def check_tesseract():
    """Vérifie que Tesseract est installé"""
    print("🔍 Vérification de Tesseract OCR...")
    
    try:
        import pytesseract
        
        # Essayer d'exécuter tesseract
        try:
            pytesseract.get_tesseract_version()
            print("✅ Tesseract trouvé")
            return True
        except:
            print("❌ Tesseract non trouvé dans le PATH")
            print("\n📦 Installation nécessaire:")
            print("  macOS: brew install tesseract tesseract-lang")
            print("  Linux: sudo apt-get install tesseract-ocr tesseract-ocr-fra")
            return False
        
    except ImportError:
        print("❌ pytesseract non installé")
        print("  pip install pytesseract")
        return False

def install_dependencies():
    """Installe les dépendances manquantes"""
    print("\n📦 Installation des dépendances...")
    
    dependencies = [
        'fastapi',
        'uvicorn[standard]',
        'python-multipart',
        'pytesseract',
        'pillow',
        'pdf2image',
        'pandas',
        'python-jose[cryptography]',
        'passlib[bcrypt]',
        'aiofiles'
    ]
    
    try:
        import subprocess
        subprocess.run([sys.executable, '-m', 'pip', 'install'] + dependencies)
        print("✅ Dépendances installées")
        return True
    except Exception as e:
        print(f"❌ Erreur installation: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Démarrage OCR Intelligent...")
    
    # Vérifier Tesseract
    if not check_tesseract():
        sys.exit(1)
    
    # Créer les répertoires
    directories = ['uploads', 'results', 'exports', 'static']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True, parents=True)
    
    # Afficher les informations
    print("\n" + "="*60)
    print("OCR INTELLIGENT - PRÊT À L'EMPLOI")
    print("="*60)
    print("\n📍 Accès:")
    print(f"  • API:      http://localhost:8000")
    print(f"  • Docs:     http://localhost:8000/docs")
    print(f"  • Health:   http://localhost:8000/health")
    
    print("\n🔑 Identifiants:")
    print("  • Utilisateur: demo")
    print("  • Mot de passe: demo123")
    
    print("\n📁 Répertoires:")
    for directory in directories:
        print(f"  • {directory}/")
    
    print("\n🛑 Ctrl+C pour arrêter")
    print("="*60 + "\n")
    
    # Démarrer le serveur
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Arrêt de l'application")
        sys.exit(0)

if __name__ == "__main__":
    main()