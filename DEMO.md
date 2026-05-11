# Phitron Extension - Demo Guide

## Overview

Phitron is an AI-powered assignment evaluator for educators. It automatically evaluates student submissions, providing marks and detailed feedback using OpenAI's GPT-4 model.

## Features Demonstration

### 1. Setup (Phase 1-4)
- **Extension Shell**: Chrome extension architecture with popup and options pages
- **Storage**: Persistent data management using Chrome Storage API
- **Settings**: Configure OpenAI API key for AI-powered evaluation

### 2. Assignment Management (Phase 3)
- Create assignments with title, course, and total marks
- Add questions manually or use AI-powered parsing

### 3. Question Parsing (Phase 9) - NEW
- **Extract from Web**: Click "Extract & Parse" button in popup to grab assignment text from current page
- **Supports**:
  - Google Docs (automatically extracts structured text)
  - Google Colab (extracts markdown and code cells)
  - Generic web pages (extracts main content)
- **AI Parser**: Automatically structures raw text into questions with estimated marks

### 4. Evaluation Workflow (Phase 5-7)
- Submit student answers (text or code format)
- Automatic answer-to-question mapping using 3 strategies:
  - **Explicit**: Question numbers in answers (e.g., "Q1:", "1.")
  - **Keyword**: Semantic matching with question content
  - **Proximity**: Sequential fallback for unlabeled answers
- AI-powered evaluation with structured feedback

### 5. Results Display (Phase 8)
- Overall score with percentage
- Question-by-question feedback including:
  - Awarded marks vs max marks
  - Summary of answer
  - Strengths identified
  - Mistakes/areas for improvement
  - Suggestions for better answers
  - Rubric alignment assessment
  - Confidence level of evaluation

### 6. History Management (Phase 10)
- View all past evaluations
- Filter by evaluation status (complete/partial/skipped)
- Delete evaluation records
- Timestamps and submission names tracked

### 7. Error Handling & Polish (Phase 11)
- Friendly error messages for API failures
- Loading states during evaluation
- Input validation with helpful feedback
- Error boundaries for component failures
- Result export functionality

## Step-by-Step Demo Flow

### Demo 1: Quick Evaluation
1. Open extension popup → "Open Settings"
2. Go to Assignments tab → Create assignment
3. Click "Manage Questions" → Add 2-3 sample questions
4. Click "Evaluate Submission" tab
5. Paste student answer
6. Click Evaluate
7. View detailed results with feedback

### Demo 2: AI Question Parsing
1. Open a Google Doc with assignment text
2. In popup, click "Extract & Parse"
3. Extension automatically extracts assignment text
4. Opens Options page ready to parse
5. Confirm extracted questions look good
6. Assignment is created with questions automatically

### Demo 3: Full Workflow with Multiple Submissions
1. Create assignment with AI-parsed questions
2. Evaluate multiple student submissions
3. Show History tab with all evaluations
4. Demonstrate filtering and review features

### Demo 4: Different Answer Formats
1. Create assignment with 3 questions
2. Test evaluation with:
   - **Explicit**: Numbered answers (Q1, Q2, Q3)
   - **Keyword**: Answers without numbers but with related content
   - **Proximity**: Sequential answers without any labels
3. Show how mapping strategies work

## Technical Highlights

### Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Storage**: Chrome Storage API (10MB local storage)
- **AI**: OpenAI GPT-4 Turbo API with structured JSON responses
- **Content Script**: Page extraction from Google Docs, Colab, web pages
- **Build**: Vite for multi-entry extension build

### Key Components
- **AssignmentService**: Full CRUD for assignments
- **SubmissionNormalizer**: Parses text/code into structured blocks
- **AnswerMapper**: Multi-strategy question-to-answer mapping
- **EvaluationEngine**: Orchestrates AI evaluation with fallbacks
- **QuestionParser**: AI-assisted text-to-questions conversion
- **ContentScript**: Cross-page content extraction

### Data Flow
```
Create Assignment
    ↓
AI Parse Questions (optional)
    ↓
Student Submit Answer
    ↓
Normalize & Map to Questions
    ↓
AI Evaluate via OpenAI
    ↓
Display Results
    ↓
Save to History
```

## Prerequisites

### For Demo
- Chrome browser
- OpenAI API key (get free trial credits at platform.openai.com)
- Sample assignment text (use provided examples)
- Student answer samples

### For Development
- Node.js 18+
- npm
- TypeScript compiler

## Running the Extension

### Installation
```bash
npm install
npm run build
```

### Load in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

### First Use
1. Click extension icon → "Open Settings"
2. Go to Settings tab
3. Paste OpenAI API key
4. Click "Test Connection"
5. If successful, you're ready!

## Sample Data for Demo

### Sample Assignment Text
```
Biology Assignment: Cell Structure

Total: 25 marks

Q1 (8 marks): What is the primary function of mitochondria in cells?

Q2 (10 marks): Explain the difference between prokaryotic and eukaryotic cells.

Q3 (7 marks): Name three organelles and describe their functions.
```

### Sample Student Answer
```
Q1: Mitochondria is the powerhouse of the cell. It produces ATP which provides
energy for cellular processes.

Q2: Prokaryotic cells do not have a nucleus and their DNA is in a nucleoid.
Eukaryotic cells have a nucleus containing DNA and many organelles.

Q3: 
- Ribosome: Synthesizes proteins
- Golgi apparatus: Modifies and packages proteins
- Rough ER: Produces proteins for export
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] API key validation works
- [ ] Create assignment with valid data
- [ ] Parse questions from sample text
- [ ] Submit evaluation with proper formatting
- [ ] Results display all feedback fields
- [ ] History shows evaluations with filters
- [ ] Error handling shows friendly messages
- [ ] Extract button works on Google Docs
- [ ] Works with code submissions

## Known Limitations

- OpenAI API has rate limits (refer to your plan)
- Chrome Storage limit is 10MB (roughly 5000 evaluations)
- Content extraction works best on structured pages
- Code evaluation focus is on logic, not execution

## Future Enhancements

- Support for Gemini and Claude APIs
- Batch evaluation of multiple submissions
- Custom rubric creation and scoring
- Export results to CSV/PDF
- Integration with LMS platforms
- Mobile app version
- Offline evaluation capability

## Support

For issues or feature requests, refer to the extension repository.

---

**Version**: 0.1.0  
**Last Updated**: April 2026  
**Built with**: React, TypeScript, Tailwind CSS, OpenAI API
