# PRD: XYZ AI — Human-Like AI School Assistant

**Version:** 1.0
**Author:** [Your Name]
**Date:** Aug 2026
**Stack philosophy:** Every component below has a free tier, open-source option, or no-cost local alternative. Paid upgrades are noted as optional "if budget allows."

---

## 1. Objective

Build **XYZ AI**, a standalone Applied AI assistant that serves Students, Parents, Teachers, and Principal/Management through Chat, Voice, and an AI Avatar. It must detect role, understand intent, extract entities, keep context, pick the right persona, enforce permissions, call mock APIs, and reply naturally in 11 languages — all using free tooling so the assessment is fully reproducible without a budget.

---

## 2. Scope & Non-Goals

**In scope:** chat UI, role-based intent handling for the 4 required use cases, voice I/O, a 2D/3D avatar with lip-sync, escalation flow, multilingual replies, RBAC-enforced mock API layer, demo deployment.

**Out of scope (assessment-level):** real ERP integration, production-grade scaling, payment/billing, real SMS/call dispatch (mocked only), App Store deployment.

---

## 3. Users & Personas

| Role | Persona Tone | Primary Capability |
|---|---|---|
| Student | Friendly, supportive Academic Assistant | View own attendance, marks, timetable (attendance is mandatory use case) |
| Parent | Caring, patient Parent Support Assistant | View child's attendance, escalate to teacher |
| Teacher | Professional Teaching Assistant | Mark attendance, view class roster |
| Principal | Professional Management Assistant | School-wide attendance analytics |

Each persona = a system-prompt profile + allowed tool list + tone guide, selected **after** role is authenticated (never inferred from free text alone).

---

## 4. High-Level Architecture

```
[Web/Mobile Chat UI] ─┐
[Voice UI (mic)] ──────┼──► [Gateway / Auth Middleware] ──► [Orchestrator (LLM + Tool Router)]
[Avatar UI] ───────────┘                                          │
                                                                    ├──► [Mock API Layer] (attendance, escalation, roster)
                                                                    ├──► [RBAC / Policy Engine]
                                                                    ├──► [Context/Memory Store]
                                                                    └──► [Translation Layer]
```

- **Frontend:** React + Vite, deployed free on Vercel/Netlify.
- **Backend/Orchestrator:** Node.js (Express) or Python (FastAPI), deployed free on Render/Railway/Fly.io free tier.
- **LLM:** intent detection, entity extraction, and natural response generation.
- **Mock APIs:** JSON-based REST endpoints simulating the school ERP (attendance, escalation ticketing).
- **RBAC:** enforced in the backend tool layer, not the prompt (per spec's security requirement).

---

## 5. Free Tool Mapping (core decision table)

| Capability | Free Tool(s) | Notes |
|---|---|---|
| LLM (NLU + generation) | **Groq API free tier** (Llama 3.1/3.3, very fast) or **Google Gemini API free tier** (gemini-2.0-flash) or local **Ollama** running Llama 3.1 8B / Phi-3 | Groq/Gemini free tiers are generous and low-latency; Ollama is zero-cost but needs local GPU/CPU. Pick Groq or Gemini for the demo, mention Ollama as offline fallback in README. |
| Speech-to-Text | **OpenAI Whisper (open-source, self-hosted)** or **faster-whisper** | Fully free, runs locally or on Render free instance (small model). |
| Text-to-Speech | **Coqui TTS (open-source)** or **Piper TTS (open-source, very fast, supports Indic languages)** or **gTTS** (Google Translate TTS, free, simple) | Piper is recommended — lightweight, offline, decent Indian-language voices. |
| Avatar + Lip-sync | **Ready Player Me** (free 3D avatar creation) + **Three.js/React Three Fiber** for rendering + **Rhubarb Lip Sync (open-source)** for viseme generation from audio | Fully free path; avoids paid avatar APIs like D-ID/HeyGen. A 2D fallback: **Lottie/Rive** animated character synced to audio amplitude if 3D lip-sync is too heavy for timeline. |
| Translation (11 languages) | **Bhashini API (Govt of India, free for Indian languages)** — covers Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Kannada, Malayalam, Urdu | Purpose-built free government API for exactly this language set; strong fit. Fallback: LLM itself can translate (Gemini/Groq handle multilingual generation natively — can skip a separate translation call for MVP). |
| Database (users, context, mock ERP data) | **MongoDB Atlas free tier (M0 cluster, 512MB)** or **Firebase free tier (Firestore)** or simple **SQLite/JSON files** for a pure-mock demo | MongoDB Atlas M0 is free forever, works well with a Node/Express backend via Mongoose, and its flexible schema suits the varied record shapes (attendance, escalations, chat history) here. No built-in row-level security like Postgres/Supabase, so RBAC/ownership checks must live entirely in the application layer (already the plan per Section 6.5). |
| Session/context memory | In-memory (Redis free tier via Upstash) or simply conversation array stored in MongoDB per session | Upstash Redis free tier is enough for short-term context; MongoDB works too if you want persistence without adding Redis. |
| Hosting — frontend | **Vercel / Netlify free tier** | |
| Hosting — backend | **Render free web service** or **Railway free tier** or **Fly.io free allowance** | Cold starts on free tiers — mention in README. |
| Auth (login, roles) | **Firebase Auth (free tier)** or simple JWT issued by your own backend | Pairs naturally with MongoDB Atlas since neither is tied to a specific database vendor; JWT-your-own is simplest for a demo. |
| Voice call/interruption handling in browser | **Web Speech API** (built into Chrome, free) for lightweight STT/TTS fallback if not self-hosting Whisper/Piper | Good for a fast MVP demo; swap to Whisper/Piper for the "real" pipeline. |
| Repo/CI | **GitHub free** + **GitHub Actions free minutes** | |

**Recommended MVP combo for fastest build:** Gemini 2.0 Flash (free tier) for LLM + Web Speech API for STT/TTS (browser-native, zero setup) + Ready Player Me + Rhubarb for avatar + MongoDB Atlas free tier for data + Firebase Auth (or your own JWT) for login. Swap Web Speech API → Whisper/Piper later if a fully self-hosted voice pipeline is required by evaluators.

---

## 6. Functional Requirements

### 6.1 Chat-Based AI
- Multi-turn chat UI with persistent history per session (stored in MongoDB, keyed by user_id + session_id).
- LLM performs: role confirmation → intent classification → entity extraction (e.g., student name, date) → tool call → natural-language response.
- Must ask clarifying questions when entities are missing (e.g., Teacher says "Mark absent" without naming a student → AI asks "Which student?").
- Must support follow-ups referencing prior turns ("What about yesterday?" after an attendance answer).

**Intent set (minimum):**
| Intent | Roles allowed | Mock API |
|---|---|---|
| get_own_attendance | Student | GET /attendance/student/{id} |
| get_child_attendance | Parent | GET /attendance/student/{childId} (must own the child mapping) |
| mark_attendance | Teacher | POST /attendance/mark |
| get_school_attendance_analytics | Principal | GET /attendance/analytics |
| escalate_to_teacher | Student, Parent | POST /escalation/request |
| escalate_to_management | Student, Parent | POST /escalation/request |

### 6.2 AI Avatar + Voice
Flow: **Mic → STT (Whisper/Web Speech API) → Orchestrator → LLM response → TTS (Piper/Web Speech API) → Viseme/lip-sync mapping → Avatar render.**
- Avatar shows idle/talking/listening states.
- Latency target for demo: under ~3s round trip is acceptable (document as a known constraint of free-tier hosting).

### 6.3 Escalation to Real Teacher / Management
- Triggered by dissatisfaction phrases or explicit request ("talk to teacher," "not satisfied").
- AI must ask for confirmation before creating a mock ticket.
- Only after the mock API returns success does the AI say the request was submitted — **never claim success speculatively** (explicit spec requirement).
- Escalation record: `{ id, requesterId, role, targetRole, studentId, reason, status, createdAt }`.

### 6.4 Language Support
- User can pick a language in-app or address the AI in it.
- Two implementation paths (either is acceptable, document your choice):
  1. **LLM-native multilingual generation** — Gemini/Groq generate replies directly in target language (simplest, fewer moving parts).
  2. **Bhashini pipeline** — English pipeline internally + Bhashini translation layer at input/output boundary (closer to "real" enterprise pattern, better for showing translation-layer architecture).
- Recommendation: implement path 1 for MVP speed, mention path 2 in README as the production-grade alternative.

### 6.5 Security & RBAC
- JWT (or Firebase Auth session) carries `userId` + `role`, verified server-side on every tool call — **never trust role claims from chat text.**
- Tool/function layer checks: does this role have permission for this specific action + this specific target (e.g., a parent can only fetch *their own* child's attendance, checked via a parent-student mapping table, not by trusting an ID the LLM extracted from text).
- Prompt-injection mitigations:
  - System prompt kept server-side, never exposed to the model output shown to the user.
  - Output filtering: strip/refuse any response that echoes system-prompt content or credentials.
  - Tool calls are the only way to reach data — the LLM can't freeform-query the database.
- Rate limiting on backend endpoints (e.g., free **Upstash Redis** rate limiter) to blunt automated abuse.
- Log every tool call with role + target for auditability.

---

## 7. Mock API Layer (spec)

```
GET  /attendance/student/:studentId          -> { studentId, name, percentage, records[] }
GET  /attendance/analytics                    -> { schoolAvg, classBreakdown[] }
POST /attendance/mark   { studentId, date, status } -> { success, record }
POST /escalation/request { requesterId, role, targetRole, studentId, reason } -> { ticketId, status }
GET  /escalation/:ticketId                    -> { status }
GET  /users/:id/relationships                  -> { childrenIds? , classIds? }  // used for RBAC ownership checks
```
All backed by static JSON/Postgres seed data — no real school system needed.

---

## 8. Data Model (minimum viable)

- **users**: id, name, role, language_pref
- **parent_student_map**: parent_id, student_id
- **teacher_class_map**: teacher_id, class_id
- **students**: id, name, class_id
- **attendance**: id, student_id, date, status
- **escalations**: id, requester_id, target_role, student_id, reason, status, created_at
- **sessions/messages**: session_id, user_id, role, message, timestamp (for chat memory)

---

## 9. Repository Structure

```
School ERP Ecosystem
├── 01. Student Repository/student-portal
├── 02. Parent Repository/parent-portal
├── 03. Management Repository/management-portal
├── 04. Staff Repository/staff-portal
└── 05. XYZ AI Repository/xyz-ai
    ├── frontend/           # React chat + avatar UI
    ├── backend/             # orchestrator, RBAC, mock API
    ├── voice/               # STT/TTS integration
    ├── avatar/              # Ready Player Me + Rhubarb lip-sync assets
    ├── docs/                # README, architecture diagrams, demo video link
    └── PRD.md
```
The four portal repos can be lightweight stubs (even static pages) since the assessment centers on `xyz-ai`.

---

## 10. Non-Functional Requirements

- **Cost:** $0 to run the full demo using the free tiers listed in Section 5.
- **Latency:** chat response <3s typical on free-tier hosting; document cold-start caveat.
- **Reliability:** graceful fallback message if an LLM or mock API call fails (never silent failure).
- **Auditability:** every tool call logged with actor role + action + target.
- **Portability:** entire stack runnable locally via `docker-compose` for offline grading if evaluators lack internet access to free-tier services.

---

## 11. Suggested Build Timeline (for a solo/small-team assessment)

| Phase | Days | Deliverable |
|---|---|---|
| 1 | 1 | Repo scaffold, mock API + seed data, RBAC middleware |
| 2 | 1–2 | Chat UI + LLM orchestrator + 4 core intents working end-to-end (text only) |
| 3 | 1 | Escalation flow + confirmation logic |
| 4 | 1 | Multilingual replies (LLM-native path) |
| 5 | 1–2 | Voice pipeline (Web Speech API MVP → optional Whisper/Piper upgrade) |
| 6 | 1–2 | Avatar integration (Ready Player Me + Rhubarb lip-sync) |
| 7 | 1 | Security hardening pass (prompt-injection tests, RBAC edge cases) |
| 8 | 1 | README, demo video, deployment to free hosting |

Total: ~9–12 days for a working, demoable submission.

---

## 12. Submission Checklist (per assessment requirements)

- [ ] GitHub repository (public or invite evaluator)
- [ ] Complete source code, organized per Section 9 structure
- [ ] README covering: setup, free-tier API keys needed, architecture, known limitations
- [ ] Working chat interface (deployed link + local run instructions)
- [ ] Short demo video (screen recording, free tools: OBS Studio) showing chat, voice, avatar, escalation, and a security/RBAC negative test (e.g., student trying to mark attendance and being denied)

---

## 13. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Free-tier LLM rate limits during demo | Cache common queries; have Ollama local fallback ready |
| Free hosting cold starts hurt "human-like" latency feel | Add a typing/listening indicator to mask latency |
| Avatar lip-sync complexity eats the timeline | Ship 2D animated fallback (Lottie synced to audio amplitude) if 3D + Rhubarb slips |
| Indic TTS voice quality (Piper) uneven across all 11 languages | Note which languages are "full voice" vs "text-only" in README; this is an acceptable, honestly-documented scope cut |
| RBAC bypass via prompt injection | All data access happens through server-side tool calls with independent role/ownership checks — LLM output is never trusted for authorization |

---

## 14. Open Decisions (flag for reviewer sign-off)

1. LLM-native translation vs. Bhashini pipeline — recommend starting with LLM-native for speed.
2. Web Speech API (fast MVP) vs. self-hosted Whisper/Piper (closer to "real" spec) for voice — recommend building Web Speech API first, then swapping in the self-hosted pipeline if time allows, since the interfaces are swappable behind the same STT/TTS contract.
3. 3D avatar (Ready Player Me) vs. simpler 2D animated avatar — recommend 3D only if timeline comfortably allows; 2D fully satisfies "where technically possible" language in the spec.
