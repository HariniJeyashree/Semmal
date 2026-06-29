# Semmal (செம்மல்): Multi-Agent Hiring & Skill-Gap Analysis Copilot

An enterprise-grade multi-agent hiring and career preparation workstation that analyzes job descriptions, semantically ranks resumes, audits evaluations for biases, and generates customized technical and behavioral interview preparation guides.

---

## 📋 Project Development & Journey

### Project Background & Motivation
Modern recruitment and job preparation are fragmented. Traditional Applicant Tracking Systems (ATS) rely on rigid keyword matching, filtering out qualified candidates or students who lack specific phrasing. Additionally, students often struggle to understand their specific skill gaps when targeting roles, and manual evaluation of resume alignment is highly biased and slow.

**What Made Us Build This:** 
We built **Semmal** to bridge this gap. Our motivation is to help candidates and students understand exactly where they stand relative to real-world job requirements, identify their technical and behavioral skill gaps, and provide them with personalized, AI-driven interview preparation plans to target their desired job roles.

### Technical Roadblocks & Challenges Faced
During the development and scaling of the multi-agent system, we encountered several advanced architectural challenges:
* **API Rate Limiting & Concurrency Exhaustion (429 Errors):** When running batch evaluations for multiple candidate resumes concurrently, sequential API calls easily exceeded the provider's RPM (Requests Per Minute) limits, resulting in `429 Too Many Requests` API exceptions and failed evaluations.
* **Schema Validation & Unstructured LLM Outputs:** Models would occasionally return markdown-wrapped JSON code blocks (e.g. ````json ... ````) or omit required parameters, causing JSON parser failures and application crashes when saving data to PostgreSQL.
* **Context-Collided Search Query Hallucinations (e.g. Music Video Recommendations):** In the resource-recommendation phase, querying public search engines using raw, LLM-generated keywords returned highly irrelevant results. For instance, searching for the technical skill `"DAX"` (Data Analysis Expressions for Power BI) yielded music videos by the rap artist *Dax* rather than technical tutorials.
* **Transient Database Connections & Concurrency Collisions:** Concurrently committing evaluation scores and generated interview questions for multiple candidates to our cloud Neon PostgreSQL database frequently caused connection timeouts and transaction collisions.
* **Vector Isolation & Context Leakage:** Ingesting multiple candidate resumes into a global ChromaDB instance threatened cross-candidate context leakage, where search queries for one job role could retrieve matches from previous sessions.

---

### Engineering Solutions & Security Actions
To address these technical roadblocks and deliver a secure, production-grade application, we implemented the following strategies:
* **Resilient API Retries & Fallbacks:** Designed a custom wrapper with exponential backoff and retry decorators to gracefully handle `429` rate limits. If primary model services fail, the system automatically redirects requests to secondary fallback LLM providers.
* **Strict Structured Outputs via Pydantic:** Leveraged native structured completions utilizing strict Pydantic model definitions. This forces the LLM to output valid, parsed JSON matching our database schemas, throwing safe validation exceptions and default backups rather than runtime crashes.
* **Decoupled Targeted Search with Domain-Scoped Operators:** Decoupled the resource lookup process entirely from the LLM context. The LLM is restricted strictly to identifying the missing skill names. The backend then programmatically queries the search engine using quoted terms and strict domain scoping (e.g., `"{skill}" tutorial site:freecodecamp.org OR site:developer.mozilla.org OR site:youtube.com`), successfully filtering out irrelevant musical or commercial search results.
* **Database Session Retry & Rollback Wrappers:** Wrapped our SQLAlchemy/SQLModel commits in retry logic. If a connection fails or encounters a transient deadlock, the transaction is rolled back and re-attempted, ensuring transaction integrity.
* **Dynamic Collection Isolation:** Implemented session-scoped ChromaDB collection instantiation. Each hiring pipeline session generates a isolated collection mapped to the specific `job_session_id`, ensuring candidate data is segregated and context leakage is prevented.
* **Authentication Safeguards:** Stored JWT refresh tokens in `HttpOnly` and `SameSite` cookies to protect against XSS, and integrated `slowapi` rate limiting on login/register endpoints to mitigate brute-force vectors.

---

### Project Deliverables & Outcomes
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
