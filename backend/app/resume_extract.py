"""
Resume text extraction — PDF and DOCX upload support.
Returns extracted text so frontend can preview/edit before submitting analysis.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import pdfplumber
import docx
import io

from .auth import get_current_user

router = APIRouter(prefix="/resume", tags=["resume"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/extract")
async def extract_resume_text(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    filename = (file.filename or "").lower()

    try:
        if filename.endswith(".pdf"):
            text = _extract_pdf(contents)
        elif filename.endswith(".docx"):
            text = _extract_docx(contents)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Upload a .pdf or .docx file.",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read file: {e}")

    text = text.strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="No text found in file — it may be scanned/image-based.",
        )

    return {"text": text, "filename": file.filename}


def _extract_pdf(contents: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_docx(contents: bytes) -> str:
    d = docx.Document(io.BytesIO(contents))
    return "\n".join(p.text for p in d.paragraphs if p.text.strip())
