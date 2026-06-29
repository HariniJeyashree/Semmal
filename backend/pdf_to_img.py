import fitz # PyMuPDF

pdf_path = "test_resume.pdf"
output_path = r"C:\Users\harini jeyashree\.gemini\antigravity\brain\32ea78ff-7a28-4263-9d87-d5ef458559f9\test_resume.png"

doc = fitz.open(pdf_path)
page = doc.load_page(0) # First page
pix = page.get_pixmap(dpi=150)
pix.save(output_path)
print(f"Saved to {output_path}")
