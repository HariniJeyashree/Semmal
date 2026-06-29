from core.pdf_generator import generate_resume_pdf

markdown = """
# Harini Jeyashree A

**Software Engineer** — 5 years of experience!
“Smart quotes” and ‘smart single quotes’.
"""

try:
    pdf_bytes = generate_resume_pdf(markdown)
    with open("test_unicode.pdf", "wb") as f:
        f.write(pdf_bytes)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
