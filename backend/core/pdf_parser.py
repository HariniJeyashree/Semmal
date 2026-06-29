import io
from pypdf import PdfReader

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from a raw PDF byte stream using pypdf.
    Returns the concatenated text of all pages.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
