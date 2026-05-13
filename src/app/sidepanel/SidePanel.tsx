import React, { useEffect, useState } from 'react'
import { EvaluationResult, SubmissionInfo } from '../../types/index'
import { settingsService } from '../../services/settings/settingsService'
import { SubmissionInfoForm } from '../../components/evaluation/SubmissionInfoForm'
import EvaluationResults from '../../components/evaluation/EvaluationResults'
import AssignmentListPage from '../options/AssignmentListPage'
import EvaluationPage from '../options/EvaluationPage'
import HistoryPage from '../options/HistoryPage'
import Button from '../../components/shared/Button'
import { Play, Settings, AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react'

type ViewType = 'evaluate' | 'report' | 'assignments' | 'history'
type PopupState = 'idle' | 'submissionInfo' | 'extracting' | 'mapping' | 'reviewMapping' | 'evaluating' | 'done' | 'error'

interface ExtractedCell {
  index: number
  type: 'text' | 'code' | 'output' | 'unknown'
  text: string
  hasOutput: boolean
  isEmpty: boolean
}

interface QuestionMapping {
  number: string
  title: string
  promptCellIndexes: number[]
  answerCellIndexes: number[]
  hasAnswer: boolean
  reason?: string
  prompt?: string
}

type EvalMode = 'single' | 'adaptive'

const STORAGE_KEY = 'lastEvaluationResult'
const SUBMISSION_INFO_KEY = 'currentSubmissionInfo'

function generatePlainTextFeedback(result: EvaluationResult): string {
  const lines: string[] = []

  lines.push('<p><strong>Examiner Feedback:</strong> Overall performance evaluated.</p>')
  lines.push('<p></p>')

  result.questionResults.forEach(q => {
    lines.push(`<p><strong># Question - ${q.questionNumber}</strong></p>`)
    lines.push(`<p><em>${q.summary || q.questionNumber}</em> → <strong>${q.awardedMarks} / ${q.maxMarks}</strong></p>`)

    if (q.status === 'partial') {
      if (q.mistakes?.[0]) {
        lines.push(`<p><strong>note:</strong> ${q.mistakes[0]}</p>`)
      }
      if (q.suggestions?.[0]) {
        lines.push(`<p>💡 ${q.suggestions[0]}</p>`)
      }
    } else if (q.status === 'skipped') {
      lines.push('<p><strong>note:</strong> not attempted</p>')
    }

    lines.push('<p></p>')
  })

  lines.push('<p><strong>Important Instructions:</strong></p>')
  lines.push('<p>→ Do not post on Facebook, if you have any marks-related issues.</p>')
  lines.push('<p>→ Make sure to read all the requirements carefully, If you have any marks-related confusion.</p>')
  lines.push('<p>→ If you are confident and If there is a mistake from the examiner\'s end, give a recheck request.</p>')
  lines.push('<p>→ If your recheck reason was not valid, 2 marks will be deducted from your current marks.</p>')
  lines.push('<p>→ Please check the documentation below for more information about how to recheck.</p>')
  lines.push('<p><br></p>')
  lines.push('<p style="color:red;"><strong>We have a recheck option, so please refrain from posting to the group.</strong></p>')
  lines.push('<p style="color:green;"><em>If your recheck reason is valid you will get marks, if not valid 2 marks will be deducted.</em></p>')

  return lines.join('')
}

function parseStoredResult(value: unknown): EvaluationResult | null {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value) as EvaluationResult
  } catch (error) {
    console.error('[SidePanel] Failed to parse stored result:', error)
    return null
  }
}

function parseStoredSubmissionInfo(value: unknown): SubmissionInfo | null {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value) as SubmissionInfo
  } catch (error) {
    console.error('[SidePanel] Failed to parse stored submission info:', error)
    return null
  }
}

type CellAssignment = { qNum: string; role: 'prompt' | 'answer' }

// Cell-to-question mapping review. Two views:
//  - Questions view: segmenter output, per-Q expand
//  - Cells view: every cell, user assigns Q + role manually
const ReviewMappingPanel: React.FC<{
  cells: ExtractedCell[]
  mappings: QuestionMapping[]
  submissionInfo: SubmissionInfo | null
  evalMode: EvalMode
  onEvalModeChange: (m: EvalMode) => void
  onConfirm: () => void
  onCancel: () => void
  onChange: (idx: number, patch: Partial<QuestionMapping>) => void
  onReplaceAll: (mappings: QuestionMapping[]) => void
}> = ({ cells, mappings, submissionInfo, evalMode, onEvalModeChange, onConfirm, onCancel, onReplaceAll }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [view, setView] = useState<'questions' | 'cells'>('questions')
  const [cellAssignments, setCellAssignments] = useState<Record<number, CellAssignment | undefined>>({})

  // Initialize cell assignments from current mappings (only first time per mappings change)
  useEffect(() => {
    const init: Record<number, CellAssignment> = {}
    mappings.forEach(m => {
      m.promptCellIndexes.forEach(i => { init[i] = { qNum: m.number, role: 'prompt' } })
      m.answerCellIndexes.forEach(i => { init[i] = { qNum: m.number, role: 'answer' } })
    })
    setCellAssignments(init)
  }, [mappings])

  const cellByIdx = new Map(cells.map(c => [c.index, c]))
  const skippedCount = mappings.filter(m => !m.hasAnswer).length
  const questionNumbers = mappings.map(m => m.number)

  function setCellAssignment(cellIdx: number, value: CellAssignment | undefined) {
    setCellAssignments(prev => ({ ...prev, [cellIdx]: value }))
  }

  function applyManualMapping() {
    // Rebuild mappings from cellAssignments. Preserve existing question titles.
    const next = mappings.map(m => ({
      ...m,
      promptCellIndexes: [] as number[],
      answerCellIndexes: [] as number[],
      hasAnswer: false,
      reason: undefined as string | undefined,
    }))
    const byNum = new Map(next.map(m => [m.number, m]))
    for (const [keyStr, assignment] of Object.entries(cellAssignments)) {
      if (!assignment) continue
      const ci = parseInt(keyStr, 10)
      const target = byNum.get(assignment.qNum)
      if (!target) continue
      if (assignment.role === 'prompt') target.promptCellIndexes.push(ci)
      else {
        target.answerCellIndexes.push(ci)
        target.hasAnswer = true
      }
    }
    // Sort indexes ascending
    next.forEach(m => {
      m.promptCellIndexes.sort((a, b) => a - b)
      m.answerCellIndexes.sort((a, b) => a - b)
    })
    onReplaceAll(next)
    setView('questions')
  }

  return (
    <div className="p-3 space-y-3">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-purple-900 mb-1">📋 Review Cell Mapping (Layer 1)</p>
        <p className="text-xs text-purple-700">
          Segmenter mapped {mappings.length} questions across {cells.length} cells.
          {skippedCount > 0 && (
            <span className="block mt-1 text-amber-700 font-medium">
              ⚠️ {skippedCount} question{skippedCount > 1 ? 's' : ''} have no answer cell — will be marked skipped (0 marks).
            </span>
          )}
        </p>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
        <button
          onClick={() => setView('questions')}
          className={`flex-1 text-xs font-medium px-3 py-1.5 rounded transition ${
            view === 'questions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          By Question
        </button>
        <button
          onClick={() => setView('cells')}
          className={`flex-1 text-xs font-medium px-3 py-1.5 rounded transition ${
            view === 'cells' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          By Cell (manual)
        </button>
      </div>

      {view === 'cells' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-xs text-blue-800">
              Assign each cell to a question. Choose role: <strong>prompt</strong> (question text) or <strong>answer</strong> (student's code). Skip = ignore.
            </p>
          </div>
          <div className="space-y-2">
            {cells.map(c => {
              const a = cellAssignments[c.index]
              return (
                <div key={c.index} className="border border-slate-200 rounded-lg bg-white p-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-700">#{c.index}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      c.type === 'code' ? 'bg-blue-100 text-blue-800'
                        : c.type === 'text' ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>{c.type}</span>
                    {c.isEmpty && <span className="text-[10px] text-amber-700">(empty)</span>}
                    {c.hasOutput && <span className="text-[10px] text-emerald-700">(output)</span>}
                    <span className="text-[10px] text-slate-400 ml-auto">{c.text.length} chars</span>
                  </div>
                  <pre className="text-[11px] bg-slate-50 border border-slate-200 rounded p-1.5 whitespace-pre-wrap break-words max-h-24 overflow-y-auto font-mono mb-2">
                    {c.text.slice(0, 300) || '(empty)'}
                  </pre>
                  <div className="flex gap-1">
                    <select
                      value={a?.qNum || ''}
                      onChange={e => {
                        const qNum = e.target.value
                        if (!qNum) setCellAssignment(c.index, undefined)
                        else setCellAssignment(c.index, { qNum, role: a?.role || 'answer' })
                      }}
                      className="flex-1 text-xs border border-slate-300 rounded px-1 py-1"
                    >
                      <option value="">— Skip —</option>
                      {questionNumbers.map(n => <option key={n} value={n}>Q{n}</option>)}
                    </select>
                    <select
                      value={a?.role || 'answer'}
                      disabled={!a}
                      onChange={e => {
                        if (!a) return
                        setCellAssignment(c.index, { qNum: a.qNum, role: e.target.value as 'prompt' | 'answer' })
                      }}
                      className="text-xs border border-slate-300 rounded px-1 py-1 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="prompt">Prompt</option>
                      <option value="answer">Answer</option>
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2 sticky bottom-0 bg-slate-50 pt-2">
            <Button onClick={() => setView('questions')} variant="secondary" className="flex-1">Cancel Edit</Button>
            <Button onClick={applyManualMapping} variant="primary" className="flex-1">
              Save Mapping
            </Button>
          </div>
        </>
      )}

      {view === 'questions' && (
      <div className="space-y-2">
        {mappings.map((m, idx) => (
          <div
            key={`${m.number}-${idx}`}
            className={`border rounded-lg overflow-hidden ${
              m.hasAnswer ? 'border-slate-200 bg-white' : 'border-amber-300 bg-amber-50'
            }`}
          >
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Q{m.number} {m.hasAnswer ? '✓' : '⚠️'}
                </p>
                <p className="text-xs text-slate-600 truncate">{m.title}</p>
              </div>
              <div className="text-xs text-slate-500 ml-2 flex-shrink-0">
                {m.hasAnswer ? `cells: ${m.answerCellIndexes.join(',')}` : 'NO ANSWER'}
              </div>
            </button>

            {expandedIdx === idx && (
              <div className="border-t border-slate-200 p-3 space-y-2 bg-slate-50">
                {m.promptCellIndexes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">📝 Prompt cells: {m.promptCellIndexes.join(', ')}</p>
                    {m.promptCellIndexes.map(ci => {
                      const c = cellByIdx.get(ci)
                      if (!c) return null
                      return (
                        <pre key={ci} className="text-xs bg-white border border-slate-200 rounded p-2 whitespace-pre-wrap break-words max-h-32 overflow-y-auto mb-1">
                          [Cell {ci} • {c.type}]{'\n'}{c.text.slice(0, 400)}
                        </pre>
                      )
                    })}
                  </div>
                )}

                {m.answerCellIndexes.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">💻 Answer cells: {m.answerCellIndexes.join(', ')}</p>
                    {m.answerCellIndexes.map(ci => {
                      const c = cellByIdx.get(ci)
                      if (!c) return null
                      return (
                        <pre key={ci} className="text-xs bg-white border border-slate-200 rounded p-2 whitespace-pre-wrap break-words max-h-40 overflow-y-auto mb-1 font-mono">
                          [Cell {ci} • {c.type}{c.hasOutput ? ' • has output' : ''}]{'\n'}{c.text.slice(0, 800)}
                        </pre>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-amber-800">{m.reason || 'Segmenter could not find an answer cell.'}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {view === 'questions' && (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-700 mb-2">Evaluation mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onEvalModeChange('single')}
                className={`text-left px-3 py-2 rounded border text-xs transition ${
                  evalMode === 'single'
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">Single batch</div>
                <div className="text-[10px] mt-0.5 opacity-80">1 API call. Fast on small notebooks. Risk: token limit / quality dip on big ones.</div>
              </button>
              <button
                onClick={() => onEvalModeChange('adaptive')}
                className={`text-left px-3 py-2 rounded border text-xs transition ${
                  evalMode === 'adaptive'
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="font-semibold">Adaptive (recommended)</div>
                <div className="text-[10px] mt-0.5 opacity-80">Pack into batches ≤6k tokens. Parallel. Fastest + safest.</div>
              </button>
            </div>
          </div>

          <div className="flex gap-2 sticky bottom-0 bg-slate-50 pt-2">
            <Button onClick={onCancel} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={onConfirm} variant="primary" className="flex-1">
              Confirm & Evaluate ({mappings.filter(m => m.hasAnswer).length} questions)
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Tab navigation component
const TabNav: React.FC<{
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  hasResult: boolean
}> = ({ currentView, onViewChange, hasResult }) => {
  const tabs: Array<{ id: ViewType; label: string; icon: string }> = [
    { id: 'evaluate', label: 'Evaluate', icon: '⚡' },
    { id: 'report', label: 'Report', icon: '📊' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'history', label: 'History', icon: '📜' },
  ]

  return (
    <div className="flex gap-1 border-b border-slate-200 bg-white px-2 py-1 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onViewChange(tab.id)}
          disabled={tab.id === 'report' && !hasResult}
          className={`px-2 py-2 text-xs font-medium whitespace-nowrap rounded-t transition ${
            currentView === tab.id
              ? 'bg-blue-600 text-white'
              : tab.id === 'report' && !hasResult
                ? 'text-slate-400 cursor-not-allowed opacity-50'
                : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={tab.label}
        >
          <span className="mr-1">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="ml-auto px-2 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition"
        title="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  )
}

export default function SidePanel() {
  const [currentView, setCurrentView] = useState<ViewType>('evaluate')
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null)
  const [state, setState] = useState<PopupState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState('')
  const [cells, setCells] = useState<ExtractedCell[]>([])
  const [mappings, setMappings] = useState<QuestionMapping[]>([])
  const [notebookTitle, setNotebookTitle] = useState<string>('')
  const [evalMode, setEvalMode] = useState<EvalMode>('adaptive')

  const handleSubmissionInfoCapture = (info: SubmissionInfo) => {
    chrome.storage.local.set({ currentSubmissionInfo: JSON.stringify(info) }, () => {
      setSubmissionInfo(info)
      setState('idle')
    })
  }

  const clearSubmissionInfo = () => {
    chrome.storage.local.remove(SUBMISSION_INFO_KEY)
    setSubmissionInfo(null)
    setState('idle')
  }

  const clearResult = () => {
    chrome.storage.local.remove(STORAGE_KEY)
    setResult(null)
    setState('idle')
  }

  // Load stored data on mount and listen for changes + messages
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY, SUBMISSION_INFO_KEY], data => {
      setResult(parseStoredResult(data[STORAGE_KEY]))
      setSubmissionInfo(parseStoredSubmissionInfo(data[SUBMISSION_INFO_KEY]))
    })

    // Listen for messages from content script
    const handleMessage = (
      request: any,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      try {
        if (request.action === 'submissionInfoCaptured') {
          console.log('[SidePanel] Received submission info from modal:', request.data)
          // Auto-proceed: skip confirmation card, go straight to eval
          handleSubmissionInfoCapture(request.data)
          // Clear old results when new submission captured
          chrome.storage.local.remove(STORAGE_KEY)
          setResult(null)
          setState('idle')
          setCurrentView('evaluate')
          sendResponse({ success: true })
        }
      } catch (error) {
        console.error('[SidePanel] Error handling message:', error)
        sendResponse({ success: false })
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== 'local') return

      if (changes[STORAGE_KEY]) {
        const newResult = parseStoredResult(changes[STORAGE_KEY].newValue)
        setResult(newResult)
        // Auto-switch to report when evaluation completes
        if (newResult && state === 'evaluating') {
          setCurrentView('report')
          setState('done')
        }
      }

      if (changes[SUBMISSION_INFO_KEY]) {
        setSubmissionInfo(parseStoredSubmissionInfo(changes[SUBMISSION_INFO_KEY].newValue))
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [state])

  async function handleEvaluate() {
    setState('extracting')
    setError(null)
    setProgress('Extracting notebook cells...')

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) throw new Error('No active tab found')

      const extractionResult = await new Promise<any>((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id!, { action: 'extractContent' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error('Content script not loaded. Refresh the page and try again.'))
            return
          }
          resolve(response)
        })
      })

      if (!extractionResult?.success) {
        throw new Error(extractionResult?.error || 'Failed to extract content')
      }

      const extractedCells: ExtractedCell[] = extractionResult.content.cells || []
      const title = extractionResult.content.title
      setNotebookTitle(title)
      setCells(extractedCells)

      if (extractedCells.length === 0) {
        throw new Error('No cells extracted from notebook. Ensure you are on a Colab tab.')
      }

      // Layer 1: Segmenter
      setState('mapping')
      setProgress(`Mapping ${extractedCells.length} cells to questions...`)

      const settings = await settingsService.getProviderSettings()
      if (!settings.apiKey) {
        throw new Error('OpenAI API key not set. Click Settings to configure it.')
      }

      const segmenterModel = 'gpt-4o-mini'
      const detectedMappings = await segmentNotebook(
        extractedCells,
        submissionInfo,
        settings.apiKey,
        segmenterModel
      )

      console.group('%c[SidePanel] Segmenter Result', 'background: #6610f2; color: white; padding: 2px 8px; border-radius: 3px;')
      console.table(detectedMappings.map(m => ({
        Q: m.number,
        title: m.title.slice(0, 40),
        promptCells: m.promptCellIndexes.join(','),
        answerCells: m.answerCellIndexes.join(','),
        hasAnswer: m.hasAnswer,
      })))
      console.groupEnd()

      setMappings(detectedMappings)
      setState('reviewMapping')
    } catch (err: any) {
      setError(err.message || 'Extraction or mapping failed')
      setState('error')
    }
  }

  async function handleConfirmMapping() {
    setState('evaluating')
    setError(null)
    setProgress(`Evaluating ${mappings.length} questions...`)

    try {
      const settings = await settingsService.getProviderSettings()
      if (!settings.apiKey) throw new Error('OpenAI API key not set.')

      const evaluatorSettings = settings.evaluatorSettings || {
        strictness: 'balanced' as const,
        detectAI: true,
        feedbackFormat: 'html' as const,
      }

      const evalResult = await evaluateBatched(
        cells,
        mappings,
        notebookTitle,
        settings.apiKey,
        settings.model || 'gpt-4o-mini',
        evaluatorSettings.strictness,
        evaluatorSettings.detectAI,
        submissionInfo,
        evalMode,
        (done, total) => setProgress(`Evaluated ${done}/${total} questions...`)
      )

      await chrome.storage.local.set({ lastEvaluationResult: JSON.stringify(evalResult) })
      setResult(evalResult)
      setCurrentView('report')
      setState('done')
    } catch (err: any) {
      setError(err.message || 'Evaluation failed')
      setState('error')
    }
  }

  function handleCancelMapping() {
    setMappings([])
    setCells([])
    setState('idle')
  }

  function updateMapping(idx: number, patch: Partial<QuestionMapping>) {
    setMappings(prev => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)))
  }

  // ===== RENDER LOGIC =====
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Tab Navigation */}
      <TabNav currentView={currentView} onViewChange={setCurrentView} hasResult={!!result} />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* EVALUATE VIEW */}
        {currentView === 'evaluate' && (
          <div className="p-3 md:p-4">
            {state === 'idle' && (
              <div className="space-y-3">

                {/* Show form if no submission confirmed */}
                {!submissionInfo && (
                  <SubmissionInfoForm
                    onSubmit={handleSubmissionInfoCapture}
                  />
                )}

                {/* Show evaluation button once submission info is confirmed */}
                {submissionInfo && (
                  <div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                      <div className="text-xs text-emerald-700 mb-2">
                        <strong>✓ Ready to Evaluate:</strong>
                      </div>
                      <div className="space-y-1 text-xs text-emerald-600 mb-2">
                        <p>👤 <strong>{submissionInfo.studentName}</strong></p>
                        <p>📝 {submissionInfo.assignmentName}</p>
                        {submissionInfo.submissionDate && <p>📅 {submissionInfo.submissionDate}</p>}
                        {submissionInfo.email && <p>✉️ {submissionInfo.email}</p>}
                      </div>
                      <Button
                        onClick={clearSubmissionInfo}
                        className="w-full text-xs"
                        variant="secondary"
                      >
                        Change Submission Info
                      </Button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h2 className="font-semibold text-slate-900 text-sm mb-3">Ready to Evaluate</h2>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                        <p className="text-xs text-blue-900">
                          <strong>📋 Verifying:</strong> Evaluating for <strong>{submissionInfo.studentName}</strong>
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 mb-4">
                        Go to the Colab notebook and click the button below to extract and evaluate it.
                      </p>
                      <Button
                        onClick={handleEvaluate}
                        className="w-full"
                        variant="primary"
                        icon={<Play size={18} />}
                      >
                        Extract & Evaluate for {submissionInfo.studentName}
                      </Button>
                    </div>

                    {result && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 text-sm mb-2">✓ Previous Result Available</h3>
                        <Button
                          onClick={() => setCurrentView('report')}
                          className="w-full text-sm"
                          variant="secondary"
                        >
                          View Report
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(state === 'extracting' || state === 'mapping' || state === 'evaluating') && (
              <div className="p-4 space-y-4">
                {submissionInfo && (
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-2"><strong>{state === 'mapping' ? 'Mapping cells…' : state === 'evaluating' ? 'Evaluating…' : 'Extracting…'}</strong></p>
                    <div className="space-y-1 text-xs text-slate-700">
                      <p>👤 <strong>{submissionInfo.studentName}</strong></p>
                      <p>📝 {submissionInfo.assignmentName}</p>
                      {submissionInfo.submissionDate && <p>📅 {submissionInfo.submissionDate}</p>}
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 size={32} className="text-blue-600 animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-700 text-center">{progress}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {state === 'mapping' ? 'Layer 1: Segmenter (cheap model)' : state === 'evaluating' ? 'Layer 2: Per-question evaluator' : 'Reading Colab DOM…'}
                  </p>
                </div>
              </div>
            )}

            {state === 'reviewMapping' && (
              <ReviewMappingPanel
                cells={cells}
                mappings={mappings}
                evalMode={evalMode}
                onEvalModeChange={setEvalMode}
                onConfirm={handleConfirmMapping}
                onCancel={handleCancelMapping}
                onChange={updateMapping}
                onReplaceAll={setMappings}
              />
            )}

            {state === 'error' && (
              <div className="p-4">
                <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Evaluation Failed</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <Button onClick={handleEvaluate} className="w-full" variant="primary">
                  Try Again
                </Button>
              </div>
            )}

            {state === 'done' && result && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900">Done!</h2>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Switched to Report. Scroll down to see full details or click Report tab.
                </p>
                <Button onClick={handleEvaluate} className="w-full" variant="secondary">
                  Evaluate Another
                </Button>
              </div>
            )}
          </div>
        )}

        {/* REPORT VIEW */}
        {currentView === 'report' && result && (
          <>
            {submissionInfo &&
              result.submissionInfo &&
              (result.submissionInfo.email?.toLowerCase().trim() !==
                submissionInfo.email?.toLowerCase().trim() ||
                result.submissionInfo.assignmentName?.toLowerCase().trim() !==
                  submissionInfo.assignmentName?.toLowerCase().trim()) && (
                <div className="m-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                  <p className="text-xs font-semibold text-amber-900 mb-2">
                    ⚠️ Mismatch: Report does not match current capture
                  </p>
                  <div className="text-xs text-amber-800 space-y-1">
                    <p><strong>Report for:</strong> {result.submissionInfo.studentName} ({result.submissionInfo.assignmentName})</p>
                    <p><strong>Current capture:</strong> {submissionInfo.studentName} ({submissionInfo.assignmentName})</p>
                  </div>
                  <Button
                    onClick={clearResult}
                    className="w-full mt-2 text-xs"
                    variant="secondary"
                  >
                    Clear Old Report
                  </Button>
                </div>
              )}
            <EvaluationResults result={result} onBack={clearResult} compact />
          </>
        )}

        {currentView === 'report' && !result && (
          <div className="p-4 text-center py-12">
            <p className="text-sm text-slate-500">No report available. Run an evaluation first.</p>
          </div>
        )}

        {/* ASSIGNMENTS VIEW */}
        {currentView === 'assignments' && <AssignmentListPage />}

        {/* HISTORY VIEW */}
        {currentView === 'history' && <HistoryPage />}
      </div>
    </div>
  )
}

// ===== TWO-LAYER PIPELINE =====
// Layer 1: Segmenter — maps cells to questions (cheap model)
// Layer 2: Per-question evaluator (full model)

async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string,
  temperature = 0.3,
  maxTokens = 4000
): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error: ${response.statusText}`)
  }
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty response from OpenAI')
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in OpenAI response')
  return JSON.parse(match[0])
}

/**
 * Build the canonical list of question numbers we expect to evaluate.
 * Modal data wins. Otherwise scan TEXT cells (not code) for numbered question
 * patterns. Apply density check: only fill 1..max if numbering looks dense.
 */
function detectExpectedQuestions(
  cells: ExtractedCell[],
  modalQs: { number: string; maxMarks: number }[] | undefined
): string[] {
  if (modalQs && modalQs.length > 0) {
    return modalQs
      .map(q => String(q.number).replace(/^0+/, ''))
      .filter(Boolean)
      .sort((a, b) => parseInt(a) - parseInt(b))
  }

  const seen = new Set<number>()
  // Strong patterns: heading-like prefixes typical of question prompts.
  // Skip bare numbers (matches list items) and skip code cells (variable names).
  const headingPatterns = [
    /(?:^|\n)\s*Question[\s\-:#]?\s*(\d+)/gi,
    /(?:^|\n)\s*qs\s*[-:#]?\s*(\d+)/gi,
    /(?:^|\n)\s*#+\s*(?:Question|Q|qs)[\s\-:]?\s*(\d+)/gi,
    // Bare "Q1", "Q-1", "Q.1", "Q 1" at line start — common Colab heading format
    /(?:^|\n)\s*Q[\s\-.:]?(\d+)\b/g,
  ]

  for (const c of cells) {
    // Skip code cells — variable names like Q1 cause false positives
    if (c.type === 'code') continue
    for (const re of headingPatterns) {
      const matches = c.text.matchAll(re)
      for (const m of matches) {
        const n = parseInt(m[1])
        if (!isNaN(n) && n > 0 && n < 100) seen.add(n)
      }
    }
  }

  if (seen.size === 0) return []

  const sortedSeen = Array.from(seen).sort((a, b) => a - b)
  const max = sortedSeen[sortedSeen.length - 1]
  const density = sortedSeen.length / max // 1.0 = perfectly dense

  // Density >= 0.7 → fill 1..max so gaps surface as missing.
  // Density < 0.7 → return only what we saw (sparse, fill would invent phantoms).
  if (density >= 0.7) {
    console.log(`[detectExpectedQuestions] dense (${density.toFixed(2)}), filling 1..${max}`)
    return Array.from({ length: max }, (_, i) => String(i + 1))
  }
  console.log(`[detectExpectedQuestions] sparse (${density.toFixed(2)}), returning seen only: ${sortedSeen.join(',')}`)
  return sortedSeen.map(String)
}

async function segmentNotebook(
  cells: ExtractedCell[],
  submissionInfo: SubmissionInfo | null,
  apiKey: string,
  model: string
): Promise<QuestionMapping[]> {
  const cellSummary = cells.map(c => ({
    idx: c.index,
    type: c.type,
    isEmpty: c.isEmpty,
    text: (c.text || '').slice(0, 600),
  }))

  const modalQs = submissionInfo?.questionsFromModal || []
  const expectedNumbers = detectExpectedQuestions(cells, modalQs)
  const expectedList = expectedNumbers.length > 0 ? `[${expectedNumbers.join(', ')}]` : '[detect from cells]'

  // Build per-question rubric hint when modal supplied marks
  const modalMarksHint = modalQs.length > 0
    ? `Authoritative question list (from Phitron modal):\n${modalQs.map(q => `  - Q${q.number}: ${q.maxMarks} marks`).join('\n')}`
    : ''

  const prompt = `You are a Colab notebook segmenter. Your ONLY job: map cells to questions. Do NOT grade.

EXPECTED QUESTIONS (you MUST return one entry per number, in order): ${expectedList}

${modalMarksHint}

Cells (in order):
${JSON.stringify(cellSummary, null, 2)}

Return JSON with this shape:
{
  "questions": [
    {
      "number": "1",
      "title": "short title from question prompt",
      "promptCellIndexes": [<idx>],
      "answerCellIndexes": [<idx>, <idx>],
      "hasAnswer": true,
      "reason": "why you mapped these cells (esp. if hasAnswer=false)"
    }
  ]
}

Notebook layouts you may see:
  Layout A: each question has its own text cell ("Question 1: ...") then code answer cell.
  Layout B: ALL prompts live in one big instruction cell (numbered list), and student
            uses bare label cells like "Q1", "Q2" as section markers, with code answers below.
  Layout C: just code cells with no labels — match by cell order to expected number.

Rules (strict):
- You MUST return one entry for EVERY expected question number listed above. NEVER OMIT a number.
- For each expected number:
    * If you find a label cell ("Q1" or "Question 1") and code cells follow → answerCellIndexes = those code cells; hasAnswer=true
    * If only the master instruction cell has the prompt and the next code cell after the matching label is the answer → still hasAnswer=true
    * If the answer cell is empty / "Double-click (or enter) to edit" / placeholder → hasAnswer=false, answerCellIndexes=[]
    * If no label, no answer cell → hasAnswer=false, reason="Question not found in notebook"
- promptCellIndexes = text/markdown cells that label or describe the question (the master instruction cell counts for all questions)
- answerCellIndexes = code cells under that question's label
- Do NOT invent cells. Only use indexes that exist.
- Order questions by their number ascending.`

  console.group('%c[Segmenter] Prompt', 'background: #6610f2; color: white; padding: 2px 8px; border-radius: 3px;')
  console.log('Cells given:', cells.length)
  console.log('Expected question numbers:', expectedNumbers.join(', ') || '(none — segmenter will detect)')
  console.log('Modal marks supplied:', modalQs.length)
  ;(window as any).__phitronSegmenterPrompt = prompt
  console.groupEnd()

  const parsed = await callOpenAI(apiKey, model, prompt, 0.2, 3000)
  const list: any[] = parsed.questions || []
  let mappings: QuestionMapping[] = list.map((q: any) => ({
    number: String(q.number || '').replace(/^0+/, ''),
    title: String(q.title || `Question ${q.number}`),
    promptCellIndexes: Array.isArray(q.promptCellIndexes) ? q.promptCellIndexes : [],
    answerCellIndexes: Array.isArray(q.answerCellIndexes) ? q.answerCellIndexes : [],
    hasAnswer: !!q.hasAnswer && (q.answerCellIndexes?.length || 0) > 0,
    reason: q.reason,
  }))

  // Post-validation: ensure every expected question is present. Fill synthetic for missing.
  if (expectedNumbers.length > 0) {
    const returnedSet = new Set(mappings.map(m => m.number))
    const missing = expectedNumbers.filter(n => !returnedSet.has(n))
    if (missing.length > 0) {
      console.warn(`[Segmenter] Missing from AI output, adding synthetic: ${missing.join(', ')}`)
      missing.forEach(n => {
        const modalQ = modalQs.find(mq => String(mq.number) === String(n))
        mappings.push({
          number: n,
          title: modalQ?.prompt?.slice(0, 80) || '(missing — segmenter omitted)',
          promptCellIndexes: [],
          answerCellIndexes: [],
          hasAnswer: false,
          reason: 'Segmenter did not return this question',
          prompt: modalQ?.prompt,
        })
      })
    }
    // Sort by numeric value
    mappings.sort((a, b) => parseInt(a.number) - parseInt(b.number))
  }

  return mappings
}

async function evaluatePerQuestion(
  cells: ExtractedCell[],
  mappings: QuestionMapping[],
  title: string,
  apiKey: string,
  model: string,
  strictness: 'lenient' | 'balanced' | 'strict',
  detectAI: boolean,
  submissionInfo: SubmissionInfo | null,
  onProgress?: (done: number, total: number) => void
): Promise<EvaluationResult> {
  const strictnessInstructions = {
    lenient: 'Generous: award marks for effort and partial understanding.',
    balanced: 'Fair academic standards: full for correct, partial for incomplete-but-correct, none for wrong.',
    strict: 'Rigorous: deduct for inaccuracies, incomplete explanations, missing edge cases.',
  }

  const cellByIdx = new Map(cells.map(c => [c.index, c]))
  const modalMarksMap = new Map(
    (submissionInfo?.questionsFromModal || []).map(m => [String(m.number).replace(/^0+/, ''), m.maxMarks])
  )

  const questionResults: any[] = []

  for (let i = 0; i < mappings.length; i++) {
    const m = mappings[i]
    const officialMax = modalMarksMap.get(String(m.number).replace(/^0+/, ''))

    if (!m.hasAnswer || m.answerCellIndexes.length === 0) {
      questionResults.push({
        questionId: `q-${m.number}`,
        questionNumber: m.number,
        awardedMarks: 0,
        maxMarks: officialMax ?? 0,
        summary: m.reason || 'No answer cell found / empty cell',
        strengths: [],
        mistakes: ['Question not attempted'],
        suggestions: ['Provide an answer for this question'],
        rubricAlignment: 'N/A — no answer',
        aiCopyPercentage: 0,
        confidence: 'high',
        status: 'skipped',
      })
      onProgress?.(i + 1, mappings.length)
      continue
    }

    const promptText = m.promptCellIndexes.map(i => cellByIdx.get(i)?.text || '').join('\n\n').slice(0, 3000)
    const answerText = m.answerCellIndexes.map(i => {
      const c = cellByIdx.get(i)
      return c ? `[Cell ${c.index} • ${c.type}${c.hasOutput ? ' • has output' : ''}]\n${c.text}` : ''
    }).join('\n\n').slice(0, 8000)

    const aiDetect = detectAI
      ? 'Set aiCopyPercentage 0-100 based on signs of AI generation.'
      : 'Set aiCopyPercentage to 0.'

    const prompt = `You are an expert academic evaluator. Grade ONE question.

Question ${m.number}: ${m.title}
${officialMax ? `Max marks: ${officialMax}` : 'Max marks: infer from prompt or default to 10'}

PROMPT:
${promptText}

STUDENT ANSWER (cells ${m.answerCellIndexes.join(', ')}):
${answerText}

Strictness: ${strictness.toUpperCase()}
${strictnessInstructions[strictness]}

${aiDetect}

🚫 Verify code does what's claimed. Do NOT invent strengths. If output absent or wrong, deduct.

Return JSON:
{
  "maxMarks": ${officialMax ?? 10},
  "awardedMarks": <number>,
  "status": "complete" | "partial" | "skipped",
  "summary": "<one line>",
  "strengths": ["..."],
  "mistakes": ["..."],
  "suggestions": ["..."],
  "rubricAlignment": "<one line>",
  "aiCopyPercentage": <0-100>,
  "confidence": "low" | "medium" | "high"
}`

    try {
      const parsed = await callOpenAI(apiKey, model, prompt, 0.5, 1500)
      const maxMarks = officialMax ?? Number(parsed.maxMarks) ?? 10
      const awarded = Math.min(maxMarks, Math.max(0, Number(parsed.awardedMarks) || 0))
      questionResults.push({
        questionId: `q-${m.number}`,
        questionNumber: m.number,
        awardedMarks: awarded,
        maxMarks,
        summary: parsed.summary || '',
        strengths: parsed.strengths || [],
        mistakes: parsed.mistakes || [],
        suggestions: parsed.suggestions || [],
        rubricAlignment: parsed.rubricAlignment || '',
        aiCopyPercentage: parsed.aiCopyPercentage ?? 0,
        confidence: parsed.confidence || 'medium',
        status: parsed.status || (awarded === maxMarks ? 'complete' : awarded > 0 ? 'partial' : 'skipped'),
      })
    } catch (err: any) {
      console.error(`[Evaluator] Q${m.number} failed:`, err)
      questionResults.push({
        questionId: `q-${m.number}`,
        questionNumber: m.number,
        awardedMarks: 0,
        maxMarks: officialMax ?? 0,
        summary: `Evaluator error: ${err.message}`,
        strengths: [],
        mistakes: ['Evaluation failed'],
        suggestions: [],
        rubricAlignment: '',
        aiCopyPercentage: 0,
        confidence: 'low',
        status: 'skipped',
      })
    }
    onProgress?.(i + 1, mappings.length)
  }

  const maxScore = questionResults.reduce((s, q) => s + q.maxMarks, 0)
  const totalScore = questionResults.reduce((s, q) => s + q.awardedMarks, 0)

  return {
    id: `eval-${Date.now()}`,
    assignmentId: 'default',
    assignmentVersion: 1,
    submissionId: `sub-${Date.now()}`,
    submissionName: title,
    strictness,
    totalScore,
    maxScore,
    generatedAt: new Date().toISOString(),
    questionResults,
    submissionInfo: submissionInfo ?? undefined,
  }
}

// ===== BATCHED EVALUATOR =====
// Modes:
//  - 'single':   all answered Qs in one prompt, one API call
//  - 'adaptive': pack into batches under MAX_BATCH_TOKENS, all batches parallel
// Skipped Qs (no answer) never hit AI — pre-filled with zero result.

const MAX_BATCH_TOKENS = 6000 // ~24k chars input safety budget per batch
const estimateTokens = (text: string) => Math.ceil(text.length / 4)

function buildQuestionBlock(
  m: QuestionMapping,
  cellByIdx: Map<number, ExtractedCell>,
  officialMax: number | undefined,
  modalPrompt: string | undefined
): string {
  // Modal prompt is the canonical question text from Phitron (authoritative).
  // Notebook prompt cells are secondary — student-written labels often just say "# Q1".
  const notebookPromptText = m.promptCellIndexes.map(i => cellByIdx.get(i)?.text || '').join('\n').trim()
  const promptSection = modalPrompt
    ? `PROMPT (from Phitron modal — authoritative):\n${modalPrompt}${
        notebookPromptText && notebookPromptText !== modalPrompt
          ? `\n\nNotebook label/context (secondary):\n${notebookPromptText.slice(0, 800)}`
          : ''
      }`
    : `PROMPT (from notebook — modal not available):\n${notebookPromptText.slice(0, 3000) || '(no prompt cells found)'}`

  const answerText = m.answerCellIndexes
    .map(i => {
      const c = cellByIdx.get(i)
      return c ? `[Cell ${c.index} • ${c.type}${c.hasOutput ? ' • has output' : ''}]\n${c.text}` : ''
    })
    .join('\n\n')
    .slice(0, 8000)
  return `### Question ${m.number}: ${m.title}
MaxMarks: ${officialMax ?? 10}
${promptSection}

STUDENT ANSWER (cells ${m.answerCellIndexes.join(', ')}):
${answerText}
`
}

function packBatches(
  blocks: { id: string; text: string }[],
  maxTokens: number
): { id: string; text: string }[][] {
  const batches: { id: string; text: string }[][] = []
  let current: { id: string; text: string }[] = []
  let currentTokens = 0
  for (const b of blocks) {
    const t = estimateTokens(b.text)
    if (current.length > 0 && currentTokens + t > maxTokens) {
      batches.push(current)
      current = []
      currentTokens = 0
    }
    current.push(b)
    currentTokens += t
  }
  if (current.length > 0) batches.push(current)
  return batches
}

async function evaluateBatch(
  blocks: { id: string; text: string }[],
  apiKey: string,
  model: string,
  strictness: 'lenient' | 'balanced' | 'strict',
  detectAI: boolean
): Promise<Map<string, any>> {
  const strictnessInstructions = {
    lenient: 'Generous: award marks for effort and partial understanding.',
    balanced: 'Fair academic standards: full for correct, partial for incomplete-but-correct, none for wrong.',
    strict: 'Rigorous: deduct for inaccuracies, incomplete explanations, missing edge cases.',
  }
  const aiDetect = detectAI
    ? 'Set aiCopyPercentage 0-100 based on signs of AI generation per question.'
    : 'Set aiCopyPercentage to 0 for all.'

  const prompt = `You are an expert academic evaluator. Grade EACH question independently.

Strictness: ${strictness.toUpperCase()}
${strictnessInstructions[strictness]}
${aiDetect}

🚫 Verify code does what is claimed. Do NOT invent strengths. If output absent or wrong, deduct.

QUESTIONS TO GRADE:
${blocks.map(b => b.text).join('\n---\n')}

Return JSON:
{
  "questions": [
    {
      "questionNumber": "<same as input>",
      "maxMarks": <number>,
      "awardedMarks": <number>,
      "status": "complete" | "partial" | "skipped",
      "summary": "<one line>",
      "strengths": ["..."],
      "mistakes": ["..."],
      "suggestions": ["..."],
      "rubricAlignment": "<one line>",
      "aiCopyPercentage": <0-100>,
      "confidence": "low" | "medium" | "high"
    }
  ]
}`

  const parsed = await callOpenAI(apiKey, model, prompt, 0.4, 4000)
  const list: any[] = parsed.questions || []
  const map = new Map<string, any>()
  for (const r of list) {
    const num = String(r.questionNumber || '').replace(/^0+/, '')
    map.set(num, r)
  }
  return map
}

async function evaluateBatched(
  cells: ExtractedCell[],
  mappings: QuestionMapping[],
  title: string,
  apiKey: string,
  model: string,
  strictness: 'lenient' | 'balanced' | 'strict',
  detectAI: boolean,
  submissionInfo: SubmissionInfo | null,
  mode: EvalMode,
  onProgress?: (done: number, total: number) => void
): Promise<EvaluationResult> {
  const cellByIdx = new Map(cells.map(c => [c.index, c]))
  const modalMarksMap = new Map(
    (submissionInfo?.questionsFromModal || []).map(m => [String(m.number).replace(/^0+/, ''), m.maxMarks])
  )
  const modalPromptMap = new Map(
    (submissionInfo?.questionsFromModal || [])
      .filter(m => m.prompt)
      .map(m => [String(m.number).replace(/^0+/, ''), m.prompt as string])
  )

  const answered = mappings.filter(m => m.hasAnswer && m.answerCellIndexes.length > 0)
  const skipped = mappings.filter(m => !m.hasAnswer || m.answerCellIndexes.length === 0)

  // Recovery: split skipped into recoverable (has modal prompt) vs hard-skipped
  const answeredCellSet = new Set(answered.flatMap(m => m.answerCellIndexes))
  const unmappedCellIndexes = cells
    .filter(c => !answeredCellSet.has(c.index))
    .map(c => c.index)

  const recoverable = skipped.filter(m => {
    const numKey = String(m.number).replace(/^0+/, '')
    return modalPromptMap.has(numKey) || !!m.prompt
  })
  const hardSkipped = skipped.filter(m => {
    const numKey = String(m.number).replace(/^0+/, '')
    return !modalPromptMap.has(numKey) && !m.prompt
  })

  // For recoverable questions: try evaluation with unmapped cells + modal prompt as context
  const recoveryMappings = recoverable.map(m => ({
    ...m,
    answerCellIndexes: unmappedCellIndexes,
    hasAnswer: unmappedCellIndexes.length > 0,
  }))

  const allAnswered = [...answered, ...recoveryMappings]

  const blocks = allAnswered.map(m => {
    const numKey = String(m.number).replace(/^0+/, '')
    return {
      id: numKey,
      text: buildQuestionBlock(m, cellByIdx, modalMarksMap.get(numKey), modalPromptMap.get(numKey)),
    }
  })

  const batches =
    mode === 'single'
      ? [blocks]
      : packBatches(blocks, MAX_BATCH_TOKENS)

  console.group(`%c[Evaluator] ${mode === 'single' ? 'Single' : 'Adaptive'} batching`, 'background: #0d6efd; color: white; padding: 2px 8px; border-radius: 3px;')
  console.log(`Total Qs: ${mappings.length} (answered: ${allAnswered.length}, hard-skipped: ${hardSkipped.length}, recovered: ${recoveryMappings.length})`)
  console.log(`Batches: ${batches.length}`)
  batches.forEach((b, i) => console.log(`  Batch ${i + 1}: ${b.length} Qs, ~${b.reduce((s, x) => s + estimateTokens(x.text), 0)} tokens`))
  console.groupEnd()

  let completedQs = 0
  const totalAnswered = allAnswered.length

  const batchResults = await Promise.all(
    batches.map(async batch => {
      if (batch.length === 0) return new Map<string, any>()
      try {
        const result = await evaluateBatch(batch, apiKey, model, strictness, detectAI)
        completedQs += batch.length
        onProgress?.(completedQs, totalAnswered)
        return result
      } catch (err: any) {
        console.error(`[Evaluator] Batch failed:`, err)
        return new Map<string, any>()
      }
    })
  )

  const merged = new Map<string, any>()
  batchResults.forEach(m => m.forEach((v, k) => merged.set(k, v)))

  const questionResults: any[] = mappings.map(m => {
    const numKey = String(m.number).replace(/^0+/, '')
    const officialMax = modalMarksMap.get(numKey)

    if (hardSkipped.includes(m)) {
      return {
        questionId: `q-${m.number}`,
        questionNumber: m.number,
        awardedMarks: 0,
        maxMarks: officialMax ?? 0,
        summary: m.reason || 'No answer cell found / empty cell',
        strengths: [],
        mistakes: ['Question not attempted'],
        suggestions: ['Provide an answer for this question'],
        rubricAlignment: 'N/A — no answer',
        aiCopyPercentage: 0,
        confidence: 'high',
        status: 'skipped',
      }
    }

    const r = merged.get(numKey)
    if (!r) {
      return {
        questionId: `q-${m.number}`,
        questionNumber: m.number,
        awardedMarks: 0,
        maxMarks: officialMax ?? 0,
        summary: 'Evaluator did not return result for this question',
        strengths: [],
        mistakes: ['Evaluator returned no data'],
        suggestions: ['Re-run evaluation'],
        rubricAlignment: '',
        aiCopyPercentage: 0,
        confidence: 'low',
        status: 'skipped',
      }
    }

    const maxMarks = officialMax ?? Number(r.maxMarks) ?? 10
    const awarded = Math.min(maxMarks, Math.max(0, Number(r.awardedMarks) || 0))
    return {
      questionId: `q-${m.number}`,
      questionNumber: m.number,
      awardedMarks: awarded,
      maxMarks,
      summary: r.summary || '',
      strengths: r.strengths || [],
      mistakes: r.mistakes || [],
      suggestions: r.suggestions || [],
      rubricAlignment: r.rubricAlignment || '',
      aiCopyPercentage: r.aiCopyPercentage ?? 0,
      confidence: r.confidence || 'medium',
      status: r.status || (awarded === maxMarks ? 'complete' : awarded > 0 ? 'partial' : 'skipped'),
    }
  })

  const maxScore = questionResults.reduce((s, q) => s + q.maxMarks, 0)
  const totalScore = questionResults.reduce((s, q) => s + q.awardedMarks, 0)

  return {
    id: `eval-${Date.now()}`,
    assignmentId: 'default',
    assignmentVersion: 1,
    submissionId: `sub-${Date.now()}`,
    submissionName: title,
    strictness,
    totalScore,
    maxScore,
    generatedAt: new Date().toISOString(),
    questionResults,
    submissionInfo: submissionInfo ?? undefined,
  }
}

