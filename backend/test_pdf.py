from core.pdf_generator import generate_resume_pdf

markdown = """# John Doe
john.doe@example.com | (555) 123-4567 | New York, NY

## Professional Summary
Experienced Software Engineer with a passion for building scalable web applications.

## Skills
**Languages:** Python, TypeScript, SQL
**Tools:** Docker, Git, AWS

## Experience
**Senior Software Engineer** at Tech Corp
*Jan 2020 - Present*
- Developed a high-performance microservices architecture using FastAPI.
- Improved database query performance by 40%.
- Led a team of 5 engineers to deliver the product ahead of schedule.

## Projects
**AI Resume Optimizer**
- Built an AI-powered resume optimizer using LLMs and Next.js.
- Implemented robust PDF generation and ATS-safe formatting.

## Education
**B.S. in Computer Science**
University of Tech | May 2019
"""

pdf_bytes = generate_resume_pdf(markdown)
with open("test_resume.pdf", "wb") as f:
    f.write(pdf_bytes)
print("PDF generated successfully.")
