import asyncio
import json
from agents.resume_optimizer import optimize_resume
from core.pdf_generator import generate_resume_pdf

async def main():
    resume_text = """
John Doe
johndoe@email.com | (123) 456-7890 | linkedin.com/in/johndoe

## Professional Summary
Software engineer with 5 years of experience in Python and React.

## Experience
### Software Engineer - Tech Corp
* Developed a high-throughput microservices architecture.
* Improved API response time by 40%.
* Mentored 3 junior engineers.

### Junior Developer - Startup Inc
* Wrote front-end components using React.
* Reduced bundle size by 15%.

## Projects
### E-Commerce Platform
* Built a full-stack e-commerce site using Next.js and Django.
* Handled 10,000 monthly active users.

### Chat App
* Created a real-time chat application using WebSockets.

## Certifications
* AWS Certified Solutions Architect
* Google Cloud Professional Engineer
    """
    
    job_description = """
    We are looking for a Senior Software Engineer with strong Python backend experience and some React knowledge.
    Must be able to mentor juniors and design microservices.
    """
    
    print("Running optimization...")
    result = await optimize_resume(resume_text, job_description)
    
    print("\n--- Validation Counts ---")
    print(json.dumps(result.get("validation", {}), indent=2))
    
    print("\n--- Generating PDF ---")
    pdf_bytes = generate_resume_pdf(result["rewritten_resume"])
    with open("test_resume.pdf", "wb") as f:
        f.write(pdf_bytes)
    print("Saved test_resume.pdf")

if __name__ == "__main__":
    asyncio.run(main())
