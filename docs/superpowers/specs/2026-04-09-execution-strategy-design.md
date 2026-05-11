# Design: Smart Multi-Source Assignment Evaluator - Execution Strategy

**Date:** 2026-04-09  
**Status:** Design Phase  
**Scope:** Full product delivery (12 phases), production-ready, no deadline

---

## 1. Product Vision (Refined)

A **stateful, AI-powered Chrome extension** that allows educators to:
- Define reusable grading schemas (assignments with questions)
- Keep one assignment active until changed
- Evaluate student submissions in multiple formats (text, scripts, Colab notebooks)
- Get question-wise AI-generated marks and feedback
- Maintain local evaluation history

**Production-ready means:** Solid core functionality, good error handling, reliable AI integration, demo-ready UI.

---

## 2. Key Clarifications (Locked In)

### DefaultProvider = OpenAI Free Tier
- User provides their own OpenAI API key
- No backend required; all API calls from extension
- Provider abstraction layer supports future Gemini/Claude addition

### Scope = All 12 Phases
- No features cut
- But reordered for MVP-first delivery

### Architecture = Plan as written
- React + TypeScript + Tailwind
- Manifest V3 (popup + options page for Phase 1)
- Provider abstraction layer
- Format-agnostic evaluation core
- Source adapters (text first, Colab/Docs later)

---

## 3. Execution Strategy: Reordered Phases for MVP-First Delivery

### Why Reorder?

The original plan is sequential (Phase 1 → 2 → ... → 12). But Phase 8 (Evaluation Engine) doesn't depend on Phase 4 (Question Parsing), Phase 6 (Submission Intake adapters), or Phase 12 (Colab integration).

**Reordering strategy:**
1. Build core foundation → assignment mgmt → evaluation engine
2. Get a **working evaluator by Phase 7** (can create assignment, submit, get results)
3. Add features, sources, and polish afterward
4. **Validate at Phase 7 checkpoint** — if core breaks, catch it now

### Reordered Phase Sequence

| Phase | Original | **New Order** | Why |
|-------|----------|--------------|-----|
| 1 | Foundation | **1** | Still first; everything depends on it |
| 2 | Data Models | **2** | Needed for Phase 3 |
| 3 | Assignment Manager | **3** | Users need this to define assignments |
| 4 | Question Parsing | 9 | Deferred; manual entry works for MVP |
| 5 | Provider Settings | **4** | Needed for Phase 7 evaluation calls |
| 6 | Submission Intake | **5** | Text + script paste; defer Colab/Docs |
| 7 | Answer Mapping | **6** | Maps submissions to questions |
| 8 | Evaluation Engine | **7** | ⭐ **CORE PRODUCT** — gets first working demo |
| 9 | Review UI | **8** | Show results of Phase 7 evaluation |
| 10 | Evaluation History | **10** | Store past evaluations |
| 11 | Quality & Error Handling | **11** | Polish and robustness |
| 12 | Demo Readiness | **9** | *Wait, this goes after Phase 8 core* |
| + | + | **12** | Colab/Docs adapters + inline feedback |

### Detailed Phase Breakdown (Reordered)

#### **Phase 1: Extension Foundation**
**Scope:** Minimal Chrome extension shell (popup + options page only)
- React + TypeScript + Tailwind setup
- Manifest V3 config (popup, options page)
- Core TypeScript models defined (Assignment, Question, ProviderSettings, etc.)
- Storage utility wrappers for `chrome.storage.local`
- Basic folder structure in place
- **Deliverable:** Working extension that opens popup and options page

**Note:** Side panel and content scripts deferred to Phase 12.

---

#### **Phase 2: Data Persistence Layer**
**Scope:** CRUD operations and state management
- Storage service for assignments, evaluations, settings
- Assignment CRUD (create, read, update, delete)
- Active assignment selection and persistence
- Version tracking (for future assignment edits)
- Evaluation history storage schema
- **Deliverable:** Can create, load, select, and persist assignments

---

#### **Phase 3: Assignment Manager UI**
**Scope:** Instructor-facing management interface
- Create new assignment
- List assignments with active badge
- Edit assignment title/metadata
- Delete and duplicate assignments
- Activate assignment
- **Question management within assignment:**
  - Add question manually
  - Edit title, prompt, max marks
  - Attach reference script (optional)
  - Reorder questions
  - Delete question
- **Deliverable:** Fully functional assignment manager; users can define grading schemas

---

#### **Phase 4: AI Provider Settings Module**
**Scope:** Provider selection and API key management
- Settings UI (options page section)
- Provider selector dropdown (OpenAI only for v1)
- API key input field with basic validation
- Secure local storage of key and settings
- Test API key connectivity (optional)
- **Deliverable:** Users can configure their OpenAI API key and test it

---

#### **Phase 5: Submission Intake (Simplified for MVP)**
**Scope:** Accept submissions in basic formats
- Plain text paste input
- Script file paste/upload
- Normalize all inputs to common `SubmissionBlock` structure
- Store raw submission snapshot for traceability
- **Deferred to Phase 12:** Colab content script extraction, Docs text extraction
- **Deliverable:** System accepts text and script submissions and normalizes them

---

#### **Phase 6: Answer Mapping Engine**
**Scope:** Link submission content to assignment questions
- Rule-based matching (explicit question labels)
- Keyword/semantic matching when labels unclear
- Code proximity grouping
- Confidence scoring per mapping
- Fallback: AI-assisted mapping (calls Phase 4 provider)
- Expose uncertain mappings in UI
- **Deliverable:** Submission blocks are grouped by question with confidence markers

---

#### **Phase 7: Evaluation Engine ⭐ CORE PRODUCT**
**Scope:** Generate question-wise grades using AI
- Load active assignment + submission blocks
- Map submission content to questions (Phase 6)
- Build structured evaluation prompt
- Call OpenAI provider (Phase 4 settings)
- Parse structured JSON response
- Validate and post-process results
- Store evaluation result locally
- **Per-question output:**
  - awardedMarks, maxMarks
  - summary, strengths, mistakes, suggestions
  - rubricAlignment, confidence, status
- **Deliverable:** End-to-end working evaluator (can assign → submit → grade → see results)

**🔴 VALIDATION CHECKPOINT HERE**
- Manually test: create assignment → submit text/script → evaluate → inspect results
- If core breaks, stop and fix before moving forward

---

#### **Phase 8: Result Display UI**
**Scope:** Teacher-friendly result review
- Summary header (assignment, total score, submission name)
- Question filter tabs
- Question result cards (marks, feedback per question)
- Detailed result panel
- Copy/export actions
- **Deliverable:** Practical evaluation interface where users can inspect results quickly

---

#### **Phase 9: Question Parsing (AI-Assisted)**
**Scope:** Convert raw assignment text to structured questions
- Raw text input screen
- Deterministic local parser (numbering, mark extraction)
- AI-assisted parser for ambiguous formatting
- Parser review UI
- Manual correction before saving
- **Suggested flow:**
  1. Local parser attempts extraction
  2. AI parser refines
  3. User reviews and edits
  4. Save to assignment
- **Deliverable:** Teachers can paste exam text and convert to structured questions

**Note:** This is deferred because Phase 3 manual entry works for v1; this is a convenience feature.

---

#### **Phase 10: Evaluation History and Reopen Flow**
**Scope:** Store and retrieve past evaluations
- Save each completed evaluation locally
- Show evaluation history list
- Reopen old evaluation report
- Store assignment version used (for future schema changes)
- Delete old evaluation records
- **Deliverable:** Teachers can revisit prior evaluations and maintain continuity

---

#### **Phase 11: Quality, Error Handling, and Validation**
**Scope:** Stability and user feedback
- **Required error states:**
  - No active assignment selected
  - Malformed question schema
  - Provider key missing or invalid
  - Provider API failure (rate limit, auth error)
  - Invalid structured response from AI
  - Unsupported submission format
  - No detectable submission content
  - Mapping confidence too low
- Friendly error messages
- Retry flows
- Loading states
- Save confirmations
- Empty states
- Defensive parsing
- **Deliverable:** Clear user feedback instead of broken UI

---

#### **Phase 12: Colab/Docs Adapters + Demo Readiness**
**Scope:** Source integration and presentation
- **Content script for Colab:**
  - Extract cell content (markdown, code, output)
  - Normalize to block structure
- **Docs text extraction (basic v1):**
  - Parse heading-based structure
  - Extract code blocks if marked
- **Inline feedback (Colab only):**
  - Annotate cells with feedback
  - Highlight issues where possible
- **Demo preparation:**
  - Seeded demo assignments
  - Seeded example submissions
  - Default provider demo flow (no API key required)
  - Architecture documentation
  - Setup instructions
  - Evaluation walkthrough
  - UI polish and spacing
- **Deliverable:** Production-ready product with Colab support and demo-ready flow

---

## 4. Key Dependencies and Risks

### Locked Dependencies
- Phase 1 → everything
- Phase 2 → Phase 3, 4, 7
- Phase 3 → (assignments exist before evaluation)
- Phase 4 → Phase 7, Phase 6 (AI fallback)
- Phase 5 → Phase 6
- Phase 6 → Phase 7
- Phase 7 → Phase 8

### Flagged Uncertainties (To Validate in Phase 1)
1. **Answer Mapping AI fallback:** Does Phase 6's AI-assisted matching work smoothly with Phase 4's provider setup, or is there latency/UX friction?
2. **Storage scaling:** Will evaluation history grow beyond 10MB (`chrome.storage.local` limit) in production use? Might need IndexedDB sooner than Phase 10.
3. **Colab complexity:** Content script injection + DOM manipulation is fragile. Phase 12 might need more time or external prototyping.
4. **Question parsing UX:** Is manual entry in Phase 3 genuinely usable, or does Phase 9 parsing feel essential earlier?

**Plan:** Phase 7 checkpoint will catch major issues. If uncertainties surface, adjust subsequent phases.

---

## 5. Milestones and Validation Gates

| Milestone | Phases | Goal | Go/No-Go |
|-----------|--------|------|----------|
| **M1: Foundation** | 1-2 | Extension shell + storage working | Can create/store assignments |
| **M2: Assignment Mgmt** | 1-3 | Users can define grading schemas | Can add/edit/delete questions |
| **M3: AI Integration** | 1-4 | Provider settings + API connectivity | Can validate OpenAI key |
| **M4: Core Product** | 1-7 | End-to-end working evaluator | ⭐ **Manual test:** Assignment → Submit → Evaluate → Results ✓ |
| **M5: Features** | 1-10 | Parsing, history, error handling | Full feature set operational |
| **M6: Polish** | 1-11 | Quality and error states | Production-ready core |
| **M7: Integrations** | 1-12 | Colab/Docs adapters, demo prep | Full scope delivered |

---

## 6. Architecture Overview (Unchanged from Plan)

```
Extension Shell (Manifest V3)
├── Popup (assignment list, quick actions)
├── Options Page (settings, API key, history)
├── Content Scripts (Phase 12: Colab/Docs extraction)
└── Service Worker (background tasks)

Data Layer (chrome.storage.local + Phase 10: evaluation history)
├── Assignments
├── Questions
├── Submissions (in-memory during evaluation)
├── EvaluationResults
└── ProviderSettings

Core Engine
├── Provider Abstraction (Phase 4)
│   └── OpenAIProvider (Phase 4), placeholders for Gemini/Claude
├── Assignment Service (Phase 2-3)
├── Submission Normalization (Phase 5)
├── Answer Mapper (Phase 6)
├── Evaluation Engine (Phase 7)
└── Reporting (Phase 8)

UI Layer (React + Tailwind)
├── Assignment Manager (Phase 3)
├── Settings (Phase 4)
├── Submission Intake (Phase 5)
├── Evaluation Results (Phase 8)
├── History View (Phase 10)
└── Error States (Phase 11)
```

---

## 7. Success Criteria for v1 Delivery

The product is production-ready when:

✓ User can create multiple assignments with questions  
✓ One assignment stays active until changed  
✓ User can add, edit, delete questions and scripts  
✓ User can choose OpenAI API key (custom provider)  
✓ User can evaluate text and script submissions reliably  
✓ User receives question-wise marks, feedback, suggestions  
✓ Evaluation result is saved and re-openable  
✓ Question parsing works (manual or AI-assisted)  
✓ Colab notebook extraction works  
✓ Error states are friendly and actionable  
✓ Demo flow is repeatable and polished  

---

## 8. Next Steps

1. **User approves this design**
2. **Write detailed implementation plan** (via superpowers:writing-plans skill)
   - Expand each phase into specific tasks
   - Define data structures in detail
   - Outline UI component hierarchy
   - Create module breakdown
3. **Begin Phase 1 execution**
   - Initialize React + TypeScript + Tailwind
   - Set up Manifest V3 + popup + options page
   - Define TypeScript models
   - Implement storage utilities
   - Validate with Phase 1 milestone

---

**Design Status:** Ready for user review and approval
