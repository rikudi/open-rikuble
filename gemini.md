# Gemini Assistant Instructions for KoulutusBot Project

When performing implementation tasks, modifications, or providing information about the KoulutusBot project, you must adhere to the following guidelines and consult the appropriate planning documents.

## 1. Understand the Request's Context

Before writing any code or answering a question, determine if the request relates to:
- **High-Level Architecture, Vision, or Strategy:** (e.g., "How should user profiles be structured?", "What are the branding colors?", "How does the credit system work?")
- **Specific, Phased Implementation Tasks:** (e.g., "What is the next task for the MVP?", "Implement the quiz generation prompt", "Set up the Supabase client.")

## 2. Consult the Correct Document

Based on the context, refer to the designated project plan.

### For High-Level Architecture & Strategy, refer to `docs/KOULUTUSBOT_PLAN.md`

This document is the source of truth for:
- **Core Concepts:** The overall vision, content generation types, and target markets.
- **System Architecture:** How different parts of the application are designed to work together.
- **Database Schema:** The structure of the Supabase tables (`profiles`, `educational_content`, etc.), their columns, and relationships.
- **Row Level Security (RLS) Policies:** Rules for data access.
- **Branding and Design System:** Color palette (`--koulutus-primary`), typography, and component design principles.
- **Revenue Model:** The credit-based system, pricing, and subscription tiers.
- **Export and Sharing Logic:** High-level plans for formats like PDF, SCORM, and QR codes.

**Example:** If asked to add a new field to the user profile, consult the `profiles` table schema in `KOULUTUSBOT_PLAN.md` first.

### For Step-by-Step Implementation, refer to `docs/IMPLEMENTATION_PLAN.md`

This document provides a detailed, phased roadmap for building the project. Use it for:
- **Current Phase Tasks:** Identifying the specific technical tasks for the current development phase (e.g., Phase 0, Phase 1).
- **Code Snippets & Examples:** Finding exact code for prompts (`QUIZ_GENERATION_PROMPT`), Supabase client setup, and other technical details.
- **Components and APIs:** Knowing which components to create (e.g., `QuizPlayer.tsx`) or which API routes to modify.
- **Deliverables & Milestones:** Understanding the specific goals and success metrics for the current implementation stage.

**Example:** If asked to "start working on the MVP," go to `Phase 1: MVP - Basic Quiz Generator` in `IMPLEMENTATION_PLAN.md` and begin with the first unchecked technical task.

## 3. Workflow Summary

1.  **Analyze:** What is the user asking for? Is it a broad architectural question or a specific implementation step?
2.  **Consult:**
    - For "Why" or "What", see `docs/KOULUTUSBOT_PLAN.md`.
    - For "How" or "What's next", see `docs/IMPLEMENTATION_PLAN.md`.
3.  **Implement:** Write code that is consistent with **both** documents. The implementation details from the `IMPLEMENTATION_PLAN.md` must fit within the overall architecture defined in `KOULUTUSBOT_PLAN.md`.
4.  **Verify:** Ensure your changes align with the project's goals, phases, and technical specifications outlined in the plans.
