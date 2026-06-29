# Demo Video Pitch Script (5 Minutes)

## 1. Opening Hook (0:00 - 0:30)
**Visual**: Screen recording of the AI Recruiter dashboard loading with beautiful Framer Motion animations.
**Narration**: "Traditional hiring relies on brittle keyword matching and is plagued by unconscious bias. Today, I'm presenting the **AI Recruiter**, a multi-agent Copilot built with Google ADK that doesn't just scan resumes—it understands them, ranks them semantically, and actively audits itself for ethical bias."

## 2. Architecture & The 'Hiring Team' (0:30 - 1:30)
**Visual**: Show the Mermaid Architecture Diagram.
**Narration**: "Under the hood, we aren't using a monolithic prompt. We built a team of specialized agents: an Orchestrator, a JD Analyzer, a Semantic Ranker, a Bias Detector, and an Interview Planner. The frontend is Next.js, communicating with a FastAPI backend backed by ChromaDB for RAG."

## 3. Live Demo - The Magic (1:30 - 3:30)
**Visual**: Uploading 3 mock resumes and pasting a Job Description into the dashboard. Clicking "Run Multi-Agent Analysis".
**Narration**: "Let's see it in action. I'm uploading three resumes for a Senior AI Engineer role. As the Orchestrator routes tasks, you can see the execution timeline in real-time. The Ranker uses vector embeddings to understand that 'experience with large language models' matches 'LLM deployment', even if the keywords differ."

**Visual**: Zoom in on the "Bias Alert".
**Narration**: "Here's the innovation: Our Bias Detector agent runs independently to audit the Ranker's logic. Notice how it flagged Candidate 2? The ranker penalized them for a non-traditional educational path. The Bias agent caught this, flagged it for human review, and ensured a fairer process."

## 4. Technical Highlights (3:30 - 4:30)
**Visual**: Briefly flash the code for `bias_detector.py` and `orchestrator.py`.
**Narration**: "We used Google ADK to define strict schemas for agent outputs, ensuring the Next.js UI always receives perfectly formatted JSON. We also implemented MCP (Model Context Protocol) to allow agents to securely parse local PDFs without hallucinating data."

## 5. Closing & Roadmap (4:30 - 5:00)
**Visual**: Show the `docker-compose.yml` file, then back to the Dashboard.
**Narration**: "The entire system is production-ready and deploys with one command via Docker. In the future, we plan to let the Interview Planner agent use MCP to autonomously schedule calendar invites. Thank you."
