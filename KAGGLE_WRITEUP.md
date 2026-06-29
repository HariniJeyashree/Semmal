# Title: Semmal (செம்மல்): Semantic Matching & Bias Auditing via Multi-Agent Systems
## Subtitle: A Production-Ready Hiring Copilot & Career Mentor Built with Google ADK

---

## 📋 Project Architecture & Implementation

### Core Problem & Motivation
Modern recruitment and job preparation processes are inefficient and prone to bias. Applicants and students often struggle to understand their technical and soft skill gaps when targeting roles. Meanwhile, recruiter evaluation pipelines rely on rigid keywords, leading to missed opportunities. 

We built **Semmal (செம்மல்)** to address this. Our motivation was to create a unified workstation that helps users semantically evaluate their resumes against real job requirements, identify specific skill deficiencies, and generate personalized, actionable preparation pathways to bridge those gaps.

---

### Technical Hurdles & Goals
We aimed to design a highly parallel, asynchronous multi-agent pipeline executing: `JD Extraction -> Vector DB Staging -> Ethics Auditing -> Preparation Generation`.

During development, we faced several engineering hurdles:
* **LLM API Concurrency Rate Limits (429 Errors):** Concurrently evaluating batches of resume texts caused rapid spikes in requests, triggering immediate API rate-limit errors and disrupting the pipeline.
* **Structured Output Schema Breaches:** LLMs frequently formatted JSON objects incorrectly, wrapped outputs in markdown code blocks, or returned incomplete schemas, causing parser crashes during backend ingestion.
* **Concurrency Deadlocks & Connection Timeouts:** Offloading ratings and interview plans to our PostgreSQL database concurrently resulted in connection timeouts and transactional deadlocks on Neon.
* **Cross-Candidate Context Leakage:** Managing multiple candidate resume texts inside a unified Vector database environment posed risk of retrieval interference and data leakages.

---

### System Design & Implementation
To address these technical roadblocks and ensure a production-grade release:
* **Exponential Backoffs & Fallbacks:** Built custom retry decorators with exponential backoffs to catch 429 exceptions. If a service provider is fully saturated, the client routes queries to a fallback model tier.
* **Schema Enforcement via Pydantic:** Configured native structured outputs forcing model responses to compile strictly against validation boundaries defined by Pydantic models, preventing runtime crashes.
* **SQL Transaction Retry & Rollback Wrappers:** Integrated transactional middleware that catches connection errors, performs immediate rollbacks, and schedules sequential retries.
* **Ephemeral ChromaDB Ingestion Isolation:** Designed dynamic ChromaDB collection allocation mapped directly to distinct `job_session_id` tokens, ensuring total context isolation.
* **Authentication Safeguards:** Used `HttpOnly` cookie wrappers to secure refresh tokens against XSS, and enabled rate limiters to protect credential endpoints.

---

### Final Outcomes & Architecture
We successfully built and deployed a production-ready application. Users can upload resume PDFs, view real-time agent execution outputs, review bias audit logs, and obtain custom-tailored interview plans.

#### Technical Stack Used:
* **Frontend:** Next.js 14, React, Tailwind CSS, Framer Motion.
* **Backend:** FastAPI, Google Gemini GenAI SDK, SQLModel, PostgreSQL (Neon), ChromaDB (Vector Search), Slowapi (Rate Limiting).
* **Containerization:** Docker Compose for single-command deployments.
