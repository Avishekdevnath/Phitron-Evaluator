/**
 * Content script extractor
 * Extracts full visible text from Colab/Docs pages
 */

export interface ExtractedCell {
  index: number
  type: 'text' | 'code' | 'output' | 'unknown'
  text: string
  hasOutput: boolean
  isEmpty: boolean
}

export interface ExtractedContent {
  title: string
  text: string
  cells: ExtractedCell[]
  source: 'google-docs' | 'google-colab' | 'generic'
  url: string
  timestamp: string
}

export interface ExtractionResult {
  success: boolean
  content?: ExtractedContent
  error?: string
}

function isGoogleColab(): boolean {
  return window.location.hostname.includes('colab.research.google.com')
}

function isGoogleDocs(): boolean {
  return window.location.hostname.includes('docs.google.com')
}

/**
 * Most reliable extraction: get all visible page text.
 * Works regardless of Colab DOM version.
 */
function extractAllVisibleText(): string {
  // innerText respects visibility and gives human-readable text
  return document.body.innerText || document.body.textContent || ''
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/**
 * Ask the MAIN-world bridge to read window.colab.* and return cells.
 * Content scripts (isolated world) can't access page globals directly.
 * Returns null if bridge not present or model unavailable.
 */
async function tryColabInternalModel(timeoutMs = 800): Promise<ExtractedCell[] | null> {
  return new Promise(resolve => {
    const requestId = `phitron-${Date.now()}-${Math.random()}`
    let done = false

    const handler = (ev: MessageEvent) => {
      if (ev.source !== window) return
      if (!ev.data || ev.data.type !== 'PHITRON_COLAB_MODEL_RESPONSE') return
      if (ev.data.requestId !== requestId) return
      done = true
      window.removeEventListener('message', handler)

      const rawCells = ev.data.cells
      if (!Array.isArray(rawCells) || rawCells.length === 0) {
        resolve(null)
        return
      }
      const placeholderRe = /double-?click\s*\(?or enter\)?\s*to edit|click here to add/i
      const out: ExtractedCell[] = rawCells.map((c: any, i: number) => {
        const cellType = String(c.cell_type || '').toLowerCase()
        const text = String(c.source || '').trim()
        const isEmpty = !text || text.length < 3 || placeholderRe.test(text)
        return {
          index: i,
          type: cellType.includes('markdown') || cellType.includes('text') ? 'text'
            : cellType.includes('code') ? 'code' : 'unknown',
          text,
          hasOutput: Number(c.outputs) > 0,
          isEmpty,
        }
      })
      console.log('%c[Extractor] Used Colab internal model via bridge', 'color: #198754; font-weight: 600;')
      resolve(out)
    }

    window.addEventListener('message', handler)
    window.postMessage({ type: 'PHITRON_COLAB_MODEL_REQUEST', requestId }, '*')

    setTimeout(() => {
      if (!done) {
        window.removeEventListener('message', handler)
        resolve(null)
      }
    }, timeoutMs)
  })
}

/**
 * Find the scroll container Colab uses for the cell list.
 */
function findColabScrollContainer(): HTMLElement {
  const candidates = [
    '.notebook-content',
    '.notebook-vertical',
    '[class*="notebook-scroll"]',
    'main',
  ]
  for (const sel of candidates) {
    const el = document.querySelector(sel) as HTMLElement | null
    if (el && el.scrollHeight > el.clientHeight) return el
  }
  return document.scrollingElement as HTMLElement || document.documentElement
}

/**
 * Force Colab's virtualizer to render every cell by scrolling top-to-bottom,
 * snapshotting cells at each step. Snapshots merge by fingerprint so virtualizer
 * eviction doesn't lose cells we've already seen. Restores scroll position after.
 */
async function materializeAndSnapshotCells(): Promise<ExtractedCell[]> {
  const scroller = findColabScrollContainer()
  const originalTop = scroller.scrollTop
  const acc = new Map<string, ExtractedCell>()

  console.log('[Extractor] Materializing virtualized cells (snapshot-during-scroll)...')

  // Phase 1: warm — jump to bottom to trigger any lazy load
  let lastHeight = 0
  for (let i = 0; i < 5; i++) {
    scroller.scrollTo({ top: scroller.scrollHeight })
    await sleep(250)
    if (scroller.scrollHeight === lastHeight) break
    lastHeight = scroller.scrollHeight
  }

  // Phase 2: stepwise top-to-bottom; snapshot at every step
  scroller.scrollTo({ top: 0 })
  await sleep(200)
  extractColabCells(acc)

  const step = Math.max(600, Math.floor(scroller.clientHeight * 0.8))
  for (let pos = step; pos < scroller.scrollHeight; pos += step) {
    scroller.scrollTo({ top: pos })
    await sleep(150)
    extractColabCells(acc)
  }

  // Final pass: bottom + final snapshot
  scroller.scrollTo({ top: scroller.scrollHeight })
  await sleep(200)
  extractColabCells(acc)

  // Restore original scroll
  scroller.scrollTo({ top: originalTop })
  await sleep(100)

  // Reindex by insertion order so indexes are 0..N-1 contiguous
  const cells = Array.from(acc.values()).map((c, i) => ({ ...c, index: i }))
  console.log(`[Extractor] Materialization done. Cells captured: ${cells.length}`)
  return cells
}

const CELL_SELECTORS = [
  '.notebook-cell-list-item',
  'colab-tab-pane .cell',
  'div.cell',
  '.text-cell',
  '.code-cell',
  // newer Colab variants
  '[role="region"][class*="cell"]',
  'div[class*="cell-execution"]',
].join(', ')

/** Cell fingerprint stable across re-renders by virtualizer. */
function fingerprintCell(node: HTMLElement): string {
  const id = node.getAttribute('data-cell-id') || node.id || ''
  if (id) return `id:${id}`
  // Hash-ish: type + first 200 chars of normalized text
  const text = (node.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 200)
  const isText = !!node.querySelector('.text-cell, .markdown') || node.classList.contains('text-cell')
  return `t:${isText ? 'text' : 'code'}:${text}`
}

function readSingleCell(node: HTMLElement, idx: number): ExtractedCell {
  const isText = node.classList.contains('text-cell') || !!node.querySelector('.text-cell, .markdown')
  const isCode = node.classList.contains('code-cell') || !!node.querySelector('.code-cell, .inputarea, .monaco-editor')
  const outputEl = node.querySelector('.output, .output-area, [class*="output"]')
  const editorText = (node.querySelector('.inputarea, .monaco-editor, .CodeMirror, pre') as HTMLElement)?.innerText
  const text = (editorText || node.innerText || '').trim()
  const placeholderRe = /double-?click\s*\(?or enter\)?\s*to edit|click here to add|empty/i
  const isEmpty = !text || text.length < 3 || placeholderRe.test(text)
  return {
    index: idx,
    type: isText ? 'text' : isCode ? 'code' : 'unknown',
    text,
    hasOutput: !!outputEl && (outputEl.textContent?.trim().length ?? 0) > 0,
    isEmpty,
  }
}

/** Snapshot whatever cell nodes are currently in DOM. */
function snapshotCellNodes(): HTMLElement[] {
  const all = Array.from(document.querySelectorAll(CELL_SELECTORS)) as HTMLElement[]
  // Dedupe nested matches: keep top-level cell containers only
  return all.filter(node => !all.some(other => other !== node && other.contains(node)))
}

/**
 * Accumulate cells across multiple DOM snapshots (e.g. during scroll).
 * Dedupes by fingerprint so virtualizer re-renders don't double-count.
 */
function extractColabCells(accumulator?: Map<string, ExtractedCell>): ExtractedCell[] {
  const acc = accumulator ?? new Map<string, ExtractedCell>()
  const nodes = snapshotCellNodes()
  nodes.forEach(node => {
    const fp = fingerprintCell(node)
    if (acc.has(fp)) return
    acc.set(fp, readSingleCell(node, acc.size))
  })
  return Array.from(acc.values())
}

function getPageTitle(): string {
  return document.title || document.querySelector('h1')?.textContent?.trim() || 'Assignment'
}

function logExtractionStats(text: string, source: string): void {
  console.group('%c[Phitron Extractor] Extraction Stats', 'background: #0d6efd; color: white; padding: 2px 8px; border-radius: 3px;')

  // Basic stats
  console.log('Source:', source)
  console.log('Total length:', text.length, 'chars')
  console.log('Approx tokens:', Math.round(text.length / 4))

  // Question detection
  const qMatches = text.match(/Question\s*[-:]?\s*\d+/gi) || []
  const qNumbers = [...new Set(qMatches.map(m => m.match(/\d+/)?.[0]).filter(Boolean))]
  console.log('Question matches:', qMatches.length)
  console.log('Unique question numbers:', qNumbers.sort((a, b) => parseInt(a!) - parseInt(b!)).join(', '))

  // Code markers
  const codeMarkers = {
    def: (text.match(/\bdef\s+\w+/g) || []).length,
    import: (text.match(/\bimport\s+\w+/g) || []).length,
    print: (text.match(/\bprint\s*\(/g) || []).length,
    'np.': (text.match(/\bnp\./g) || []).length,
    'pd.': (text.match(/\bpd\./g) || []).length,
  }
  console.log('Code markers:', codeMarkers)

  // Marks pattern
  const marksMatches = text.match(/\[?Marks?\s*:?\s*\d+\]?/gi) || []
  console.log('Marks patterns:', marksMatches.length, marksMatches.slice(0, 10))

  // Colab DOM cell counts (when on Colab)
  if (source === 'google-colab') {
    const allCells = document.querySelectorAll('.cell, .notebook-cell-list-item, [class*="cell"]')
    const codeCells = document.querySelectorAll('.code-cell, .cell.code')
    const textCells = document.querySelectorAll('.text-cell, .cell.text, .markdown')
    const outputs = document.querySelectorAll('.output, .output-area, [class*="output"]')
    console.log('DOM cells — total:', allCells.length, 'code:', codeCells.length, 'text:', textCells.length, 'outputs:', outputs.length)
  }

  // Preview slices
  console.log('First 500 chars:', text.slice(0, 500))
  console.log('Last 500 chars:', text.slice(-500))

  console.groupEnd()

  // Also stash on window for clipboard copy
  ;(window as any).__phitronLastExtraction = text
  console.log('%c💡 Tip: Run copy(window.__phitronLastExtraction) in console to copy full extraction to clipboard', 'color: #198754; font-weight: 600;')
}

function logCellBreakdown(cells: ExtractedCell[]): void {
  console.group('%c[Phitron Extractor] Cell Breakdown', 'background: #fd7e14; color: white; padding: 2px 8px; border-radius: 3px;')
  console.log(`Total cells: ${cells.length}`)
  console.log(`Code cells: ${cells.filter(c => c.type === 'code').length}`)
  console.log(`Text cells: ${cells.filter(c => c.type === 'text').length}`)
  console.log(`Empty cells: ${cells.filter(c => c.isEmpty).length}`)
  console.table(
    cells.map(c => ({
      idx: c.index,
      type: c.type,
      empty: c.isEmpty,
      output: c.hasOutput,
      preview: c.text.slice(0, 80).replace(/\s+/g, ' '),
      chars: c.text.length,
    }))
  )
  ;(window as any).__phitronLastCells = cells
  console.log('%c💡 Run copy(JSON.stringify(window.__phitronLastCells, null, 2)) for full cell dump', 'color: #198754; font-weight: 600;')
  console.groupEnd()
}

export async function extractContent(): Promise<ExtractionResult> {
  try {
    const source: ExtractedContent['source'] = isGoogleColab()
      ? 'google-colab'
      : isGoogleDocs()
        ? 'google-docs'
        : 'generic'

    let cells: ExtractedCell[] = []

    if (source === 'google-colab') {
      // Strategy 1: ask MAIN-world bridge for window.colab notebook model
      const fromModel = await tryColabInternalModel()
      const modelHasContent = fromModel && fromModel.length > 0 && fromModel.some(c => !c.isEmpty)
      if (modelHasContent) {
        cells = fromModel!
        console.log(`[Extractor] Using ${cells.length} cells from internal model`)
      } else {
        if (fromModel && fromModel.length > 0) {
          console.warn(`[Extractor] Bridge returned ${fromModel.length} cells but all empty — discarding, falling back to DOM`)
        }
        // Strategy 2: scroll to materialize virtualized cells, snapshot during scroll
        cells = await materializeAndSnapshotCells()
      }
    }

    const content = extractAllVisibleText()

    if (!content || content.length < 10) {
      return {
        success: false,
        error: 'Could not extract content. Make sure you are on a Colab notebook with visible content.',
      }
    }

    logExtractionStats(content, source)
    if (cells.length > 0) logCellBreakdown(cells)

    // Sanity: detect highest question number in extracted text vs cell count
    if (source === 'google-colab') {
      const qNums = [...content.matchAll(/Question[\s\-:]?(\d+)/gi)].map(m => parseInt(m[1]))
      if (qNums.length > 0) {
        const maxQ = Math.max(...qNums)
        if (maxQ > cells.length * 2) {
          console.warn(`[Extractor] ⚠️ Highest Q seen: ${maxQ}, cells: ${cells.length}. Possible missed cells.`)
        }
      }
    }

    return {
      success: true,
      content: {
        title: getPageTitle(),
        text: content,
        cells,
        source,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during extraction',
    }
  }
}
