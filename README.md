# Semmal (செம்மல்): Multi-Agent Hiring & Skill-Gap Analysis Copilot

An enterprise-grade multi-agent hiring and career preparation workstation that analyzes job descriptions, semantically ranks resumes, audits evaluations for biases, and generates customized technical and behavioral interview preparation guides.

---

## 📋 Project Narrative (STAR Method)

### 1. Situation & Motivation
Modern recruitment and job preparation are fragmented. Traditional Applicant Tracking Systems (ATS) rely on rigid keyword matching, filtering out qualified candidates or students who lack specific phrasing. Additionally, students often struggle to understand their specific skill gaps when targeting roles, and manual evaluation of resume alignment is highly biased and slow.

**What Made Us Build This:** 
We built **Semmal** to bridge this gap. Our motivation is to help candidates and students understand exactly where they stand relative to real-world job requirements, identify their technical and behavioral skill gaps, and provide them with personalized, AI-driven interview preparation plans to target their desired job roles.

---

### 2. Task & Challenges Faced
During development, we faced several technical roadblocks:
* **Windows Terminal Unicode Crashes:** The setup verification scripts output status emojis (`✅` and `❌`). In Windows environments, standard command prompts and PowerShell defaults run with restrictive local encodings (such as `cp1252`), leading to complete program execution crashes with `UnicodeEncodeError`.
* **Hanging Test Suites:** Global `pytest` test discovery imported all `test_*.py` files. Because multiple test modules executed database queries, remote Neon API queries, or DuckDuckGo searches directly at the module-level scope (instead of wrapping them in isolated run scopes), pytest would hang indefinitely waiting for network and DB timeouts during discovery.
* **Nested Git Structures:** The workspace had a sub-directory containing a separate `.git` tracking context, which prevented git from cleanly staging and committing the unified codebase into a single repository.

---

### 3. Action taken
To resolve these issues and complete the pipeline:
* **UTF-8 Output Reconfiguration:** We updated the startup script to reconfigure the Python stdout encoding to `utf-8` on initialization, enabling reliable multi-platform rendering of emojis and special characters on Windows.
* **Refactoring Execution Scopes:** We isolated testing scripts from raw module-level execution to prevent imports from triggering active database calls.
* **Multi-Agent Orchestration & Security:** 
  * Implemented a structured four-stage agent pipeline (`JD Extraction -> RAG Matching -> Bias Auditing -> Interview Generation`).
  * Used `SQLModel` ORM to execute parameterized database transactions, preventing SQL Injection vulnerabilities.
  * Stored refresh tokens in secure, `HttpOnly` and `SameSite` cookies to neutralize Cross-Site Scripting (XSS) attacks.
  * Added `slowapi` rate-limiting policies to prevent authentication brute-force attacks.

---

### 4. Result & Tech Stack
The final result is a responsive, highly secure web application containing a complete recruitment workstation. 

#### 🛠️ Tech Stack
* **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion, Lucide Icons.
* **Backend:** Python FastAPI, Google Gemini GenAI SDK, Pydantic (Structured Outputs).
* **Data & Storage:** ChromaDB (local Vector search), Neon PostgreSQL (via SQLModel) for persistent storage of AI sessions, SQLite (local backup).
* **Security & Infrastructure:** Slowapi (Rate Limiting), Bcrypt (Secure Password Hashing), PyPDF (Server-side PDF Extraction), Docker Compose.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python verify_setup.py
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the animated dashboard.
