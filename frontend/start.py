#!/usr/bin/env python3
"""
Script de démarrage du frontend (serveur de développement simple)
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 3000
FRONTEND_DIR = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        # Ajouter les en-têtes CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def print_welcome():
    """Affiche le message de bienvenue"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║                                                             ║
    ║           OCR INTELLIGENT - FRONTEND DE DÉMO               ║
    ║                                                             ║
    ╚════════════════════════════════════════════════════════════╝
    
    📍 Frontend: http://localhost:3000
    📍 Backend:  http://localhost:8000
    
    📂 Pages disponibles:
        • /              - Page d'accueil
        • /index.html    - Page d'accueil
        • /upload.html   - Téléchargement de documents
        • /results.html  - Résultats d'extraction
        • /history.html  - Historique des traitements
        • /login.html    - Connexion
        • /register.html - Inscription
    
    ⚠️  Note: Ce serveur est uniquement pour le développement.
              Pour la production, utilisez un serveur comme Nginx.
    """)

def main():
    """Fonction principale"""
    print("🚀 Démarrage du frontend OCR Intelligent...")
    
    # Vérifier que le répertoire existe
    if not FRONTEND_DIR.exists():
        print(f"❌ Répertoire frontend non trouvé: {FRONTEND_DIR}")
        sys.exit(1)
    
    # Afficher le message de bienvenue
    print_welcome()
    
    # Démarrer le serveur
    os.chdir(FRONTEND_DIR)
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"\n🌐 Serveur démarré sur http://localhost:{PORT}")
        print("📁 Répertoire:", FRONTEND_DIR)
        print("\n🛑 Appuyez sur Ctrl+C pour arrêter le serveur\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Arrêt du serveur")
            httpd.shutdown()

if __name__ == "__main__":
    main()