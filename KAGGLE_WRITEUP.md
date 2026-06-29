# Title: Semmal (செம்மல்): Semantic Matching & Bias Auditing via Multi-Agent Systems
## Subtitle: A Production-Ready Hiring Copilot & Career Mentor Built with Google ADK

---

## 📋 Project Architecture & Implementation

### Core Problem & Motivation
Modern recruitment and job preparation processes are inefficient and prone to bias. Applicants and students often struggle to understand their technical and soft skill gaps when targeting roles. Meanwhile, recruiter evaluation pipelines rely on rigid keywords, leading to missed opportunities. 

We built **Semmal (செம்மல்)** to address this. Our motivation was to create a unified workstation that helps users semantically evaluate their resumes against real job requirements, identify specific skill deficiencies, and generate personalized, actionable preparation pathways to bridge those gaps.

---

### Technical Hurdles & Goals
We aimed to design an asynchronous multi-agent system executing a strict analysis pipeline: `Job Description Extraction -> Vector DB Staging -> Ethics Auditing -> Preparation Generation`.

During development, several critical tasks and system failures had to be resolved:
* **Unicode Processing Issues:** Scripts crashed with `UnicodeEncodeError` when trying to print output indicators (`✅` / `❌`) on Windows terminals operating under default encodings (like `cp1252`).
* **Hanging Automated Test Suites:** The pytest discovery suite would hang indefinitely. This occurred because multiple `test_*.py` files executed global database connections and network searches on import rather than isolating them within run scopes.
* **Workspace Cleanliness:** Nested tracking folders (`.git`) in the repository structure blocked standard unified version control.

---

### System Design & Implementation
To achieve our goals, we implemented the following strategies:
* **Encoding Optimization:** Refactored script print environments to configure `sys.stdout` natively to UTF-8 on Windows, avoiding terminal failures.
* **Scope Refactoring:** Isolated all testing logic inside clean execution blocks (`if __name__ == "__main__":`) to prevent imports from initiating network calls during test discovery.
* **Structured Multi-Agent Pipeline:**
  * **JD Analyzer:** Distills raw text inputs into key requirements.
  * **Semantic Ranker:** Embeds and index resume text inside **ChromaDB** collections to compute semantic match scores.
  * **Bias Detector (Ethics Guardrail):** Audits the ranker's logic to flag demographic, gender, age, or educational biases.
  * **Interview Planner:** Generates customized interview plans based on gaps.
* **Security & Database Integration:** Parameterized all queries using **SQLModel** ORM to prevent SQL Injection, and secured authentication by storing refresh tokens in `HttpOnly` and `SameSite` cookies.

---

### Final Outcomes & Architecture
We successfully built and deployed a production-ready application. Users can upload resume PDFs, view real-time agent execution outputs, review bias audit logs, and obtain custom-tailored interview plans.

#### Technical Stack Used:
* **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion.
* **Backend:** FastAPI, Google Gemini GenAI SDK, SQLModel, PostgreSQL (Neon), ChromaDB (Vector Search), Slowapi (Rate Limiting).
* **Containerization:** Docker Compose for single-command deployments.
