import os  # Ajouter en haut du fichier
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
import uuid
import asyncio
from datetime import datetime
import logging

from app.schemas.ocr import OCRResponse, BatchOCRResponse
from app.utils.ocr_processor import OCRProcessor
from app.utils.file_utils import FileUtils
from app.utils.export_utils import ExportUtils
from app.config import settings
from app.database.session import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/ocr", tags=["OCR"])
logger = logging.getLogger(__name__)

# Initialiser le processeur OCR
ocr_processor = OCRProcessor(
    tesseract_path=settings.TESSERACT_PATH,
    default_language=settings.DEFAULT_LANGUAGE
)

@router.post("/upload", response_model=OCRResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = Form(settings.DEFAULT_LANGUAGE),
    export_format: str = Form("json"),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload et traitement d'un fichier
    """
    try:
        # Valider la taille du fichier
        file.file.seek(0, 2)  # Aller à la fin
        file_size = file.file.tell()
        file.file.seek(0)  # Retourner au début
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Fichier trop volumineux. Taille maximale: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Sauvegarder le fichier
        file_path, unique_filename = await FileUtils.save_upload_file(file, user_id)
        
        # Lire le contenu du fichier
        file_content = await file.read()
        
        # Générer un ID de processus
        process_id = str(uuid.uuid4())
        
        # Traitement en arrière-plan
        background_tasks.add_task(
            process_ocr_task,
            process_id=process_id,
            file_content=file_content,
            file_path=file_path,
            filename=file.filename,
            language=language,
            export_format=export_format,
            user_id=user_id,
            db=db
        )
        
        # Réponse immédiate
        return OCRResponse(
            success=True,
            process_id=process_id,
            filename=file.filename,
            document_type="unknown",
            confidence=0.0,
            extracted_data={},
            processing_time=0.0,
            download_urls={}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur upload fichier: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process/{process_id}")
async def process_ocr(
    process_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Traitement OCR pour un processus existant
    """
    try:
        # Vérifier si le processus existe
        # (Implémenter la logique de vérification en base de données)
        
        # Simuler un traitement
        background_tasks.add_task(
            simulate_processing,
            process_id=process_id,
            db=db
        )
        
        return {
            "success": True,
            "message": "Traitement démarré",
            "process_id": process_id
        }
        
    except Exception as e:
        logger.error(f"Erreur traitement OCR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
async def batch_process(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    language: str = Form(settings.DEFAULT_LANGUAGE),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Traitement par lots
    """
    try:
        batch_id = str(uuid.uuid4())
        results = []
        
        for file in files:
            process_id = str(uuid.uuid4())
            
            # Sauvegarder le fichier
            file_path, unique_filename = await FileUtils.save_upload_file(file, user_id)
            file_content = await file.read()
            
            # Ajouter au traitement en arrière-plan
            background_tasks.add_task(
                process_ocr_task,
                process_id=process_id,
                file_content=file_content,
                file_path=file_path,
                filename=file.filename,
                language=language,
                export_format="json",
                user_id=user_id,
                db=db
            )
            
            results.append({
                "process_id": process_id,
                "filename": file.filename,
                "status": "processing"
            })
        
        return BatchOCRResponse(
            success=True,
            total_files=len(files),
            successful_files=len(files),
            failed_files=0,
            results=[],
            batch_id=batch_id
        )
        
    except Exception as e:
        logger.error(f"Erreur traitement batch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Fonctions de tâches en arrière-plan
async def process_ocr_task(
    process_id: str,
    file_content: bytes,
    file_path: str,
    filename: str,
    language: str,
    export_format: str,
    user_id: Optional[int],
    db: Session
):
    """
    Tâche de traitement OCR en arrière-plan
    """
    try:
        start_time = datetime.now()
        
        # Traitement OCR
        result = ocr_processor.process_file(file_content, filename, language)
        
        if not result['success']:
            # Mettre à jour le statut en base de données
            update_document_status(db, process_id, "failed", result.get('error'))
            return
        
        # Créer un aperçu
        preview_path = None
        if result.get('pages'):
            preview_dir = os.path.join(settings.STATIC_DIR, "previews")
            os.makedirs(preview_dir, exist_ok=True)
            preview_path = FileUtils.create_preview(
                file_path,
                preview_dir
            )
        
        # Exporter les résultats
        export_results = {}
        export_dir = os.path.join(settings.UPLOAD_DIR, "exports")
        os.makedirs(export_dir, exist_ok=True)
        
        base_filename = f"export_{process_id}"
        
        # Exporter dans le format demandé
        if export_format == 'json':
            json_path = os.path.join(export_dir, f"{base_filename}.json")
            ExportUtils.to_json(result, json_path)
            export_results['json'] = json_path
            
        elif export_format == 'csv':
            csv_path = os.path.join(export_dir, f"{base_filename}.csv")
            ExportUtils.to_csv(result, csv_path)
            export_results['csv'] = csv_path
            
        elif export_format == 'excel':
            excel_path = os.path.join(export_dir, f"{base_filename}.xlsx")
            ExportUtils.to_excel(result, excel_path)
            export_results['excel'] = excel_path
        
        # Calculer le temps de traitement
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Sauvegarder les résultats en base de données
        save_results_to_db(
            db=db,
            process_id=process_id,
            result=result,
            file_path=file_path,
            filename=filename,
            preview_path=preview_path,
            export_paths=export_results,
            processing_time=processing_time,
            user_id=user_id
        )
        
    except Exception as e:
        logger.error(f"Erreur tâche OCR: {str(e)}")
        # Mettre à jour le statut en base de données
        update_document_status(db, process_id, "failed", str(e))

async def simulate_processing(process_id: str, db: Session):
    """
    Simulation de traitement pour les tests
    """
    try:
        await asyncio.sleep(2)  # Simuler un délai
        
        # Mettre à jour le statut en base de données
        update_document_status(db, process_id, "completed")
        
    except Exception as e:
        logger.error(f"Erreur simulation: {str(e)}")

# Fonctions d'aide pour la base de données
def update_document_status(db: Session, process_id: str, status: str, error_message: str = None):
    """
    Met à jour le statut d'un document
    """
    # À implémenter avec les modèles SQLAlchemy
    pass

def save_results_to_db(
    db: Session,
    process_id: str,
    result: dict,
    file_path: str,
    filename: str,
    preview_path: str,
    export_paths: dict,
    processing_time: float,
    user_id: Optional[int]
):
    """
    Sauvegarde les résultats en base de données
    """
    # À implémenter avec les modèles SQLAlchemy
    pass