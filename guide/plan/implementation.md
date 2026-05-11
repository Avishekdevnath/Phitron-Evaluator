# Implementation Plan: Smart Multi-Source Assignment Evaluator

## 1. Goal of This Plan

This implementation plan converts the approved project scope into a practical build roadmap.

The target is to deliver a working v1 of a stateful AI-powered academic evaluator that:

* supports multiple submission formats
* preserves active assignment state until changed
* allows adding, editing, and deleting questions and reference scripts
* supports default and user-provided AI provider keys
* returns question-wise evaluation results

This plan is written to be implementation-oriented and buildable.

---

## 2. Recommended V1 Product Definition

### V1 should deliver

* Chrome extension shell
* assignment manager
* active assignment persistence
* question parser from raw text
* manual question editing
* optional reference script per question
* evaluate one submission at a time
* support multiple submission input types in a basic way
* AI provider selection with default provider support
* question-wise score and feedback view
* save evaluation history locally

### V1 should not try to fully solve

* batch grading
* LMS integration
* complex sandboxed code execution
* institutional multi-user sync
* plagiarism detection

---

## 3. Recommended Technical Architecture

## 3.1 Frontend

Use:

* React
* TypeScript
* Tailwind CSS
* Chrome Extension Manifest V3

### UI Surfaces

* extension popup
* side panel
* options/settings page
* content scripts for source extraction and inline UI

## 3.2 Storage

For v1 use:

* `chrome.storage.local` for persistent extension data
* optional IndexedDB only if evaluation history grows large

Persist in storage:

* assignments
* activeAssignmentId
* reference scripts
* provider settings
* user API key selection mode
* evaluation history
* UI preferences if needed

## 3.3 AI Access Layer

Create a provider abstraction layer.

Providers:

* DefaultProvider
* OpenAIProvider
* GeminiProvider
* ClaudeProvider

This layer should expose a unified interface such as:

```ts
interface AIProvider {
  generateStructuredEvaluation(input: EvaluationPromptInput): Promise<EvaluationResponse>
  parseQuestions(input: QuestionParseInput): Promise<ParsedQuestionSchema>
}
```

## 3.4 Core Engine

Build a format-agnostic evaluation core.

Major parts:

* question parser
* assignment service
* submission normalization service
* answer mapper
* evaluation engine
* reporting builder

## 3.5 Source Adapters

Each source adapter converts raw content into normalized blocks.

Initial adapters:

* ColabAdapter
* PlainTextAdapter
* ScriptAdapter
* DocsTextAdapter

---

## 4. Build Phases

## Phase 1: Foundation Setup

### Objective

Set up project structure and extension framework.

### Tasks

* initialize React + TypeScript app for extension
* configure Manifest V3
* set up popup, side panel, options page, content script
* install Tailwind CSS
* define folder structure
* define core TypeScript models
* implement storage utility wrappers

### Deliverable

A working extension shell with basic navigation and persistent storage utilities.

---

## Phase 2: Data Models and Persistence Layer

### Objective

Create stable core entities and persistence behavior.

### Data models to implement

* Assignment
* Question
* Submission
* EvaluationResult
* QuestionResult
* ProviderSettings

### Tasks

* define interfaces/types
* create storage service
* implement CRUD for assignments
* implement active assignment selection
* implement version tracking for assignments
* implement evaluation history storage

### Deliverable

Assignments can be created, stored, loaded, selected, edited, and deleted with persistent state.

---

## Phase 3: Assignment Manager UI

### Objective

Build instructor-facing assignment management features.

### Features

* create assignment
* list assignments
* edit assignment title and metadata
* delete assignment
* duplicate assignment
* activate assignment
* display active assignment badge

### Question management features

* add question manually
* delete question
* edit question title, prompt, marks
* reorder questions
* attach or remove reference script

### Deliverable

A working assignment manager where the user can define reusable grading schemas and keep one assignment active until changed.

---

## Phase 4: Question Parsing and Schema Generation

### Objective

Convert pasted assignment text into structured questions.

### Tasks

* build raw text input screen
* create deterministic local parser for basic numbering and mark extraction
* add AI-assisted parser for ambiguous formatting
* create parser review UI
* allow manual corrections before saving
* generate initial rubric placeholders

### Suggested processing order

1. local parser attempts extraction first
2. AI parser improves unresolved structure
3. user reviews and edits
4. final schema is saved

### Deliverable

Teacher can paste an exam or assignment description and convert it into editable structured questions.

---

## Phase 5: AI Provider Settings Module

### Objective

Support both default and manual provider selection.

### Settings modes

* use default provider and key
* use custom provider and user API key

### Tasks

* build provider settings UI
* add provider selector dropdown
* build secure local storage flow for settings
* store whether user is using default or custom provider
* validate API key format minimally before save
* define provider request builders
* define provider-specific response parsers

### Deliverable

User can keep default AI access or switch to their own OpenAI, Gemini, or Claude key.

---

## Phase 6: Submission Intake and Normalization

### Objective

Support multiple submission formats using a normalized internal structure.

### Common normalized structure

Each source should be converted into ordered content blocks.

```ts
type SubmissionBlock = {
  id: string
  type: 'heading' | 'paragraph' | 'code' | 'markdown' | 'output'
  content: string
  order: number
  sourceMeta?: Record<string, string>
}
```

### Tasks

* build manual paste input for text submissions
* build script paste/upload handler
* build Colab content extraction content script
* build Docs text extraction pathway for v1 basic input
* normalize all inputs into shared block structure
* save raw submission snapshot for traceability

### Deliverable

System can accept supported inputs and normalize them into a common internal format.

---

## Phase 7: Answer Mapping Engine

### Objective

Map normalized submission content to assignment questions.

### Mapping logic

* direct heading-based matching when explicit question labels exist
* keyword/semantic matching when labels are unclear
* code proximity grouping for notebook/script content
* missing answer detection
* uncertain mapping detection

### Tasks

* build initial rule-based question matching
* build fallback AI-assisted mapping
* attach confidence score per mapping
* expose uncertain mappings in UI

### Deliverable

Submission blocks can be grouped by question with confidence markers.

---

## Phase 8: Evaluation Engine

### Objective

Generate question-wise grading results.

### Evaluation pipeline

1. load active assignment
2. load submission blocks
3. map content to questions
4. prepare structured prompt input
5. call selected AI provider
6. parse structured response
7. store evaluation result
8. render review UI

### Per-question output target

* awardedMarks
* maxMarks
* summary
* strengths
* mistakes
* suggestions
* rubricAlignment
* confidence
* status

### Tasks

* define evaluation prompt schema
* create provider-agnostic prompt builder
* implement structured JSON response validation
* add fallback handling for malformed provider output
* add result post-processing
* derive total score from question results

### Deliverable

A complete question-wise evaluation flow using selected provider settings.

---

## Phase 9: Review UI and Result Presentation

### Objective

Create a teacher-friendly result review interface.

### Side panel must show

* active assignment
* evaluated submission name/source
* total score
* question list
* marks per question
* mistakes
* suggestions
* uncertainty flags

### Inline feedback must show

* issue highlights in Colab where possible
* mapped question context
* short fix suggestions

### Tasks

* build summary header
* build question filter tabs
* build question result card view
* build detailed result panel
* build inline annotation rendering for supported sources
* build copy/export actions

### Deliverable

A practical evaluation interface where the user can inspect question-wise results quickly.

---

## Phase 10: Evaluation History and Reopen Flow

### Objective

Allow past evaluations to be stored and reviewed.

### Tasks

* save each completed evaluation locally
* show evaluation history list
* allow opening an old report
* store assignment version used for that evaluation
* support deletion of old evaluation records

### Deliverable

Teacher can revisit prior evaluations and maintain grading continuity.

---

## Phase 11: Quality, Error Handling, and Validation

### Objective

Make the product stable enough for a credible demo.

### Required checks

* no active assignment selected
* malformed question schema
* provider key missing
* provider API failure
* invalid structured response
* unsupported source page
* no detectable submission content
* mapping confidence too low

### Tasks

* create friendly error states
* add retry flows
* add loading states
* add save confirmations
* add empty states
* add defensive parsing

### Deliverable

User gets clear feedback when something fails instead of broken UI.

---

## Phase 12: Demo Readiness and Final Packaging

### Objective

Prepare the project for presentation, evaluation, and portfolio use.

### Tasks

* prepare seeded demo assignments
* prepare seeded example submissions
* prepare default provider demo flow
* write README
* write setup instructions
* create architecture diagram
* record evaluation walkthrough steps
* optimize UI polish and spacing

### Deliverable

A presentation-ready project with stable demo flow.

---

## 5. Recommended Folder Structure

```ts
src/
  app/
    popup/
    sidepanel/
    options/
  components/
    assignment/
    evaluation/
    shared/
  content/
    colab/
    docs/
  core/
    assignment/
    evaluation/
    mapping/
    parsing/
    providers/
    reporting/
    submission/
  services/
    storage/
    history/
    settings/
  types/
  utils/
```

---

## 6. Suggested Data Models

### Assignment

```ts
interface Assignment {
  id: string
  title: string
  course?: string
  type?: string
  totalMarks: number
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  questions: Question[]
}
```

### Question

```ts
interface Question {
  id: string
  number: string
  title: string
  prompt: string
  maxMarks: number
  answerType?: 'theory' | 'code' | 'mixed' | 'math' | 'diagram'
  rubricCriteria?: string[]
  referenceScript?: string
  notes?: string
}
```

### ProviderSettings

```ts
interface ProviderSettings {
  mode: 'default' | 'custom'
  provider: 'default' | 'openai' | 'gemini' | 'claude'
  apiKey?: string
  model?: string
}
```

### EvaluationResult

```ts
interface EvaluationResult {
  id: string
  assignmentId: string
  assignmentVersion: number
  submissionId: string
  totalScore: number
  generatedAt: string
  questionResults: QuestionResult[]
}
```

---

## 7. Suggested Milestone Order

### Milestone 1

Extension shell + storage + data models

### Milestone 2

Assignment manager + active assignment persistence

### Milestone 3

Question parsing + manual editor

### Milestone 4

Provider settings + default/custom key support

### Milestone 5

Submission intake + normalization

### Milestone 6

Question mapping engine

### Milestone 7

Evaluation engine

### Milestone 8

Result UI + history

### Milestone 9

Polish + demo preparation

---

## 8. Suggested MVP Build Order (Practical)

If time is limited, build in this exact order:

1. extension shell
2. assignment CRUD
3. active assignment persistence
4. manual question editor
5. provider settings
6. plain text/script submission input
7. AI evaluation flow
8. result display
9. Colab adapter
10. history
11. inline feedback

This order ensures you get a usable product early, even before full source integrations are complete.

---

## 9. Recommended V1 Delivery Criteria

The project can be considered successful for v1 if the following are true:

* user can create multiple assignments
* one assignment stays active until changed
* user can add, edit, and delete questions and scripts
* user can choose default or custom AI provider settings
* user can evaluate at least one supported submission source reliably
* user receives question-wise marks and feedback
* evaluation result is saved and re-openable

---

## 10. Final Recommendation

Build the project as a **stateful evaluation platform first**, and only then deepen source integrations.

The most important implementation priorities are:

* persistent assignment memory
* good question schema management
* provider abstraction
* reliable evaluation response structure

These are more important than adding many integrations too early.

---

## 11. Next Step After This Plan

After this implementation plan, the next working document should be:

* detailed system architecture
* or task breakdown by week/sprint
* or database/storage schema

For best execution, the next step should be a **module-by-module architecture document**.
