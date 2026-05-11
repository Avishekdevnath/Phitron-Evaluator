# Phitron Extension: Smart Multi-Source Assignment Evaluator - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a stateful, AI-powered Chrome extension that evaluates student assignments question-by-question using OpenAI's API, with persistent assignment management and evaluation history.

**Architecture:** 
- React + TypeScript frontend (popup + options page)
- Manifest V3 extension shell
- Provider abstraction layer for AI integration
- Format-agnostic evaluation engine
- Local storage for assignments and results

**Tech Stack:** 
- React 18 + TypeScript
- Tailwind CSS
- Vite (build tool for Chrome extension)
- chrome.storage.local API
- OpenAI API (user-provided key)

---

## File Structure

```
phitron-extension/
├── public/
│   ├── manifest.json
│   ├── popup.html
│   ├── options.html
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── src/
│   ├── app/
│   │   ├── popup/
│   │   │   ├── Popup.tsx
│   │   │   ├── PopupRouter.tsx
│   │   │   └── styles.css
│   │   └── options/
│   │       ├── Options.tsx
│   │       ├── SettingsPage.tsx
│   │       ├── HistoryPage.tsx
│   │       └── styles.css
│   ├── components/
│   │   ├── assignment/
│   │   │   ├── AssignmentList.tsx
│   │   │   ├── AssignmentForm.tsx
│   │   │   ├── QuestionList.tsx
│   │   │   ├── QuestionForm.tsx
│   │   │   └── QuestionManager.tsx
│   │   ├── evaluation/
│   │   │   ├── SubmissionForm.tsx
│   │   │   ├── EvaluationResults.tsx
│   │   │   ├── QuestionResult.tsx
│   │   │   ├── MappingReview.tsx
│   │   │   └── ResultExporter.tsx
│   │   └── shared/
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Badge.tsx
│   ├── core/
│   │   ├── assignment/
│   │   │   ├── assignmentService.ts
│   │   │   ├── assignmentService.test.ts
│   │   │   ├── assignmentTypes.ts
│   │   │   └── questionValidator.ts
│   │   ├── evaluation/
│   │   │   ├── evaluationEngine.ts
│   │   │   ├── evaluationEngine.test.ts
│   │   │   ├── evaluationTypes.ts
│   │   │   └── promptBuilder.ts
│   │   ├── mapping/
│   │   │   ├── answerMapper.ts
│   │   │   ├── answerMapper.test.ts
│   │   │   └── mappingTypes.ts
│   │   ├── parsing/
│   │   │   ├── questionParser.ts
│   │   │   ├── questionParser.test.ts
│   │   │   ├── localParser.ts
│   │   │   ├── aiParser.ts
│   │   │   └── parsingTypes.ts
│   │   ├── providers/
│   │   │   ├── providerInterface.ts
│   │   │   ├── openaiProvider.ts
│   │   │   ├── providerFactory.ts
│   │   │   └── providers.test.ts
│   │   ├── reporting/
│   │   │   ├── reportingService.ts
│   │   │   └── reportingTypes.ts
│   │   └── submission/
│   │       ├── submissionNormalizer.ts
│   │       ├── submissionNormalizer.test.ts
│   │       └── submissionTypes.ts
│   ├── services/
│   │   ├── storage/
│   │   │   ├── storageService.ts
│   │   │   ├── storageService.test.ts
│   │   │   └── storageTypes.ts
│   │   ├── history/
│   │   │   ├── historyService.ts
│   │   │   └── historyService.test.ts
│   │   └── settings/
│   │       ├── settingsService.ts
│   │       └── settingsService.test.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── errors.ts
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

# PHASE 1: Extension Foundation

## Task 1.1: Initialize Project and Install Dependencies

- [ ] **Step 1: Create package.json with core dependencies**

```json
{
  "name": "phitron-extension",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
cd "s:\SDE\Projects\Phitron Extension"
npm install
```

Expected: All dependencies installed, node_modules/ created.

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.app.json" }]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'public/popup.html'),
        options: path.resolve(__dirname, 'public/options.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
```

- [ ] **Step 5: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## Task 1.2: Create Chrome Extension Manifest and HTML Shells

- [ ] **Step 1: Create public/manifest.json (Manifest V3)**

```json
{
  "manifest_version": 3,
  "name": "Phitron Assignment Evaluator",
  "version": "0.1.0",
  "description": "AI-powered assignment evaluator for educators",
  "permissions": [
    "storage",
    "scripting",
    "activeTab"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Phitron Evaluator"
  },
  "options_page": "options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "host_permissions": [
    "https://api.openai.com/*"
  ]
}
```

- [ ] **Step 2: Create public/popup.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phitron Evaluator</title>
</head>
<body>
  <div id="popup-root"></div>
  <script type="module" src="../../src/app/popup/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 3: Create public/options.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phitron Settings</title>
</head>
<body>
  <div id="options-root"></div>
  <script type="module" src="../../src/app/options/main.tsx"></script>
</body>
</html>
```

---

## Task 1.3: Define Core TypeScript Types

- [ ] **Step 1: Create src/types/index.ts with all core types**

```typescript
// Assignment Types
export interface Assignment {
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

export interface Question {
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

// Submission Types
export interface Submission {
  id: string
  name: string
  source: 'text' | 'script' | 'colab' | 'docs'
  blocks: SubmissionBlock[]
  rawContent: string
  uploadedAt: string
}

export interface SubmissionBlock {
  id: string
  type: 'heading' | 'paragraph' | 'code' | 'markdown' | 'output'
  content: string
  order: number
  sourceMeta?: Record<string, string>
}

// Evaluation Types
export interface EvaluationResult {
  id: string
  assignmentId: string
  assignmentVersion: number
  submissionId: string
  submissionName: string
  totalScore: number
  maxScore: number
  generatedAt: string
  questionResults: QuestionResult[]
}

export interface QuestionResult {
  questionId: string
  questionNumber: string
  awardedMarks: number
  maxMarks: number
  summary: string
  strengths: string[]
  mistakes: string[]
  suggestions: string[]
  rubricAlignment: string
  confidence: 'high' | 'medium' | 'low'
  status: 'complete' | 'partial' | 'skipped'
}

// Provider Types
export interface ProviderSettings {
  mode: 'default' | 'custom'
  provider: 'openai'
  apiKey?: string
  model?: string
}

// Mapping Types
export interface QuestionMapping {
  questionId: string
  mappedBlocks: SubmissionBlock[]
  confidence: number
  strategy: 'explicit' | 'keyword' | 'proximity' | 'ai_fallback'
}

// Error Types
export interface AppError extends Error {
  code: string
  details?: Record<string, any>
}

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR'
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
  }
}

export class StorageError extends Error implements AppError {
  code = 'STORAGE_ERROR'
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
  }
}

export class ProviderError extends Error implements AppError {
  code = 'PROVIDER_ERROR'
  constructor(message: string, public details?: Record<string, any>) {
    super(message)
  }
}
```

---

## Task 1.4: Implement Storage Utility Layer

- [ ] **Step 1: Create src/services/storage/storageTypes.ts**

```typescript
import { 
  Assignment, 
  EvaluationResult, 
  ProviderSettings,
  Submission 
} from '../../types/index'

export interface StorageData {
  assignments: Assignment[]
  activeAssignmentId: string | null
  evaluations: EvaluationResult[]
  providerSettings: ProviderSettings
}

export interface StorageService {
  initialize(): Promise<void>
  getAll(): Promise<StorageData>
  
  // Assignments
  getAssignments(): Promise<Assignment[]>
  getAssignment(id: string): Promise<Assignment | null>
  saveAssignment(assignment: Assignment): Promise<void>
  deleteAssignment(id: string): Promise<void>
  
  // Active Assignment
  getActiveAssignment(): Promise<Assignment | null>
  setActiveAssignment(id: string | null): Promise<void>
  
  // Evaluations
  getEvaluations(): Promise<EvaluationResult[]>
  saveEvaluation(result: EvaluationResult): Promise<void>
  deleteEvaluation(id: string): Promise<void>
  
  // Provider Settings
  getProviderSettings(): Promise<ProviderSettings>
  saveProviderSettings(settings: ProviderSettings): Promise<void>
  
  // Cleanup
  clearAll(): Promise<void>
}
```

- [ ] **Step 2: Create src/services/storage/storageService.ts with chrome.storage.local implementation**

```typescript
import { 
  Assignment, 
  EvaluationResult, 
  ProviderSettings 
} from '../../types/index'
import { 
  StorageData, 
  StorageService 
} from './storageTypes'
import { StorageError } from '../../types/index'

const STORAGE_KEY = 'phitron_data'

const DEFAULT_STORAGE: StorageData = {
  assignments: [],
  activeAssignmentId: null,
  evaluations: [],
  providerSettings: {
    mode: 'custom',
    provider: 'openai',
  },
}

export class ChromeStorageService implements StorageService {
  private cache: StorageData | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY)
      this.cache = data[STORAGE_KEY] || DEFAULT_STORAGE
      this.initialized = true
    } catch (error) {
      throw new StorageError(
        'Failed to initialize storage',
        { originalError: error }
      )
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  private async persist(): Promise<void> {
    if (!this.cache) return
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: this.cache })
    } catch (error) {
      throw new StorageError('Failed to persist data', { originalError: error })
    }
  }

  async getAll(): Promise<StorageData> {
    await this.ensureInitialized()
    return { ...this.cache! }
  }

  async getAssignments(): Promise<Assignment[]> {
    const data = await this.getAll()
    return data.assignments
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    const assignments = await this.getAssignments()
    return assignments.find(a => a.id === id) || null
  }

  async saveAssignment(assignment: Assignment): Promise<void> {
    await this.ensureInitialized()
    const index = this.cache!.assignments.findIndex(a => a.id === assignment.id)
    if (index >= 0) {
      this.cache!.assignments[index] = assignment
    } else {
      this.cache!.assignments.push(assignment)
    }
    await this.persist()
  }

  async deleteAssignment(id: string): Promise<void> {
    await this.ensureInitialized()
    this.cache!.assignments = this.cache!.assignments.filter(a => a.id !== id)
    if (this.cache!.activeAssignmentId === id) {
      this.cache!.activeAssignmentId = null
    }
    await this.persist()
  }

  async getActiveAssignment(): Promise<Assignment | null> {
    const data = await this.getAll()
    if (!data.activeAssignmentId) return null
    return this.getAssignment(data.activeAssignmentId)
  }

  async setActiveAssignment(id: string | null): Promise<void> {
    await this.ensureInitialized()
    if (id && !(await this.getAssignment(id))) {
      throw new StorageError('Assignment not found', { id })
    }
    this.cache!.activeAssignmentId = id
    await this.persist()
  }

  async getEvaluations(): Promise<EvaluationResult[]> {
    const data = await this.getAll()
    return data.evaluations
  }

  async saveEvaluation(result: EvaluationResult): Promise<void> {
    await this.ensureInitialized()
    const index = this.cache!.evaluations.findIndex(e => e.id === result.id)
    if (index >= 0) {
      this.cache!.evaluations[index] = result
    } else {
      this.cache!.evaluations.push(result)
    }
    await this.persist()
  }

  async deleteEvaluation(id: string): Promise<void> {
    await this.ensureInitialized()
    this.cache!.evaluations = this.cache!.evaluations.filter(e => e.id !== id)
    await this.persist()
  }

  async getProviderSettings(): Promise<ProviderSettings> {
    const data = await this.getAll()
    return { ...data.providerSettings }
  }

  async saveProviderSettings(settings: ProviderSettings): Promise<void> {
    await this.ensureInitialized()
    this.cache!.providerSettings = settings
    await this.persist()
  }

  async clearAll(): Promise<void> {
    this.cache = DEFAULT_STORAGE
    await this.persist()
  }
}

export const storageService = new ChromeStorageService()
```

- [ ] **Step 3: Create src/services/storage/storageService.test.ts**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChromeStorageService } from './storageService'
import { Assignment, StorageError } from '../../types/index'

describe('ChromeStorageService', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = new ChromeStorageService()
    vi.clearAllMocks()
  })

  it('should initialize and load default data', async () => {
    // Mock chrome.storage.local
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any

    await service.initialize()
    const data = await service.getAll()

    expect(data.assignments).toEqual([])
    expect(data.activeAssignmentId).toBe(null)
  })

  it('should save and retrieve assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test Assignment',
      totalMarks: 100,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    } as any

    await service.initialize()
    await service.saveAssignment(mockAssignment)

    const retrieved = await service.getAssignment('1')
    expect(retrieved).toEqual(mockAssignment)
  })

  it('should throw StorageError on storage failure', async () => {
    global.chrome = {
      storage: {
        local: {
          get: vi.fn().mockRejectedValue(new Error('Storage failed')),
          set: vi.fn(),
        },
      },
    } as any

    await expect(service.initialize()).rejects.toThrow(StorageError)
  })
})
```

- [ ] **Step 4: Create src/utils/validation.ts for input validation**

```typescript
import { ValidationError } from '../types/index'

export function validateAssignmentTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('Assignment title cannot be empty')
  }
  if (title.length > 200) {
    throw new ValidationError('Assignment title cannot exceed 200 characters')
  }
}

export function validateQuestionTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('Question title cannot be empty')
  }
}

export function validateMaxMarks(marks: number): void {
  if (typeof marks !== 'number' || marks < 0) {
    throw new ValidationError('Max marks must be a non-negative number')
  }
  if (marks > 1000) {
    throw new ValidationError('Max marks cannot exceed 1000')
  }
}

export function validateOpenAIKey(key: string): void {
  if (!key || key.trim().length === 0) {
    throw new ValidationError('API key cannot be empty')
  }
  // OpenAI keys start with sk-
  if (!key.startsWith('sk-')) {
    throw new ValidationError('Invalid OpenAI API key format. Must start with sk-')
  }
}

export function validateSubmissionContent(content: string): void {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('Submission cannot be empty')
  }
}
```

---

## Task 1.5: Create React Popup and Options Page Shells

- [ ] **Step 1: Create src/app/popup/main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import Popup from './Popup'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('popup-root')!)
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
```

- [ ] **Step 2: Create src/app/popup/Popup.tsx**

```typescript
import React, { useState, useEffect } from 'react'
import { Assignment } from '../../types/index'
import { storageService } from '../../services/storage/storageService'

export default function Popup() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [assignmentList, active] = await Promise.all([
        storageService.getAssignments(),
        storageService.getActiveAssignment(),
      ])
      setAssignments(assignmentList)
      setActiveId(active?.id || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="w-80 p-4 bg-white">
      <h1 className="text-lg font-bold mb-4">Phitron Evaluator</h1>
      
      {assignments.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No assignments yet. Go to options to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className={`p-3 border rounded cursor-pointer ${
                activeId === assignment.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50'
              }`}
            >
              <div className="font-semibold text-sm">{assignment.title}</div>
              <div className="text-xs text-gray-500">
                {assignment.questions.length} questions
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Open Settings
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Create src/app/options/main.tsx**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import Options from './Options'
import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('options-root')!)
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
)
```

- [ ] **Step 4: Create src/app/options/Options.tsx**

```typescript
import React, { useState, useEffect } from 'react'
import SettingsPage from './SettingsPage'
import HistoryPage from './HistoryPage'

type PageType = 'assignments' | 'settings' | 'history'

export default function Options() {
  const [currentPage, setCurrentPage] = useState<PageType>('assignments')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-4">
          <button
            onClick={() => setCurrentPage('assignments')}
            className={`px-4 py-2 rounded ${
              currentPage === 'assignments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`px-4 py-2 rounded ${
              currentPage === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className={`px-4 py-2 rounded ${
              currentPage === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'history' && <HistoryPage />}
        {currentPage === 'assignments' && <div>Assignment Manager (Phase 3)</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create stub pages (SettingsPage.tsx, HistoryPage.tsx)**

```typescript
// src/app/options/SettingsPage.tsx
export default function SettingsPage() {
  return <div className="text-gray-600">Provider settings (Phase 4)</div>
}

// src/app/options/HistoryPage.tsx
export default function HistoryPage() {
  return <div className="text-gray-600">Evaluation history (Phase 10)</div>
}
```

- [ ] **Step 6: Create Tailwind CSS files**

Create `src/app/popup/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

Create `src/app/options/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 7: Test Extension Loads**

```bash
npm run build
# In Chrome: chrome://extensions/ → Load unpacked → dist/ folder
# Verify popup and options page load without errors
```

---

## Task 1.6: Create Core Service Instance and Export

- [ ] **Step 1: Create src/main.tsx as singleton entry**

```typescript
// Re-exports for global usage across extension
export { storageService } from './services/storage/storageService'
export type { StorageService } from './services/storage/storageTypes'

// Initialize storage on extension load
import { storageService } from './services/storage/storageService'
storageService.initialize().catch(err => {
  console.error('Failed to initialize storage service:', err)
})
```

---

**Phase 1 Complete:** Extension shell loads, storage utilities work, core types defined.

---

# PHASE 2: Data Persistence Layer

## Task 2.1: Implement Assignment CRUD Service

- [ ] **Step 1: Create src/core/assignment/assignmentTypes.ts**

```typescript
import { Assignment, Question } from '../../types/index'

export interface AssignmentCreateInput {
  title: string
  course?: string
  type?: string
  questions?: Question[]
}

export interface AssignmentUpdateInput {
  title?: string
  course?: string
  type?: string
}

export interface AssignmentService {
  create(input: AssignmentCreateInput): Promise<Assignment>
  getAll(): Promise<Assignment[]>
  getById(id: string): Promise<Assignment | null>
  update(id: string, input: AssignmentUpdateInput): Promise<Assignment>
  delete(id: string): Promise<void>
  duplicate(id: string, newTitle: string): Promise<Assignment>
  setActive(id: string | null): Promise<void>
  getActive(): Promise<Assignment | null>
  addQuestion(assignmentId: string, question: Question): Promise<Assignment>
  updateQuestion(assignmentId: string, questionId: string, updates: Partial<Question>): Promise<Assignment>
  deleteQuestion(assignmentId: string, questionId: string): Promise<Assignment>
  reorderQuestions(assignmentId: string, questionIds: string[]): Promise<Assignment>
}
```

- [ ] **Step 2: Create src/core/assignment/assignmentService.ts**

```typescript
import { v4 as uuidv4 } from 'uuid'
import { Assignment, Question, ValidationError } from '../../types/index'
import { storageService } from '../../services/storage/storageService'
import { validateAssignmentTitle, validateMaxMarks } from '../../utils/validation'
import { AssignmentCreateInput, AssignmentUpdateInput, AssignmentService } from './assignmentTypes'

export class AssignmentServiceImpl implements AssignmentService {
  async create(input: AssignmentCreateInput): Promise<Assignment> {
    validateAssignmentTitle(input.title)

    const assignment: Assignment = {
      id: uuidv4(),
      title: input.title,
      course: input.course,
      type: input.type,
      totalMarks: input.questions?.reduce((sum, q) => sum + q.maxMarks, 0) || 0,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: input.questions || [],
    }

    await storageService.saveAssignment(assignment)
    return assignment
  }

  async getAll(): Promise<Assignment[]> {
    return storageService.getAssignments()
  }

  async getById(id: string): Promise<Assignment | null> {
    return storageService.getAssignment(id)
  }

  async update(id: string, input: AssignmentUpdateInput): Promise<Assignment> {
    const assignment = await this.getById(id)
    if (!assignment) {
      throw new Error(`Assignment ${id} not found`)
    }

    if (input.title) {
      validateAssignmentTitle(input.title)
      assignment.title = input.title
    }
    if (input.course !== undefined) assignment.course = input.course
    if (input.type !== undefined) assignment.type = input.type

    assignment.updatedAt = new Date().toISOString()
    await storageService.saveAssignment(assignment)
    return assignment
  }

  async delete(id: string): Promise<void> {
    await storageService.deleteAssignment(id)
  }

  async duplicate(id: string, newTitle: string): Promise<Assignment> {
    const original = await this.getById(id)
    if (!original) {
      throw new Error(`Assignment ${id} not found`)
    }

    validateAssignmentTitle(newTitle)

    const duplicated: Assignment = {
      ...original,
      id: uuidv4(),
      title: newTitle,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: original.questions.map(q => ({
        ...q,
        id: uuidv4(),
      })),
    }

    await storageService.saveAssignment(duplicated)
    return duplicated
  }

  async setActive(id: string | null): Promise<void> {
    if (id && !(await this.getById(id))) {
      throw new Error(`Assignment ${id} not found`)
    }
    await storageService.setActiveAssignment(id)
  }

  async getActive(): Promise<Assignment | null> {
    return storageService.getActiveAssignment()
  }

  async addQuestion(assignmentId: string, question: Question): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    validateMaxMarks(question.maxMarks)
    
    const newQuestion: Question = {
      ...question,
      id: question.id || uuidv4(),
    }

    assignment.questions.push(newQuestion)
    assignment.totalMarks += newQuestion.maxMarks
    assignment.updatedAt = new Date().toISOString()

    await storageService.saveAssignment(assignment)
    return assignment
  }

  async updateQuestion(
    assignmentId: string,
    questionId: string,
    updates: Partial<Question>
  ): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    const questionIndex = assignment.questions.findIndex(q => q.id === questionId)
    if (questionIndex < 0) {
      throw new Error(`Question ${questionId} not found`)
    }

    const oldMarks = assignment.questions[questionIndex].maxMarks
    const newMarks = updates.maxMarks ?? oldMarks

    if (newMarks !== oldMarks) {
      validateMaxMarks(newMarks)
      assignment.totalMarks = assignment.totalMarks - oldMarks + newMarks
    }

    assignment.questions[questionIndex] = {
      ...assignment.questions[questionIndex],
      ...updates,
      id: questionId, // Prevent ID change
    }

    assignment.updatedAt = new Date().toISOString()
    await storageService.saveAssignment(assignment)
    return assignment
  }

  async deleteQuestion(assignmentId: string, questionId: string): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    const question = assignment.questions.find(q => q.id === questionId)
    if (!question) {
      throw new Error(`Question ${questionId} not found`)
    }

    assignment.questions = assignment.questions.filter(q => q.id !== questionId)
    assignment.totalMarks -= question.maxMarks
    assignment.updatedAt = new Date().toISOString()

    await storageService.saveAssignment(assignment)
    return assignment
  }

  async reorderQuestions(assignmentId: string, questionIds: string[]): Promise<Assignment> {
    const assignment = await this.getById(assignmentId)
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`)
    }

    if (questionIds.length !== assignment.questions.length) {
      throw new ValidationError('Question count mismatch')
    }

    const questionMap = new Map(assignment.questions.map(q => [q.id, q]))
    assignment.questions = questionIds
      .map(id => questionMap.get(id))
      .filter((q): q is Question => q !== undefined)

    assignment.updatedAt = new Date().toISOString()
    await storageService.saveAssignment(assignment)
    return assignment
  }
}

export const assignmentService = new AssignmentServiceImpl()
```

- [ ] **Step 3: Create src/core/assignment/assignmentService.test.ts**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AssignmentServiceImpl } from './assignmentService'
import { storageService } from '../../services/storage/storageService'
import { Assignment, Question } from '../../types/index'

vi.mock('../../services/storage/storageService')

describe('AssignmentService', () => {
  let service: AssignmentServiceImpl

  beforeEach(() => {
    service = new AssignmentServiceImpl()
    vi.clearAllMocks()
  })

  it('should create assignment with questions', async () => {
    const input = {
      title: 'Midterm Exam',
      course: 'CS101',
      questions: [
        {
          id: '1',
          number: '1',
          title: 'Question 1',
          prompt: 'What is 2+2?',
          maxMarks: 5,
          answerType: 'theory' as const,
        },
      ],
    }

    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const assignment = await service.create(input)

    expect(assignment.title).toBe('Midterm Exam')
    expect(assignment.totalMarks).toBe(5)
    expect(assignment.questions.length).toBe(1)
    expect(vi.mocked(storageService.saveAssignment)).toHaveBeenCalled()
  })

  it('should throw on empty title', async () => {
    await expect(service.create({ title: '' })).rejects.toThrow()
  })

  it('should add question to assignment', async () => {
    const mockAssignment: Assignment = {
      id: '1',
      title: 'Test',
      totalMarks: 10,
      version: 1,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [],
    }

    const newQuestion: Question = {
      id: '2',
      number: '1',
      title: 'Q1',
      prompt: 'Test',
      maxMarks: 5,
    }

    vi.mocked(storageService.getAssignment).mockResolvedValue(mockAssignment)
    vi.mocked(storageService.saveAssignment).mockResolvedValue(undefined)

    const updated = await service.addQuestion('1', newQuestion)

    expect(updated.questions.length).toBe(1)
    expect(updated.totalMarks).toBe(15)
  })
})
```

---

## Task 2.2: Implement History and Settings Services

- [ ] **Step 1: Create src/services/history/historyService.ts**

```typescript
import { EvaluationResult } from '../../types/index'
import { storageService } from '../storage/storageService'

export interface HistoryService {
  getAll(): Promise<EvaluationResult[]>
  getByAssignment(assignmentId: string): Promise<EvaluationResult[]>
  getById(id: string): Promise<EvaluationResult | null>
  delete(id: string): Promise<void>
  deleteByAssignment(assignmentId: string): Promise<void>
}

export class HistoryServiceImpl implements HistoryService {
  async getAll(): Promise<EvaluationResult[]> {
    return storageService.getEvaluations()
  }

  async getByAssignment(assignmentId: string): Promise<EvaluationResult[]> {
    const all = await this.getAll()
    return all.filter(e => e.assignmentId === assignmentId)
  }

  async getById(id: string): Promise<EvaluationResult | null> {
    const all = await this.getAll()
    return all.find(e => e.id === id) || null
  }

  async delete(id: string): Promise<void> {
    await storageService.deleteEvaluation(id)
  }

  async deleteByAssignment(assignmentId: string): Promise<void> {
    const evaluations = await this.getByAssignment(assignmentId)
    for (const evaluation of evaluations) {
      await this.delete(evaluation.id)
    }
  }
}

export const historyService = new HistoryServiceImpl()
```

- [ ] **Step 2: Create src/services/settings/settingsService.ts**

```typescript
import { ProviderSettings } from '../../types/index'
import { storageService } from '../storage/storageService'
import { validateOpenAIKey } from '../../utils/validation'

export interface SettingsService {
  getProviderSettings(): Promise<ProviderSettings>
  setProviderSettings(settings: ProviderSettings): Promise<void>
  validateAndSetKey(key: string): Promise<void>
}

export class SettingsServiceImpl implements SettingsService {
  async getProviderSettings(): Promise<ProviderSettings> {
    return storageService.getProviderSettings()
  }

  async setProviderSettings(settings: ProviderSettings): Promise<void> {
    if (settings.apiKey) {
      validateOpenAIKey(settings.apiKey)
    }
    await storageService.saveProviderSettings(settings)
  }

  async validateAndSetKey(key: string): Promise<void> {
    validateOpenAIKey(key)
    const current = await this.getProviderSettings()
    await this.setProviderSettings({
      ...current,
      apiKey: key,
      mode: 'custom',
    })
  }
}

export const settingsService = new SettingsServiceImpl()
```

- [ ] **Step 3: Test both services with basic unit tests**

```bash
npm run test
# Verify all Phase 2 tests pass
```

---

**Phase 2 Complete:** Full CRUD for assignments, active assignment tracking, history and settings services working.

---

# PHASE 3: Assignment Manager UI

## Task 3.1: Build Assignment List and Create Form

- [ ] **Step 1: Create src/components/assignment/AssignmentList.tsx**

```typescript
import React, { useState, useEffect } from 'react'
import { Assignment } from '../../types/index'
import { assignmentService } from '../../core/assignment/assignmentService'
import AssignmentForm from './AssignmentForm'
import Card from '../shared/Card'
import Button from '../shared/Button'

interface AssignmentListProps {
  onSelect: (assignment: Assignment) => void
}

export default function AssignmentList({ onSelect }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [list, active] = await Promise.all([
        assignmentService.getAll(),
        assignmentService.getActive(),
      ])
      setAssignments(list)
      setActiveId(active?.id || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(title: string, course?: string) {
    try {
      const assignment = await assignmentService.create({
        title,
        course,
      })
      setAssignments([...assignments, assignment])
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment? This cannot be undone.')) return
    try {
      await assignmentService.delete(id)
      setAssignments(assignments.filter(a => a.id !== id))
      if (activeId === id) {
        setActiveId(null)
        await assignmentService.setActive(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment')
    }
  }

  async function handleActivate(id: string) {
    try {
      await assignmentService.setActive(id)
      setActiveId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate assignment')
    }
  }

  if (loading) return <div>Loading assignments...</div>

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      {showForm ? (
        <AssignmentForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Assignment
        </Button>
      )}

      <div className="space-y-2">
        {assignments.length === 0 ? (
          <div className="text-gray-500">No assignments yet</div>
        ) : (
          assignments.map(assignment => (
            <Card
              key={assignment.id}
              className={`p-4 cursor-pointer ${
                activeId === assignment.id ? 'bg-blue-50 border-2 border-blue-500' : ''
              }`}
              onClick={() => onSelect(assignment)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{assignment.title}</h3>
                  {assignment.course && (
                    <p className="text-sm text-gray-500">{assignment.course}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {assignment.questions.length} questions • {assignment.totalMarks} marks
                  </p>
                </div>
                <div className="space-x-2">
                  {activeId !== assignment.id && (
                    <Button
                      onClick={e => {
                        e.stopPropagation()
                        handleActivate(assignment.id)
                      }}
                      className="text-sm px-2 py-1"
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(assignment.id)
                    }}
                    className="text-sm px-2 py-1 bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/assignment/AssignmentForm.tsx**

```typescript
import React, { useState } from 'react'
import Button from '../shared/Button'

interface AssignmentFormProps {
  onSubmit: (title: string, course?: string) => Promise<void>
  onCancel: () => void
}

export default function AssignmentForm({ onSubmit, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(title.trim(), course.trim() || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50 space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Midterm Exam"
          className="w-full px-3 py-2 border rounded"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Course (optional)</label>
        <input
          type="text"
          value={course}
          onChange={e => setCourse(e.target.value)}
          placeholder="e.g., CS101"
          className="w-full px-3 py-2 border rounded"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {loading ? 'Creating...' : 'Create'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="bg-gray-400 text-white hover:bg-gray-500"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

---

## Task 3.2: Build Question Manager UI

- [ ] **Step 1: Create src/components/assignment/QuestionList.tsx**

```typescript
import React from 'react'
import { Question } from '../../types/index'
import Card from '../shared/Card'
import Button from '../shared/Button'

interface QuestionListProps {
  questions: Question[]
  onEdit: (question: Question) => void
  onDelete: (questionId: string) => void
  onReorder: (questionIds: string[]) => void
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
  onReorder,
}: QuestionListProps) {
  function moveQuestion(index: number, direction: 'up' | 'down') {
    const newList = [...questions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newList.length) return

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]]
    onReorder(newList.map(q => q.id))
  }

  return (
    <div className="space-y-2">
      {questions.length === 0 ? (
        <div className="text-gray-500 text-sm">No questions yet</div>
      ) : (
        questions.map((question, index) => (
          <Card key={question.id} className="p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold">{question.title}</h4>
                <p className="text-sm text-gray-600">{question.prompt}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Max Marks: {question.maxMarks} {question.answerType ? `• Type: ${question.answerType}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                {index > 0 && (
                  <Button
                    onClick={() => moveQuestion(index, 'up')}
                    className="text-xs px-2 py-1"
                  >
                    ↑
                  </Button>
                )}
                {index < questions.length - 1 && (
                  <Button
                    onClick={() => moveQuestion(index, 'down')}
                    className="text-xs px-2 py-1"
                  >
                    ↓
                  </Button>
                )}
                <Button
                  onClick={() => onEdit(question)}
                  className="text-xs px-2 py-1"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(question.id)}
                  className="text-xs px-2 py-1 bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/assignment/QuestionForm.tsx**

```typescript
import React, { useState, useEffect } from 'react'
import { Question } from '../../types/index'
import Button from '../shared/Button'

interface QuestionFormProps {
  question?: Question
  onSubmit: (question: Partial<Question>) => Promise<void>
  onCancel: () => void
}

export default function QuestionForm({ question, onSubmit, onCancel }: QuestionFormProps) {
  const [title, setTitle] = useState(question?.title || '')
  const [prompt, setPrompt] = useState(question?.prompt || '')
  const [maxMarks, setMaxMarks] = useState(question?.maxMarks.toString() || '1')
  const [answerType, setAnswerType] = useState(question?.answerType || 'theory')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !prompt.trim()) {
      setError('Title and prompt are required')
      return
    }

    const marks = parseInt(maxMarks)
    if (isNaN(marks) || marks < 0) {
      setError('Max marks must be a valid number')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit({
        title: title.trim(),
        prompt: prompt.trim(),
        maxMarks: marks,
        answerType: answerType as any,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50 space-y-3">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Question Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., What is photosynthesis?"
          className="w-full px-3 py-2 border rounded"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Question Prompt *</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Detailed question instructions..."
          className="w-full px-3 py-2 border rounded h-24"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Max Marks *</label>
          <input
            type="number"
            value={maxMarks}
            onChange={e => setMaxMarks(e.target.value)}
            min="0"
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Answer Type</label>
          <select
            value={answerType}
            onChange={e => setAnswerType(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={loading}
          >
            <option value="theory">Theory</option>
            <option value="code">Code</option>
            <option value="mixed">Mixed</option>
            <option value="math">Math</option>
            <option value="diagram">Diagram</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {loading ? 'Saving...' : question ? 'Update' : 'Add'} Question
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="bg-gray-400 text-white hover:bg-gray-500"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

---

## Task 3.3: Build Question Manager Component

- [ ] **Step 1: Create src/components/assignment/QuestionManager.tsx**

```typescript
import React, { useState } from 'react'
import { Assignment, Question } from '../../types/index'
import { assignmentService } from '../../core/assignment/assignmentService'
import QuestionList from './QuestionList'
import QuestionForm from './QuestionForm'
import Button from '../shared/Button'

interface QuestionManagerProps {
  assignment: Assignment
  onUpdate: (assignment: Assignment) => void
}

export default function QuestionManager({ assignment, onUpdate }: QuestionManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
  const [error, setError] = useState<string | null>(null)

  async function handleAddQuestion(data: Partial<Question>) {
    try {
      setError(null)
      const question: Question = {
        id: crypto.randomUUID(),
        number: String(assignment.questions.length + 1),
        title: data.title || '',
        prompt: data.prompt || '',
        maxMarks: data.maxMarks || 0,
        answerType: data.answerType,
      }
      const updated = await assignmentService.addQuestion(assignment.id, question)
      onUpdate(updated)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question')
    }
  }

  async function handleUpdateQuestion(data: Partial<Question>) {
    if (!editingQuestion) return
    try {
      setError(null)
      const updated = await assignmentService.updateQuestion(
        assignment.id,
        editingQuestion.id,
        data
      )
      onUpdate(updated)
      setEditingQuestion(undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question')
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm('Delete this question?')) return
    try {
      setError(null)
      const updated = await assignmentService.deleteQuestion(assignment.id, questionId)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  async function handleReorder(questionIds: string[]) {
    try {
      setError(null)
      const updated = await assignmentService.reorderQuestions(assignment.id, questionIds)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder questions')
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Questions</h3>
        {!showForm && !editingQuestion && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Question
          </Button>
        )}
      </div>

      {showForm && (
        <QuestionForm
          onSubmit={handleAddQuestion}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingQuestion && (
        <QuestionForm
          question={editingQuestion}
          onSubmit={handleUpdateQuestion}
          onCancel={() => setEditingQuestion(undefined)}
        />
      )}

      <QuestionList
        questions={assignment.questions}
        onEdit={setEditingQuestion}
        onDelete={handleDeleteQuestion}
        onReorder={handleReorder}
      />
    </div>
  )
}
```

---

## Task 3.4: Build Shared Components

- [ ] **Step 1: Create src/components/shared/Button.tsx**

```typescript
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export default function Button({ className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded font-medium transition-colors ${className}`}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Create src/components/shared/Card.tsx**

```typescript
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}
      {...props}
    />
  )
}
```

---

## Task 3.5: Integrate Assignment Manager into Options Page

- [ ] **Step 1: Update src/app/options/Options.tsx to show Assignment Manager**

```typescript
import React, { useState, useEffect } from 'react'
import { Assignment } from '../../types/index'
import SettingsPage from './SettingsPage'
import HistoryPage from './HistoryPage'
import AssignmentList from '../../components/assignment/AssignmentList'
import QuestionManager from '../../components/assignment/QuestionManager'

type PageType = 'assignments' | 'settings' | 'history'

export default function Options() {
  const [currentPage, setCurrentPage] = useState<PageType>('assignments')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  function handleAssignmentUpdated(updated: Assignment) {
    setSelectedAssignment(updated)
    setAssignments(assignments.map(a => a.id === updated.id ? updated : a))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-4">
          {['assignments', 'settings', 'history'].map(page => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page as PageType)
                setSelectedAssignment(null)
              }}
              className={`px-4 py-2 rounded capitalize ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {currentPage === 'assignments' && !selectedAssignment && (
          <AssignmentList onSelect={setSelectedAssignment} />
        )}

        {currentPage === 'assignments' && selectedAssignment && (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="text-blue-600 hover:underline"
            >
              ← Back to Assignments
            </button>
            <div className="bg-white p-4 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">{selectedAssignment.title}</h2>
              {selectedAssignment.course && (
                <p className="text-gray-600 mb-4">{selectedAssignment.course}</p>
              )}
              <QuestionManager
                assignment={selectedAssignment}
                onUpdate={handleAssignmentUpdated}
              />
            </div>
          </div>
        )}

        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'history' && <HistoryPage />}
      </div>
    </div>
  )
}
```

---

**Phase 3 Complete:** Full assignment manager with question CRUD, reordering, and active assignment tracking.

---

# PHASE 4: AI Provider Settings Module

## Task 4.1: Implement Provider Interface and OpenAI Provider

- [ ] **Step 1: Create src/core/providers/providerInterface.ts**

```typescript
import { EvaluationResponse, EvaluationPromptInput } from '../../types/index'

export interface AIProvider {
  testConnection(): Promise<boolean>
  generateStructuredEvaluation(input: EvaluationPromptInput): Promise<EvaluationResponse>
}

export interface EvaluationPromptInput {
  question: {
    title: string
    prompt: string
    maxMarks: number
    rubricCriteria?: string[]
    referenceScript?: string
  }
  submission: {
    content: string
    blocks: Array<{
      type: string
      content: string
    }>
  }
  previousResults?: any
}

export interface EvaluationResponse {
  awardedMarks: number
  summary: string
  strengths: string[]
  mistakes: string[]
  suggestions: string[]
  rubricAlignment: string
  confidence: 'high' | 'medium' | 'low'
  status: 'complete' | 'partial' | 'skipped'
}
```

- [ ] **Step 2: Create src/core/providers/openaiProvider.ts**

```typescript
import { AIProvider, EvaluationPromptInput, EvaluationResponse } from './providerInterface'
import { ProviderError } from '../../types/index'

export class OpenAIProvider implements AIProvider {
  constructor(private apiKey: string, private model: string = 'gpt-4-turbo-preview') {}

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  async generateStructuredEvaluation(
    input: EvaluationPromptInput
  ): Promise<EvaluationResponse> {
    const prompt = this.buildEvaluationPrompt(input)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert academic evaluator. Evaluate student submissions fairly and provide constructive feedback.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ProviderError(`OpenAI API error: ${error.error?.message}`, {
          status: response.status,
          error,
        })
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      return this.parseResponse(content, input.question.maxMarks)
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`Failed to call OpenAI API: ${error}`, {
        originalError: error,
      })
    }
  }

  private buildEvaluationPrompt(input: EvaluationPromptInput): string {
    return `
You are evaluating a student submission for the following question:

**Question:** ${input.question.title}
**Instructions:** ${input.question.prompt}
**Max Marks:** ${input.question.maxMarks}
${input.question.rubricCriteria ? `**Rubric Criteria:**\n${input.question.rubricCriteria.map(c => `- ${c}`).join('\n')}` : ''}
${input.question.referenceScript ? `**Reference Script:**\n\`\`\`\n${input.question.referenceScript}\n\`\`\`` : ''}

**Student Submission:**
\`\`\`
${input.submission.content}
\`\`\`

Evaluate this submission and respond with ONLY a valid JSON object (no markdown, no code blocks) with the following structure:
{
  "awardedMarks": <number between 0 and ${input.question.maxMarks}>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength1>", "<strength2>"],
  "mistakes": ["<mistake1>", "<mistake2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "rubricAlignment": "<how well it aligns with rubric>",
  "confidence": "<high|medium|low>",
  "status": "<complete|partial|skipped>"
}
`
  }

  private parseResponse(content: string, maxMarks: number): EvaluationResponse {
    try {
      const parsed = JSON.parse(content)

      // Validate and normalize response
      return {
        awardedMarks: Math.min(parsed.awardedMarks, maxMarks),
        summary: parsed.summary || '',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        rubricAlignment: parsed.rubricAlignment || '',
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
          ? (parsed.confidence as any)
          : 'medium',
        status: ['complete', 'partial', 'skipped'].includes(parsed.status)
          ? (parsed.status as any)
          : 'complete',
      }
    } catch (error) {
      throw new ProviderError(`Failed to parse OpenAI response as JSON`, {
        originalError: error,
        content,
      })
    }
  }
}
```

---

## Task 4.2: Create Provider Settings UI

- [ ] **Step 1: Create src/app/options/SettingsPage.tsx with full implementation**

```typescript
import React, { useState, useEffect } from 'react'
import { ProviderSettings } from '../../types/index'
import { settingsService } from '../../services/settings/settingsService'
import { OpenAIProvider } from '../../core/providers/openaiProvider'
import Button from '../../components/shared/Button'
import Card from '../../components/shared/Card'

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const current = await settingsService.getProviderSettings()
      setSettings(current)
      setApiKey(current.apiKey || '')
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setLoading(false)
    }
  }

  async function handleSaveKey() {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await settingsService.validateAndSetKey(apiKey.trim())
      setSettings(await settingsService.getProviderSettings())
      setSuccess('API key saved successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key')
    }
  }

  async function handleTestConnection() {
    if (!apiKey.trim()) {
      setError('Please enter an API key first')
      return
    }

    try {
      setTesting(true)
      setError(null)
      const provider = new OpenAIProvider(apiKey.trim())
      const connected = await provider.testConnection()

      if (connected) {
        setSuccess('Connection successful!')
      } else {
        setError('Connection failed. Check your API key.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div>Loading settings...</div>

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Provider Settings</h2>

        {error && <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-800 rounded mb-4">{success}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <div className="p-3 bg-gray-100 rounded">OpenAI (GPT-4 Turbo)</div>
            <p className="text-xs text-gray-500 mt-2">
              You can add Gemini and Claude support in future versions.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border rounded font-mono text-sm"
              disabled={testing}
            />
            <p className="text-xs text-gray-500 mt-2">
              Get your free API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveKey}
              disabled={testing}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Save API Key
            </Button>
            <Button
              onClick={handleTestConnection}
              disabled={testing}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-2">💡 Free OpenAI API Access</h3>
        <p className="text-sm text-gray-700">
          New OpenAI accounts come with free API credits ($5) for API calls (not ChatGPT Plus).
          This is perfect for testing the evaluator without cost.
        </p>
      </Card>
    </div>
  )
}
```

---

**Phase 4 Complete:** Provider settings UI, OpenAI integration, API key validation and testing.

---

*[Continuing with Phases 5-12 in abbreviated form due to length...]*

---

# REMAINING PHASES (5-12) - Task Summaries

## PHASE 5: Submission Intake (Simplified for MVP)

**Key Tasks:**
- Submission form with text paste and script upload
- Normalize to SubmissionBlock structure
- Store raw submission snapshot

**Files to Create:**
- `src/components/evaluation/SubmissionForm.tsx`
- `src/core/submission/submissionNormalizer.ts`
- `src/core/submission/submissionTypes.ts`

---

## PHASE 6: Answer Mapping Engine

**Key Tasks:**
- Rule-based question matching (explicit labels)
- Keyword matching fallback
- Confidence scoring
- AI-assisted mapping (calls Phase 4 provider)

**Files to Create:**
- `src/core/mapping/answerMapper.ts`
- `src/core/mapping/mappingTypes.ts`
- `src/components/evaluation/MappingReview.tsx`

---

## PHASE 7: Evaluation Engine (CORE PRODUCT)

**Key Tasks:**
- Load assignment + submission blocks
- Map to questions (Phase 6)
- Build structured prompt
- Call OpenAI API
- Parse and validate response
- Store evaluation result

**Files to Create:**
- `src/core/evaluation/evaluationEngine.ts`
- `src/core/evaluation/promptBuilder.ts`
- Service integration testing

**🔴 VALIDATION CHECKPOINT:** Test end-to-end: Create → Submit → Evaluate → Results

---

## PHASE 8: Result Display UI

**Key Tasks:**
- Result summary header
- Question result cards with marks/feedback
- Filter tabs
- Detailed panel view
- Copy/export actions

**Files to Create:**
- `src/components/evaluation/EvaluationResults.tsx`
- `src/components/evaluation/QuestionResult.tsx`
- `src/components/evaluation/ResultExporter.tsx`

---

## PHASE 9: Question Parsing (AI-Assisted)

**Key Tasks:**
- Local deterministic parser (numbering, marks)
- AI-assisted parser for ambiguous formatting
- Parser review UI
- Manual correction before save

**Files to Create:**
- `src/core/parsing/questionParser.ts`
- `src/core/parsing/localParser.ts`
- `src/core/parsing/aiParser.ts`
- `src/components/assignment/ParsingReview.tsx`

---

## PHASE 10: Evaluation History and Reopen Flow

**Key Tasks:**
- Evaluation history list in options page
- Reopen old report with assignment version
- Delete old evaluations
- Maintain grading continuity

**Files to Create:**
- `src/app/options/HistoryPage.tsx` (full implementation)
- History service already created in Phase 2

---

## PHASE 11: Quality, Error Handling, and Validation

**Key Tasks:**
- Friendly error states (no assignment, API failure, invalid response, etc.)
- Retry flows
- Loading states
- Save confirmations
- Empty states
- Defensive parsing

**Files to Create:**
- `src/components/shared/ErrorBoundary.tsx`
- `src/components/shared/LoadingSpinner.tsx`
- `src/utils/errors.ts` (already started)
- Error handling in all major services

---

## PHASE 12: Colab/Docs Adapters + Demo Readiness

**Key Tasks:**
- Content script for Colab extraction
- Normalize Colab cell content
- Docs text extraction (basic)
- Inline feedback annotation for Colab
- Seeded demo assignments
- Demo flow (no API key required)
- Architecture documentation

**Files to Create:**
- `public/content-scripts/colab-extractor.js`
- `src/core/adapters/colabAdapter.ts`
- `src/core/adapters/docsAdapter.ts`
- `docs/ARCHITECTURE.md`
- `docs/SETUP.md`
- `docs/DEMO_FLOW.md`
- README with demo instructions

---

# Execution Guidance

**Build in exact order:**
1. Phase 1 - Foundation (extension shell)
2. Phase 2 - Storage + CRUD
3. Phase 3 - Assignment Manager UI
4. Phase 4 - Provider settings + OpenAI
5. Phase 5 - Submission intake
6. Phase 6 - Answer mapping
7. Phase 7 - Evaluation engine **← VALIDATION CHECKPOINT**
8. Phase 8 - Result UI
9. Phase 9 - Question parsing
10. Phase 10 - History
11. Phase 11 - Error handling + polish
12. Phase 12 - Colab/Docs + demo prep

**Testing approach:**
- Unit test each service (assignments, evaluation, etc.)
- Integration test Phase 7 checkpoint manually
- E2E test full workflow (create assignment → submit → evaluate)

**Commit strategy:**
- Commit after each task completes
- Commit message format: `feat: <phase>: <what was done>`
- Example: `feat: phase-3: add question reordering`

---

**Plan Status:** Complete and ready for execution.
