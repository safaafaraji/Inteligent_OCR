#!/usr/bin/env python3
"""
Script de démarrage simplifié
"""

import uvicorn
import os
import sys

# Ajouter le chemin actuel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("="*60)
    print("🚀 OCR Intelligent - Démarrage simplifié")
    print("="*60)
    print("📍 URL: http://localhost:8000")
    print("📄 Docs: http://localhost:8000/docs")
    print("🔑 Demo: demo / demo123")
    print("\n🛑 Ctrl+C pour arrêter")
    print("="*60 + "\n")
    
    uvicorn.run(
        "app.main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )