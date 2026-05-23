# Phitron Extension 🎓

Smart AI-powered academic evaluation assistant for instructors. A Chrome extension that streamlines grading of student submissions from multiple sources using intelligent AI analysis.

---

## 📦 Tech Stack

<div align="center">

| Category | Technologies |
|----------|---------------|
| **Frontend Framework** | ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) |
| **Build & Dev** | ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?logo=tailwind-css&logoColor=white) |
| **UI Components** | ![Lucide React](https://img.shields.io/badge/Lucide%20React-Icons-FF6B6B?logo=lucide&logoColor=white) |
| **Testing** | ![Vitest](https://img.shields.io/badge/Vitest-1-6E9F18?logo=vitest&logoColor=white) ![React Testing Library](https://img.shields.io/badge/React%20Testing%20Library-14-E33332?logo=testing-library&logoColor=white) |
| **Extension** | ![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-MV3-4285F4?logo=google-chrome&logoColor=white) |
| **Storage** | ![Chrome Storage API](https://img.shields.io/badge/Chrome%20Storage%20API-LocalStorage-4285F4) |

</div>

---

## 🌟 Core Features

### 1. **Assignment Management**
Comprehensive assignment lifecycle management enabling instructors to create, organize, and maintain multiple assignments with persistent storage across sessions.

- **Create assignments** with customizable metadata including title, course code, assignment type, and total marks
- **Edit & delete assignments** at any point without affecting related submissions or evaluation history
- **Duplicate assignments** for rapid redeployment across multiple cohorts or semesters
- **Activate assignments** to designate the active evaluation target
- **Persistent storage** leveraging Chrome Storage API for reliable data persistence across browser sessions
- **Version tracking** with automatic timestamp recording for audit trails

### 2. **Question Management**
Flexible question-level configuration supporting diverse assessment types and granular mark allocation.

- **Unlimited question support** for comprehensive assignment coverage
- **Flexible mark allocation** supporting weighted and flexible grading scales
- **Full CRUD operations** on questions with data integrity preservation
- **Drag-and-drop reordering** for dynamic question sequencing
- **Multi-type support** including code submission, essay, multiple-choice, and short-answer questions
- **Question metadata** capturing question number, prompt, answer type, and evaluation criteria

### 3. **Intelligent Question Parsing**
NLP-assisted question extraction and schema generation reducing manual data entry and processing overhead.

- **Automated question extraction** from unstructured assignment text using intelligent pattern recognition
- **Mark detection** supporting multiple common formats: (10), [5 marks], "5 marks", etc.
- **Subpart identification** for multi-part questions (a), (b), (c) with hierarchical structure preservation
- **Draft rubric generation** based on question content and complexity analysis
- **Structural preservation** maintaining original formatting and question hierarchy during parsing
- **Confidence scoring** on extraction accuracy with manual override capabilities

### 4. **Multi-Source Submission Intake**
Format-agnostic submission ingestion supporting diverse student submission modalities with content normalization.

| Format | Support | Details |
|--------|---------|---------|
| **Google Colab** | ✅ Full | Code cells, markdown, and execution output extraction |
| **Google Docs** | ✅ Full | Formatted text parsing with structure preservation |
| **Plain Text** | ✅ Full | Direct answer submission and processing |
| **Code Files** | ✅ Full | Support for Python, JavaScript, Java and other languages |
| **PDF Documents** | 🔄 Roadmap | V2 feature with OCR capabilities |
| **DOCX Upload** | 🔄 Roadmap | V2 feature with formatting preservation |
| **Batch Processing** | 🔄 Roadmap | V2 feature for bulk submission handling |
| **LMS Integration** | 🔄 Roadmap | V2 feature for direct LMS connectivity |

### 5. **AI-Powered Evaluation Engine**
Intelligent grading system leveraging multi-provider AI models for comprehensive answer assessment and feedback generation.

- **Configurable AI providers** supporting OpenAI, Google Gemini, Anthropic Claude, and extensible custom implementations
- **Question-wise evaluation** breaking down assessment across individual questions with isolated scoring
- **Detailed feedback generation** including identified errors, improvement suggestions, and conceptual gaps
- **Confidence metrics** providing transparency on evaluation certainty for each assessment
- **Reference script comparison** enabling code-to-code evaluation and output verification
- **Rubric-based grading** with customizable evaluation criteria per question type
- **Contextual assessment** considering assignment metadata and expected learning outcomes

### 6. **Multi-Provider API Management**
Flexible AI provider integration supporting multiple endpoints with secure credential management and seamless provider switching.

**Supported Providers:**
- **OpenAI** - GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Google Gemini** - Gemini Pro, Gemini Ultra
- **Anthropic Claude** - Claude 2, Claude 3 models
- **Custom Providers** - Extensible architecture for custom endpoints

**Key Features:**
- **Default API configuration** for immediate out-of-the-box functionality
- **Custom API key management** with secure Chrome Storage encryption
- **Provider switching** with zero-friction migration between services
- **Fallback mechanisms** automatically reverting to default API on key unavailability
- **Rate limit handling** with intelligent retry logic and queuing
- **Usage tracking** monitoring API calls and provider performance

### 7. **Comprehensive Evaluation History**
Persistent evaluation record storage enabling auditing, comparison, and longitudinal assessment analysis.

- **Automatic evaluation archival** with complete result preservation
- **Reopenable reports** for post-hoc review and analysis without re-evaluation
- **Submission comparison** supporting side-by-side analysis across multiple students
- **Trend analysis** enabling grading consistency verification and performance tracking
- **Timestamped records** with creation and modification audit trails
- **Metadata retention** preserving assignment state at evaluation time
- **Searchable history** supporting filtering by assignment, date, and evaluation criteria

### 8. **Results & Reporting Module**
Professional-grade reporting interface providing actionable insights through structured feedback and comprehensive score breakdowns.

- **Question-wise score reports** with individual marks for each assessment question
- **Automatic score aggregation** computing total marks with configurable weighting
- **AI-generated feedback** providing constructive comments and improvement recommendations
- **Visual score distribution** charts and graphs for performance analytics
- **Detailed breakdown views** with drill-down capability to question-level analysis
- **Export functionality** supporting PDF, JSON, and CSV formats for record-keeping
- **Performance metrics** including class statistics and percentile rankings

### 9. **Advanced Settings & Customization**
Granular configuration interface enabling instructors to tailor evaluation behavior and integrate preferred tools.

- **Provider selection interface** with one-click provider switching
- **Secure API key management** with password masking and encryption
- **Grading parameter configuration** including weight adjustments and scale selection
- **Evaluation mode selection** (analysis-only, rubric-based, reference-comparison)
- **UI personalization** including theme preferences and display options
- **Notification preferences** for evaluation completion and important events
- **Import/Export settings** for cross-device configuration portability

### 10. **Chrome Side Panel Integration**
Native Chrome UI integration providing in-context results display without tab switching or context loss.

- **Real-time result rendering** with immediate evaluation result display
- **Interactive score breakdown** with expandable question-level details
- **Quick feedback access** providing instant access to AI-generated suggestions
- **Responsive design** optimized for side panel dimensions and mobile views
- **Persistent panel state** maintaining scroll position and expanded sections
- **Action buttons** for common operations (export, compare, re-evaluate)
- **Visual indicators** for score ranges and performance levels

---

## 🏗️ Architecture

The system follows a layered architecture pattern ensuring separation of concerns, maintainability, and extensibility.

### Layer 1: Assignment Memory Layer
Persistent data management and state coordination.

- **Assignment CRUD** with version control and change tracking
- **Question lifecycle** management with ordering and metadata
- **Active assignment** context maintaining current evaluation target
- **Rubric & reference** storage for evaluation templates
- **Chrome Storage integration** ensuring cross-session persistence
- **Cache optimization** for frequently accessed assignments

### Layer 2: Submission Adapter Layer
Format-agnostic content extraction and normalization.

**Adapter Implementations:**
- **ColabAdapter** - Jupyter notebook parsing with code/output separation
- **GoogleDocsAdapter** - Structured document content extraction
- **ScriptAdapter** - Code file parsing and syntax preservation
- **PlainTextAdapter** - Free-form text handling with basic structure detection

**Common Interface:**
```typescript
interface SubmissionBlock {
  id: string                          // Unique block identifier
  type: BlockType                    // heading | paragraph | code | output
  content: string                     // Raw content
  metadata: BlockMetadata            // Language, source, etc.
  order: number                       // Sequence in submission
}
```

### Layer 3: Evaluation Intelligence Layer
Core AI-powered assessment and feedback generation engine.

- **Assignment schema parsing** converting question definitions to evaluation prompts
- **Answer mapping** correlating submission content to specific questions
- **AI orchestration** managing multi-provider model calls and retry logic
- **Score calculation** with configurable weighting and aggregation
- **Feedback synthesis** combining AI output with structured rubric evaluation
- **Confidence computation** providing transparency on evaluation certainty

### Layer 4: Review & Reporting Layer
Results presentation and archive management.

- **Results visualization** with interactive question-wise breakdown
- **Report generation** in multiple formats (HTML, PDF, JSON)
- **History persistence** with queryable evaluation archives
- **Comparison analytics** enabling cross-submission analysis
- **Export functionality** for institutional record-keeping
- **UI rendering** via React components with Tailwind styling

---

## 💻 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Chrome Extension**: Manifest V3
- **Storage**: Chrome Storage API
- **UI Components**: Custom React components + Tailwind

---

## 📦 Project Structure

```
phitron-extension/
│
├── src/
│   ├── app/
│   │   ├── options/                    # Main extension UI (options page)
│   │   │   ├── AssignmentListPage.tsx  # Assignment management interface
│   │   │   ├── QuestionSetupPage.tsx   # Question configuration
│   │   │   ├── EvaluationPage.tsx      # Submission evaluation interface
│   │   │   ├── HistoryPage.tsx         # Evaluation history browsing
│   │   │   ├── SettingsPage.tsx        # Provider & API configuration
│   │   │   └── Options.tsx             # Main options container
│   │   │
│   │   └── sidepanel/                  # Chrome side panel UI
│   │       ├── SidePanel.tsx           # Side panel main component
│   │       ├── sidepanelConfig.test.ts # Side panel tests
│   │       └── main.tsx                # Side panel entry point
│   │
│   ├── components/                     # Reusable React components
│   │   ├── assignment/                 # Assignment-related components
│   │   │   ├── AssignmentForm.tsx      # Create/edit assignment form
│   │   │   ├── AssignmentList.tsx      # Display assignment list
│   │   │   ├── QuestionForm.tsx        # Question input form
│   │   │   ├── QuestionList.tsx        # Display questions
│   │   │   ├── QuestionManager.tsx     # Question orchestration
│   │   │   └── QuestionParser.tsx      # Question extraction from text
│   │   │
│   │   ├── evaluation/                 # Evaluation result components
│   │   │   ├── EvaluationResult.tsx    # Main results container
│   │   │   ├── EvaluationResults.tsx   # Results list view
│   │   │   └── QuestionResult.tsx      # Per-question result display
│   │   │
│   │   └── shared/                     # Reusable UI components
│   │       ├── Button.tsx              # Button component
│   │       ├── Input.tsx               # Input field component
│   │       ├── Modal.tsx               # Modal dialog component
│   │       └── Card.tsx                # Card layout component
│   │
│   ├── services/                       # Business logic & API integration
│   │   ├── assignmentService.ts        # Assignment CRUD operations
│   │   ├── evaluationService.ts        # Evaluation orchestration
│   │   ├── storageService.ts           # Chrome Storage abstraction
│   │   ├── apiService.ts               # AI provider integration
│   │   ├── adapterService.ts           # Submission format adapters
│   │   └── parseService.ts             # Question parsing service
│   │
│   ├── core/                           # Core evaluation engine
│   │   ├── evaluationEngine.ts         # Main evaluation orchestrator
│   │   ├── questionMapper.ts           # Content-to-question mapping
│   │   ├── scoreCalculator.ts          # Mark calculation logic
│   │   └── feedbackGenerator.ts        # Feedback synthesis
│   │
│   ├── contentScript/                  # Chrome content scripts
│   │   └── contentScript.ts            # Page context interaction
│   │
│   ├── types/                          # TypeScript interfaces & types
│   │   ├── Assignment.ts               # Assignment type definitions
│   │   ├── Evaluation.ts               # Evaluation result types
│   │   ├── Submission.ts               # Submission types
│   │   └── ApiProvider.ts              # API provider types
│   │
│   ├── utils/                          # Utility functions
│   │   ├── validators.ts               # Data validation functions
│   │   ├── formatters.ts               # Data formatting utilities
│   │   ├── dateUtils.ts                # Date/time helpers
│   │   └── constants.ts                # Application constants
│   │
│   ├── styles/                         # Global stylesheets
│   │   ├── globals.css                 # Global styles
│   │   ├── tailwind.css                # Tailwind configuration
│   │   └── index.css                   # Style entry point
│   │
│   ├── background.ts                   # Extension background script
│   └── main.tsx                        # Application entry point
│
├── public/                             # Static assets
│   ├── icons/                          # Extension icons
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── manifest.json                   # Chrome extension manifest
│
├── dist/                               # Built extension output (generated)
│   ├── background.js
│   ├── options.html
│   ├── sidepanel.html
│   └── assets/
│
├── docs/                               # Documentation
│   ├── superpowers/                    # Architectural documentation
│   │   ├── specs/
│   │   └── plans/
│   └── README.md
│
├── guide/                              # Implementation guides
│   ├── scope/
│   ├── plan/
│   └── ui/
│
├── Configuration Files
│   ├── package.json                    # Project dependencies
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── vite.config.ts                  # Vite build configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── postcss.config.js               # PostCSS configuration
│   └── vitest.config.ts                # Test framework configuration
│
└── README.md                           # This file
```

### Key Directories Explained

| Directory | Purpose |
|-----------|---------|
| `src/app/options/` | Main extension interface (options page) |
| `src/components/` | Reusable React components |
| `src/services/` | Business logic, API calls, storage |
| `src/core/` | Core evaluation algorithm and orchestration |
| `src/types/` | TypeScript interfaces for type safety |
| `public/` | Static assets and extension manifest |
| `dist/` | Built output ready for deployment |
| `docs/` | Architecture and specification documents |

---

## 🎯 Typical Workflow

### Phase 1: Assignment Preparation

**Step 1.1 - Create Assignment**
- Navigate to Assignment Manager
- Input assignment metadata (title, course code, type, total marks)
- Set grading parameters and evaluation mode
- Save assignment to persistent storage

**Step 1.2 - Configure Questions**

Option A (Manual):
- Click "Add Question" for each assessment item
- Define question prompt, answer type, and marks
- Add optional rubric criteria and reference solutions

Option B (Semi-automated):
- Paste assignment text in Question Parser
- System automatically extracts questions and mark allocations
- Review and confirm extracted structure
- Manually adjust any parsing errors

**Step 1.3 - Activation**
- Select assignment from list
- Click "Set as Active"
- Active assignment indicated in header

### Phase 2: Submission Evaluation

**Step 2.1 - Student Submission**
- Direct submission via:
  - Copy-paste in evaluation interface
  - Google Colab notebook link
  - Google Docs link
  - Code file content
- System automatically detects format

**Step 2.2 - Content Extraction**
- Appropriate adapter processes submission
- Content normalized to unified structure
- Manual review/correction if needed

**Step 2.3 - AI Evaluation**
- System maps submission content to questions
- Configured AI model evaluates each answer
- Generates marks and feedback per question
- Computes total score with weighting

### Phase 3: Results & Documentation

**Step 3.1 - Results Review**
- View comprehensive evaluation report
- Question-wise score breakdown
- AI-generated feedback and suggestions
- Visual performance charts

**Step 3.2 - Actions**
- Export report (PDF/JSON/CSV)
- Compare with other submissions
- Re-evaluate with different parameters
- Archive for institutional records

**Step 3.3 - History & Analytics**
- Automatic archival of all evaluations
- Reopen previous evaluations
- Track grading consistency
- Generate cohort-level analytics

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google Chrome or Chromium-based browser
- Git for version control

### Installation & Development

**Clone the repository:**
```bash
git clone https://github.com/yourusername/phitron-extension.git
cd phitron-extension
```

**Install dependencies:**
```bash
npm install
```

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run test suite:**
```bash
npm run test
```

### Loading the Extension in Chrome

1. **Open Chrome Extensions page:**
   - Navigate to `chrome://extensions/` or go to Menu → More tools → Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" switch in top-right corner

3. **Load unpacked extension:**
   - Click "Load unpacked"
   - Navigate to the `dist/` folder in this repository
   - Select and open the folder

4. **Verify installation:**
   - Extension icon should appear in Chrome toolbar
   - Click to open extension popup

### First Run Setup

1. Open extension → Settings
2. Configure AI provider (default pre-configured)
3. (Optional) Enter custom API keys if using own account
4. Create first assignment
5. Start evaluating submissions

---

## 🔒 Security & Privacy

### Data Protection
- **Chrome Storage encryption** - API keys and sensitive data encrypted at rest using Chrome Storage API
- **Minimal data transmission** - Only assignment content and submission data sent to AI providers
- **No telemetry** - No analytics or usage tracking sent to third parties
- **Local processing** - All parsing and data structuring happens client-side
- **GDPR compliance** - No personal student data retained beyond evaluation session

### API Security
- **Credential isolation** - API keys never logged or displayed in plain text
- **Provider verification** - SSL/TLS verification for all API calls
- **Rate limiting** - Built-in protection against API quota exhaustion
- **Error masking** - Sensitive error details never exposed to user interface
- **Token expiration** - Automatic token refresh for long-running evaluations

### Browser Extension Security
- **Manifest V3 compliance** - Latest Chrome extension security standards
- **Content Security Policy** - Strict CSP preventing injection attacks
- **Sandbox isolation** - Content scripts isolated from page context
- **Permission minimization** - Only request necessary Chrome APIs
- **No external scripts** - All code bundled, no remote script loading

### Recommended Security Practices
1. Use default provided API keys for initial testing
2. Rotate custom API keys periodically
3. Use organization-managed credentials when available
4. Review evaluation history for anomalies
5. Keep Chrome browser and extension updated

---

## 🎨 UI Components

- **Assignment List** - view, edit, delete, activate assignments
- **Question Manager** - add, edit, reorder questions
- **Question Parser** - extract questions from text
- **Evaluation Page** - input submission and trigger evaluation
- **Results Panel** - view scores and feedback
- **History View** - browse past evaluations
- **Settings Panel** - configure providers and preferences

---

## 📊 Data Models

### Assignment Object
Represents an academic assessment with associated metadata and configuration.

```typescript
interface Assignment {
  id: string                           // UUID for unique identification
  title: string                        // Assignment name/title
  course: string                       // Course code (e.g., "CS101")
  description?: string                 // Optional detailed description
  type: 'homework' | 'exam' | 'project' | 'practical'  // Assessment type
  totalMarks: number                   // Maximum possible marks
  version: number                      // Version control counter
  isActive: boolean                    // Current evaluation target flag
  createdAt: number                    // UNIX timestamp of creation
  updatedAt: number                    // UNIX timestamp of last modification
  questions: Question[]                // Array of assessment questions
  gradingSettings: {
    evaluationMode: 'analysis-only' | 'rubric-based' | 'reference-comparison'
    aiProvider: 'openai' | 'gemini' | 'claude' | 'custom'
    weightingScheme: 'equal' | 'custom'
    customWeights?: Record<string, number>
  }
}
```

### Question Object
Represents individual assessment items within an assignment.

```typescript
interface Question {
  id: string                           // UUID for question
  number: number                       // Sequential question number
  title: string                        // Question title/label
  prompt: string                       // Question text/prompt
  maxMarks: number                     // Maximum marks for question
  answerType: 'code' | 'essay' | 'multiple-choice' | 'short-answer'
  rubricCriteria?: {                  // Optional evaluation rubric
    criteria: string
    description: string
    points: number
  }[]
  referenceScript?: string             // Optional expected solution
  attachments?: {                      // Optional supporting materials
    type: 'document' | 'image' | 'code'
    url: string
  }[]
  hints?: string                       // Optional student hints
}
```

### EvaluationResult Object
Complete evaluation record including scores, feedback, and metadata.

```typescript
interface EvaluationResult {
  id: string                           // UUID for evaluation record
  assignmentId: string                 // Reference to parent assignment
  submissionContent: string            // Student submission raw content
  submissionFormat: 'colab' | 'docs' | 'text' | 'code'  // Format type
  evaluationMetadata: {
    aiProvider: string                 // Which AI provider was used
    evaluationDuration: number         // Milliseconds taken
    tokenUsage?: {
      prompt: number
      completion: number
      total: number
    }
    confidence: number                 // Overall evaluation confidence (0-1)
  }
  totalMarks: number                   // Total marks obtained
  totalMaxMarks: number                // Total possible marks
  percentage: number                   // Calculated percentage
  questionResults: QuestionResult[]    // Per-question breakdown
  overallFeedback: string              // Consolidated feedback
  evaluatedAt: number                  // UNIX timestamp
  evaluatedBy?: string                 // Instructor identifier
  isArchived: boolean                  // Archive flag
}
```

### QuestionResult Object
Detailed evaluation results for individual questions.

```typescript
interface QuestionResult {
  questionId: string                   // Reference to question
  questionNumber: number               // Question sequence
  marksObtained: number               // Marks awarded
  marksMax: number                     // Total possible marks
  marksPercentage: number             // Percentage for question
  evaluation: {
    analysis: string                   // AI analysis of answer
    mistakes: string[]                 // Identified errors
    suggestions: string[]              // Improvement suggestions
    strengths: string[]                // What was done well
  }
  rubricFeedback?: {                   // Per-criterion feedback
    criterion: string
    score: number
    feedback: string
  }[]
  confidence: number                   // AI confidence (0-1)
  flaggedForReview: boolean           // Manual review flag
}
```

---

## 🔄 Supported Submission Formats

| Format | Status | Notes |
|--------|--------|-------|
| Google Colab | ✅ Supported | Auto-extract code and output |
| Google Docs | ✅ Supported | Parse formatted text |
| Plain Text | ✅ Supported | Direct answer input |
| Code Files | ✅ Supported | Python, JavaScript, Java, etc. |
| PDF Upload | 🔄 Planned | V2 feature |
| DOCX Upload | 🔄 Planned | V2 feature |
| Batch Folders | 🔄 Planned | V2 feature |
| LMS Integration | 🔄 Planned | V2 feature |

---

## 🤖 AI Providers

| Provider | Status | Notes |
|----------|--------|-------|
| OpenAI | ✅ Supported | GPT-3.5, GPT-4 |
| Google Gemini | ✅ Supported | Gemini Pro |
| Anthropic Claude | ✅ Supported | Claude 2, Claude 3 |
| Custom Provider | ✅ Extensible | Add your own |

---

## 📝 Evaluation Modes

The system supports multiple evaluation paradigms to accommodate diverse assessment requirements:

### Analysis-Only Mode
AI performs content analysis and generates feedback without attempting exact mark assignment. Useful for formative assessment and detailed feedback.

**Output:**
- Detailed analysis of student responses
- Identified strengths and weaknesses
- Constructive improvement suggestions
- Recommendations on next steps

### Rubric-Based Evaluation
Evaluation against predefined criteria with structured feedback per rubric dimension.

**Configuration:**
- Define evaluation criteria per question
- Assign points per criterion
- Set quality thresholds
- Configure weighting across criteria

**Output:**
- Criterion-by-criterion scores
- Rubric-aligned feedback
- Criterion-level suggestions
- Summary with dominant areas

### Reference Comparison Mode
Direct comparison of student submission against provided reference solution/script.

**Requirements:**
- Reference answer or solution
- Comparison strategy (code diff, semantic similarity, output matching)

**Output:**
- Differences highlighted
- Coverage analysis
- Efficiency evaluation
- Correctness assessment

### Hybrid Mode
Combines multiple approaches for comprehensive evaluation.

---

## 🎓 Use Cases

| Use Case | Evaluation Mode | Best For |
|----------|-----------------|----------|
| **Assignment Grading** | Rubric-based | Consistent grading across students |
| **Exam Evaluation** | Analysis + Reference | Objective and subjective assessment |
| **Programming Assignments** | Reference comparison | Code correctness verification |
| **Essay/Written Responses** | Analysis-only | Content and argumentation assessment |
| **Project Evaluation** | Hybrid | Multi-faceted deliverable assessment |
| **Formative Feedback** | Analysis-only | Constructive guidance without grades |
| **Practical Labs** | Reference comparison | Output and methodology validation |
| **Peer Learning** | Analysis-only | Constructive peer feedback generation |

---

## 🔧 Advanced Configuration

### Custom Grading Rubrics
Define institution-specific evaluation criteria:
```typescript
{
  criteria: "Code readability",
  description: "Code follows naming conventions and is well-structured",
  levels: [
    { level: "Excellent", points: 5, description: "Clear, well-organized code" },
    { level: "Good", points: 3, description: "Generally readable with minor issues" },
    { level: "Fair", points: 2, description: "Readable but could be improved" },
    { level: "Poor", points: 0, description: "Difficult to follow" }
  ]
}
```

### Reference Solution Management
Attach expected solutions for automatic comparison:
- Support for multiple reference implementations
- Language-specific comparison strategies
- Output validation rules
- Performance benchmarking

### Weighted Scoring
Configure mark allocation across questions:
- Equal weighting (default)
- Custom per-question weights
- Question-type-based scaling
- Difficulty-adjusted scaling

### API Provider Configuration
Specify evaluation AI preferences:
- Primary provider with fallback
- Model-specific parameters
- Temperature and creativity settings
- Response format specifications

---

## 📈 Version History

- **v0.1.0** (Current)
  - Assignment creation and management
  - Multi-format submission support
  - AI-powered evaluation
  - API provider selection
  - Results and history tracking

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Before You Start
1. Check [existing issues](https://github.com/yourusername/phitron-extension/issues) to avoid duplicates
2. Review the [scope document](./guide/scope/full_scope.md) for planned features
3. Review the [implementation plan](./guide/plan/implementation.md) for architecture

### Development Guidelines

**Code Standards:**
- TypeScript strict mode enabled
- All code must pass type checking: `npm run build`
- Follow existing code style and naming conventions
- Use meaningful variable and function names
- Add comments for non-obvious logic only

**Testing:**
- Write tests for new features: `npm run test`
- Maintain minimum 70% code coverage
- Test both happy path and edge cases
- Use descriptive test names

**Commits:**
- Use descriptive commit messages
- Reference issue numbers: "Fixes #123"
- Keep commits focused and atomic
- Follow [Conventional Commits](https://www.conventionalcommits.org/)

**Pull Requests:**
1. Create feature branch: `git checkout -b feature/description`
2. Make your changes with clear commits
3. Run full test suite: `npm run test`
4. Submit PR with:
   - Clear description of changes
   - Reference to related issue
   - Screenshots/videos if UI changes
   - Testing steps for manual verification

### Areas for Contribution
- **Features** - New evaluation modes, submission formats, UI components
- **Bug fixes** - Issues in evaluation logic, UI, or data persistence
- **Documentation** - Improve guides, add examples, clarify instructions
- **Tests** - Increase coverage, add edge cases
- **Performance** - Optimize evaluation speed, reduce memory usage
- **Accessibility** - Improve keyboard navigation, screen reader support

---

## 📄 License

© 2026 Phitron. All rights reserved.

This is proprietary software. Unauthorized copying, modification, or distribution is prohibited.

---

## 📞 Support & Documentation

### For Developers
- **[Architecture Guide](./docs/superpowers/)**
- **[Implementation Plan](./guide/plan/implementation.md)**
- **[Scope Document](./guide/scope/full_scope.md)**
- **[API Documentation](./src/types/)** - TypeScript interface definitions

### For Instructors/Users
- **[Getting Started](#-getting-started)** - Installation and initial setup
- **[Workflow Guide](#-typical-workflow)** - Step-by-step evaluation process
- **[FAQ](./docs/FAQ.md)** - Frequently asked questions
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Issue Reporting
When reporting issues, please include:
1. **Environment** - Chrome version, OS, extension version
2. **Reproduction steps** - Clear steps to reproduce
3. **Expected vs actual** - What should happen vs what does
4. **Screenshots/logs** - Visual evidence or error messages
5. **Assignment/question structure** - If issue is evaluation-related

### Contact
- **Issues**: [GitHub Issues](https://github.com/yourusername/phitron-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/phitron-extension/discussions)
- **Email**: support@phitron.ai

---

## 🗺️ Roadmap

### Completed (v0.1.0)
- ✅ Assignment creation and management
- ✅ Multi-source submission intake
- ✅ AI-powered evaluation
- ✅ Multiple API provider support
- ✅ Evaluation history and reporting

### In Development (v0.2.0)
- 🔄 PDF/DOCX upload support
- 🔄 Batch submission processing
- 🔄 Advanced analytics dashboard
- 🔄 Performance metrics tracking

### Planned (v1.0.0)
- 📋 LMS integration (Canvas, Blackboard, Moodle)
- 📋 Anonymous grading mode
- 📋 Rubric templates library
- 📋 Peer grading assistance
- 📋 Mobile app support
- 📋 Real-time collaboration features

---

## 📊 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 20+ React components
- **Services**: 8+ service modules
- **Type Coverage**: 95%+
- **Test Coverage**: 70%+
- **Documentation**: Comprehensive guides and specs

---

**Built with ❤️ for educators who deserve better tools**

*Phitron Extension - Smart Academic Evaluation. Simplified.*
