# End-to-End Project Scope (V2): Smart Multi-Source Assignment Evaluator

## 1. Project Overview

This project is a **stateful AI-powered academic evaluation assistant** built as a Chrome extension with a core evaluation engine.

It enables instructors to:

* define assignments/exams from question text and marks
* persist and manage assignments over time
* evaluate student submissions from multiple sources (Colab, Docs, code, text)
* receive structured, question-wise grading and feedback

The system is designed to be **format-agnostic, persistent, and AI-assisted**, with support for multiple AI providers.

---

## 2. Core Product Goal

Create a reusable grading system where:

* instructors define an assignment once
* the assignment remains active until explicitly changed
* multiple student submissions are evaluated against that same assignment
* evaluation works across different submission formats

---

## 3. Supported Input Sources

### Assignment Input

* pasted question text
* uploaded question document (future)
* manual question creation
* marks per question
* optional rubric or criteria
* optional reference scripts or answers

### Student Submission Input (V1)

* Google Colab notebooks
* Google Docs (pasted or extracted content)
* plain text answers
* code/script files

### Future Sources (V2)

* PDF / DOCX upload
* batch submission folders
* LMS integration

---

## 4. Core System Architecture (Conceptual)

The system is composed of four main layers:

### 4.1 Assignment Memory Layer

* create, edit, delete assignments
* manage questions inside assignments
* attach scripts and rubrics
* maintain active assignment
* persist state across sessions

### 4.2 Submission Adapter Layer

Adapters convert different formats into a unified structure.

Adapters include:

* ColabAdapter
* GoogleDocsAdapter
* ScriptAdapter
* PlainTextAdapter

All adapters output a normalized structure:

```
type SubmissionBlock = {
  id: string
  type: "heading" | "paragraph" | "code" | "markdown" | "output"
  content: string
  order: number
}
```

### 4.3 Evaluation Intelligence Layer

* parse assignment into schema
* map submission content to questions
* evaluate answers using rubric and AI
* generate marks and feedback

### 4.4 Review & Reporting Layer

* display results
* question-wise breakdown
* export and save evaluations

---

## 5. Assignment Management Module

### Capabilities

* create assignment
* edit assignment
* delete assignment
* duplicate assignment
* select active assignment
* persist selection

### Assignment Data Model

* id
* title
* course
* type
* totalMarks
* version
* isActive
* createdAt
* updatedAt
* questions[]
* gradingSettings

---

## 6. Question Management Module

### Capabilities

* add question
* delete question
* edit question
* reorder questions
* attach script per question

### Question Model

* id
* number
* title
* prompt
* maxMarks
* answerType
* rubricCriteria
* referenceScript

### Requirement

Changes must persist until user updates again.

---

## 7. Question Parsing Module

### Responsibilities

* extract questions from text
* detect marks (e.g., "(10)")
* detect subparts
* generate draft rubric

### Output

Structured question schema

---

## 8. Reference Script Module

### Capabilities

* attach reference per assignment
* attach per question
* replace/remove

### Optional but supported

---

## 9. Submission Intake Module

### Responsibilities

* extract content
* preserve order
* identify code vs text

---

## 10. Answer Mapping Module

### Responsibilities

* map content to questions
* detect missing answers
* flag uncertainty

---

## 11. Evaluation Engine Module

### Modes

* analysis-only
* analysis + rule checks

### Output per question

* marks
* mistakes
* suggestions
* summary
* confidence

---

## 12. State Persistence Module

### Must Persist

* active assignment
* question definitions
* reference scripts
* evaluation settings
* API provider settings

### Behavior

State remains unchanged until user updates.

---

## 13. API Provider Module (NEW)

The system supports multiple AI providers.

### Default API

* system provides a default API key (pre-configured)

### User Options

User can:

* use default API
* switch to custom API
* enter own API key manually

### Supported Providers

* OpenAI
* Google Gemini
* Anthropic Claude
* others (extensible)

### Capabilities

* select provider
* switch provider
* store API key securely
* fallback to default if user key missing

### Settings to Persist

* selected provider
* API key (if user provided)

---

## 14. Evaluation History Module

### Capabilities

* store past evaluations
* reopen reports
* compare results

---

## 15. Reporting Module

### Output

* question-wise report
* total score
* feedback
* export options

---

## 16. UI Modules

### A. Popup

* active assignment
* evaluate button

### B. Assignment Manager

* create/edit/delete

### C. Side Panel

* results
* breakdown

### D. Inline Feedback

* highlight issues in submission

---

## 17. Assignment Lifecycle

Create → Edit → Save → Activate → Evaluate → Update → Archive

---

## 18. Core Data Objects

Assignment, Question, Submission, EvaluationResult, QuestionResult

---

## 19. V1 Scope

### Included

* assignment creation
* active assignment persistence
* multi-format input (basic)
* AI evaluation
* API provider switching

### Excluded

* batch grading
* LMS integration
* heavy execution sandbox

---

## 20. Non-Functional Requirements

* fast response
* reliable storage
* explainable results
* secure API handling

---

## 21. Final Statement

A stateful, AI-powered academic evaluator that supports multiple submission formats, persistent assignment management, and flexible AI provider selection (default + user-provided), delivering structured question-wise grading and feedback.

---

## 22. Next Step

Convert this into implementation plan with architecture and milestones.
