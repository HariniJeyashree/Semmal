import re
from fpdf import FPDF

class ResumePDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_margins(12.7, 12.7, 12.7) # 0.5 inches = 12.7mm
        self.set_auto_page_break(auto=True, margin=12.7)
        
    def add_name(self, text):
        self.set_font("helvetica", "B", 24)
        self.cell(0, 10, text, ln=True, align="C")
        self.ln(2)
        
    def add_contact(self, text):
        self.set_font("helvetica", "", 10)
        # Convert any generic separators to a clean ' | '
        clean_text = re.sub(r'\s*\|\s*', ' | ', text.strip())
        self.cell(0, 5, clean_text, ln=True, align="C")
        self.ln(6)
        
    def add_heading(self, text):
        self.ln(4)
        self.set_font("helvetica", "B", 14)
        self.set_text_color(40, 40, 40)
        self.cell(0, 8, text, ln=True)
        # Add a visual separator line (thin rule)
        x = self.get_x()
        y = self.get_y()
        self.set_line_width(0.3)
        self.set_draw_color(150, 150, 150)
        self.line(x, y, x + 185, y) # A4 width is 210, margins are 12.7 * 2 = 25.4. Line width = 184.6
        self.ln(3)
        self.set_text_color(0, 0, 0)
        
    def add_subheading(self, text):
        self.ln(2) # Spacing before job title
        self.set_x(self.l_margin)
        self.set_font("helvetica", "B", 11)
        self.multi_cell(0, 6, text)
        self.ln(1) # Small spacing before bullets
        
    def add_body_text(self, text):
        self.set_x(self.l_margin)
        self.set_font("helvetica", "", 10.5)
        self.multi_cell(0, 5, text)
        self.ln(1)
        
    def add_bullet(self, text):
        self.set_x(self.l_margin)
        self.set_font("helvetica", "", 10.5)
        bullet = chr(149) 
        
        # Draw bullet manually
        self.text(self.get_x() + 2, self.get_y() + 3.5, bullet)
        
        # Move X to create indent, then use multi_cell
        self.set_x(self.l_margin + 6)
        self.multi_cell(0, 5, text)
        
        # Reset X
        self.set_x(self.l_margin)
        self.ln(1)
        
    def add_skill_line(self, bold_part, regular_part):
        self.set_x(self.l_margin)
        self.set_font("helvetica", "B", 10.5)
        self.write(5, bold_part + " ")
        self.set_font("helvetica", "", 10.5)
        self.write(5, regular_part)
        self.ln(6)

def generate_resume_pdf(markdown_text: str) -> bytes:
    # Sanitize unicode characters that break FPDF's latin-1 helvetica font
    replacements = {
        '—': '-', '–': '-', '”': '"', '“': '"', '’': "'", '‘': "'", 
        '…': '...', '•': '-', '✓': '-', '✔': '-'
    }
    for search, replace in replacements.items():
        markdown_text = markdown_text.replace(search, replace)
    # Fallback for any other unsupported characters
    markdown_text = markdown_text.encode('latin-1', errors='replace').decode('latin-1')

    pdf = ResumePDF()
    pdf.add_page()
    
    lines = markdown_text.split('\n')
    
    # Simple state machine to parse markdown
    is_first_line = True
    in_skills = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Parse Name (usually the first H1)
        if line.startswith("# ") and is_first_line:
            pdf.add_name(line[2:].strip())
            is_first_line = False
            continue
            
        is_first_line = False
            
        # Parse Headings
        if line.startswith("## "):
            heading = line[3:].strip()
            pdf.add_heading(heading)
            in_skills = heading.lower() == "skills"
            continue
            
        # Parse Subheadings (H3 or bolded text standing alone)
        if line.startswith("### "):
            pdf.add_subheading(line[4:].strip())
            continue
            
        # Parse Bullets
        if line.startswith("- ") or line.startswith("* "):
            # Strip the bullet syntax and any bolding on the front
            content = line[2:].strip()
            # We can strip bolding `**` for simple text rendering
            content = content.replace("**", "")
            pdf.add_bullet(content)
            continue
            
        # Parse Contact Info (usually contains | or is just right after Name)
        if "|" in line and "##" not in line and pdf.get_y() < 40:
            pdf.add_contact(line)
            continue
            
        # Parse Skills (Bold Category: followed by text)
        if in_skills:
            match = re.match(r'^\*\*(.*?)\*\*\s*[:\-]?\s*(.*)$', line)
            if match:
                pdf.add_skill_line(match.group(1) + ":", match.group(2))
                continue
                
        # Parse Bold standalone lines (often Role/Company)
        if line.startswith("**") and line.endswith("**"):
            pdf.add_subheading(line.replace("**", ""))
            continue
            
        # Fallback to generic body text
        # Clean out markdown bold/italic tags just in case
        clean_text = line.replace("**", "").replace("*", "")
        pdf.add_body_text(clean_text)

    # Output bytes
    return bytes(pdf.output())
