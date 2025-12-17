#!/usr/bin/env python3
"""
Script de démarrage de l'OCR Intelligent Avancé
"""

import os
import sys
import uvicorn
from pathlib import Path
import subprocess

def check_tesseract():
    """Vérifie que Tesseract est installé"""
    print("🔍 Vérification de Tesseract OCR...")
    
    try:
        import pytesseract
        
        # Essayer différentes localisations
        possible_paths = [
            '/usr/local/bin/tesseract',
            '/usr/bin/tesseract',
            '/opt/homebrew/bin/tesseract',
            'tesseract'  # Si dans le PATH
        ]
        
        tesseract_found = False
        for path in possible_paths:
            try:
                pytesseract.pytesseract.tesseract_cmd = path
                pytesseract.get_tesseract_version()
                print(f"✅ Tesseract trouvé: {path}")
                tesseract_found = True
                break
            except:
                continue
        
        if not tesseract_found:
            print("❌ Tesseract non trouvé")
            print("\n📦 Installation nécessaire:")
            print("  macOS: brew install tesseract tesseract-lang")
            print("  Linux: sudo apt-get install tesseract-ocr tesseract-ocr-fra tesseract-ocr-eng")
            print("  Windows: Télécharger depuis UB-Mannheim/tesseract")
            return False
        
        # Vérifier les langues
        try:
            langs = pytesseract.get_languages()
            print(f"✅ Langues disponibles: {', '.join(langs)}")
        except:
            print("⚠️  Impossible de vérifier les langues")
        
        return True
        
    except ImportError:
        print("❌ pytesseract non installé")
        print("  pip install pytesseract")
        return False

def check_dependencies():
    """Vérifie les dépendances Python"""
    print("\n🔍 Vérification des dépendances Python...")
    
    dependencies = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('pillow', 'PIL (traitement image)'),
        ('pytesseract', 'Tesseract OCR'),
        ('pdf2image', 'Conversion PDF'),
        ('opencv-python', 'Traitement image avancé'),
        ('pandas', 'Export CSV'),
        ('python-jose', 'JWT tokens')
    ]
    
    all_ok = True
    for module, name in dependencies:
        try:
            __import__(module.replace('-', '_'))
            print(f"✅ {name}")
        except ImportError as e:
            print(f"❌ {name}: {e}")
            all_ok = False
    
    return all_ok

def install_missing_deps():
    """Installe les dépendances manquantes"""
    print("\n📦 Installation des dépendances manquantes...")
    
    requirements = [
        'fastapi',
        'uvicorn[standard]',
        'python-multipart',
        'pytesseract',
        'pillow',
        'pdf2image',
        'opencv-python',
        'pandas',
        'python-jose[cryptography]',
        'passlib[bcrypt]',
        'aiofiles'
    ]
    
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install'] + requirements)
        print("✅ Dépendances installées")
        return True
    except Exception as e:
        print(f"❌ Erreur installation: {e}")
        return False

def create_directories():
    """Crée les répertoires nécessaires"""
    print("\n📁 Création des répertoires...")
    
    directories = [
        'uploads',
        'results',
        'exports',
        'static',
        'logs'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True, parents=True)
        print(f"  ✅ {directory}/")

def print_welcome():
    """Affiche le message de bienvenue"""
    print("\n" + "="*70)
    print("🚀 OCR INTELLIGENT - ÉDITION AVANCÉE")
    print("="*70)
    print("\n📋 Fonctionnalités principales:")
    print("  • 📄 Lecture de documents scannés (PDF, JPG, PNG, TIFF)")
    print("  • 🔍 Détection automatique: factures, CV, contrats, formulaires")
    print("  • 👤 Extraction: nom, prénom, email, téléphone, adresse")
    print("  • 💰 Données financières: montants, TVA, numéros de facture")
    print("  • 📝 Structuration: JSON détaillé et CSV exploitable")
    print("  • 🔄 Traitement par lots et téléchargement")
    
    print("\n📍 URLs:")
    print(f"  • Backend:  http://localhost:8000")
    print(f"  • API Docs: http://localhost:8000/docs")
    print(f"  • Frontend: http://localhost:3000")
    
    print("\n🔑 Authentification:")
    print("  • Utilisateur: demo")
    print("  • Mot de passe: demo123")
    
    print("\n📁 Répertoires créés:")
    print("  • uploads/   - Documents uploadés")
    print("  • results/   - Résultats JSON")
    print("  • exports/   - Fichiers exportés")
    
    print("\n🛑 Ctrl+C pour arrêter le serveur")
    print("="*70 + "\n")

def main():
    """Fonction principale"""
    
    # Vérifier Tesseract
    if not check_tesseract():
        sys.exit(1)
    
    # Vérifier dépendances Python
    if not check_dependencies():
        if input("\n📦 Installer les dépendances manquantes? (o/n): ").lower() == 'o':
            if not install_missing_deps():
                sys.exit(1)
        else:
            sys.exit(1)
    
    # Créer les répertoires
    create_directories()
    
    # Afficher le message de bienvenue
    print_welcome()
    
    # Démarrer le serveur
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            reload_dirs=["app"]
        )
    except KeyboardInterrupt:
        print("\n\n👋 Arrêt de l'application OCR Intelligent")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()