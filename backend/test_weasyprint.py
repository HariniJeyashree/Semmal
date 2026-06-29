from weasyprint import HTML

try:
    HTML(string="<h1>Test</h1>").write_pdf("test.pdf")
    print("WEASYPRINT_SUCCESS")
except Exception as e:
    print(f"WEASYPRINT_FAILED: {e}")
