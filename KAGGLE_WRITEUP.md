# Title: AI Recruiter: Semantic Matching & Bias Auditing via Multi-Agent Systems
## Subtitle: A Production-Ready Hiring Copilot Built with Google ADK

## Problem
Modern hiring is broken. Traditional Applicant Tracking Systems (ATS) rely on brittle keyword matching, often filtering out highly qualified candidates who use different terminology. Furthermore, unconscious bias—whether demographic, educational, or experiential—plagues human recruitment decisions.

## Motivation
Our goal is to build an intelligent "Hiring Copilot" that leverages the reasoning capabilities of LLMs to *semantically* understand candidates, while simultaneously injecting an autonomous "Auditor" agent to catch AI hallucinations or systemic biases.

## Architecture
We designed a Multi-Agent architecture using Google Gemini GenAI SDK and Next.js, consisting of:
1. **Frontend**: A Framer-Motion powered Next.js dashboard providing real-time execution graphs and drag-and-drop PDF uploading via native multipart/form-data.
2. **Backend**: FastAPI orchestrating the AI Agents, utilizing `pypdf` for clean, server-side resume extraction.
3. **Semantic Core**: ChromaDB for local semantic vector storage and retrieval.
4. **Data Persistence**: SQLModel integration directly connecting to a cloud Neon PostgreSQL database to permanently persist the AI's complex reasoning, scores, and generated interview questions.

## Innovation
The core innovation is the **Bias Detector Agent**. Instead of blindly trusting the Semantic Ranker, our system explicitly hands the reasoning to a separate "Critic" agent tasked *only* with finding ethical violations, demographic flags, or unfair reasoning before the human recruiter sees the score.

## Technical Design
The Orchestrator Agent creates an asynchronous pipeline for each candidate:
`JD Extraction -> RAG Matching -> Bias Auditing -> Interview Generation`. 
By breaking the monolith into specialized agents, we achieve highly focused, explainable outputs.

## Agent Workflow
- **JD Analyzer**: Distills raw text into core requirements.
- **Semantic Ranker**: Explains *why* a candidate fits.
- **Bias Detector**: Overrides scores if unethical reasoning is found.
- **Interview Planner**: Outputs custom questions based on the Ranker's identified gaps.

## Security
We integrated strict schema validation (Pydantic), PII masking (simulated), and ethical boundary prompting to ensure secure handling of resume data. 

## Deployment
The entire platform is containerized using Docker Compose, allowing one-command deployment (`docker compose up`) of the Vector DB, FastAPI backend, and Next.js frontend.

## Results
The result is a visually stunning, technically sophisticated platform that proves Agents can be used safely in high-stakes environments like HR.

## Future Work
Integration with Model Context Protocol (MCP) to autonomously schedule interviews on Google Calendar and fetch candidate open-source contributions directly from GitHub.
