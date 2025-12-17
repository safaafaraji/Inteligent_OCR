import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
import redis
from fastapi import BackgroundTasks

from app.config import settings
from app.core.pipeline import OCRPipeline
from app.core.exporter import DataExporter
from app.utils.file_handler import save_temp_file, cleanup_temp_file

class OCRService:
    """Service de traitement OCR"""
    
    def __init__(self):
        self.pipeline = OCRPipeline()
        self.exporter = DataExporter()
        self.processing_status = {}
        
        # Connexion Redis pour le suivi des tâches (optionnel)
        try:
            self.redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=0
            )
        except:
            self.redis_client = None
    
    def process_single_file(self, file_bytes: bytes, filename: str, 
                           language: str = "fra+eng", user_id: Optional[int] = None) -> Dict[str, Any]:
        """Traite un seul fichier"""
        start_time = datetime.now()
        
        try:
            # Traitement avec le pipeline
            result = self.pipeline.process_document(file_bytes, filename, user_id)
            
            # Calcul du temps de traitement
            processing_time = (datetime.now() - start_time).total_seconds()
            result['processing_time'] = processing_time
            
            # Sauvegarde temporaire pour l'aperçu
            if 'preview_path' not in result:
                from app.core.preprocessor import ImagePreprocessor
                preprocessor = ImagePreprocessor()
                image = preprocessor.load_image(file_bytes, filename)
                if image is not None:
                    preview_path = preprocessor.save_preview(image, filename)
                    result['preview_url'] = preview_path
            
            # Mise à jour du statut
            self._update_status(result['process_id'], 'completed', result)
            
            return result
            
        except Exception as e:
            error_result = {
                'process_id': str(uuid.uuid4()),
                'filename': filename,
                'success': False,
                'error': str(e),
                'processing_time': (datetime.now() - start_time).total_seconds()
            }
            self._update_status(error_result['process_id'], 'failed', error_result)
            raise
    
    async def process_async(self, file_bytes: bytes, filename: str, language: str = "fra+eng",
                          user_id: Optional[int] = None, background_tasks: Optional[BackgroundTasks] = None) -> Dict[str, Any]:
        """Traite un fichier de manière asynchrone"""
        process_id = str(uuid.uuid4())
        
        # Initialisation du statut
        self._update_status(process_id, 'processing', {
            'filename': filename,
            'start_time': datetime.now().isoformat()
        })
        
        # Fonction de traitement en arrière-plan
        def process_in_background():
            try:
                result = self.process_single_file(file_bytes, filename, language, user_id)
                result['process_id'] = process_id
                return result
            except Exception as e:
                return {
                    'process_id': process_id,
                    'filename': filename,
                    'success': False,
                    'error': str(e)
                }
        
        if background_tasks:
            background_tasks.add_task(process_in_background)
            
            return {
                'process_id': process_id,
                'filename': filename,
                'status': 'processing',
                'message': 'Traitement démarré en arrière-plan'
            }
        else:
            # Traitement synchrone
            return process_in_background()
    
    def process_batch(self, files: List[Dict[str, Any]], user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Traite plusieurs fichiers"""
        return self.pipeline.batch_process(files, user_id)
    
    def export_result(self, result_data: Dict[str, Any], format: str = 'json') -> Dict[str, Any]:
        """Exporte les résultats"""
        return self.exporter.export(result_data, format)
    
    def export_batch_results(self, results: List[Dict[str, Any]], format: str = 'json') -> Dict[str, Any]:
        """Exporte plusieurs résultats"""
        return self.exporter.export_batch(results, format)
    
    def _update_status(self, process_id: str, status: str, data: Optional[Dict] = None):
        """Met à jour le statut d'un traitement"""
        self.processing_status[process_id] = {
            'status': status,
            'updated_at': datetime.now().isoformat(),
            'data': data or {}
        }
        
        # Sauvegarde dans Redis si disponible
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"ocr:status:{process_id}",
                    3600,  # Expire après 1 heure
                    json.dumps(self.processing_status[process_id])
                )
            except:
                pass
    
    async def get_processing_status(self, process_id: str) -> Dict[str, Any]:
        """Récupère le statut d'un traitement"""
        # Essayer Redis d'abord
        if self.redis_client:
            try:
                cached = self.redis_client.get(f"ocr:status:{process_id}")
                if cached:
                    return json.loads(cached)
            except:
                pass
        
        # Sinon utiliser la mémoire
        return self.processing_status.get(process_id, {'status': 'not_found'})
    
    def get_statistics(self) -> Dict[str, Any]:
        """Récupère les statistiques"""
        return self.pipeline.get_statistics()
    
    def cleanup_old_files(self, hours: int = 24):
        """Nettoie les anciens fichiers temporaires"""
        import tempfile
        import time
        import os
        
        temp_dir = tempfile.gettempdir()
        now = time.time()
        
        for filename in os.listdir(temp_dir):
            if filename.startswith('ocr_temp_'):
                filepath = os.path.join(temp_dir, filename)
                if os.path.isfile(filepath):
                    file_age = now - os.path.getmtime(filepath)
                    if file_age > hours * 3600:
                        try:
                            os.remove(filepath)
                        except:
                            pass