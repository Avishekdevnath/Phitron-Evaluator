// Content script for Phitron assignment modal
// Auto-fills evaluation results into the form
// Wrapped in IIFE + window guard to prevent double-injection collisions on SPA navigation

;(function () {
  // Guard: skip if already loaded (handles SPA re-injections)
  if ((window as any).__phitronContentLoaded) return
  ;(window as any).__phitronContentLoaded = true

  const FORM_SELECTOR = '.ReactModal__Content' // More flexible selector for any modal
  const MARK_INPUT = 'input[name="obtainMark"]'
  const FEEDBACK_EDITOR = '.ql-editor'
  const PANEL_CONTAINER_ID = 'phitron-fill-panel-root'
  const CAPTURE_BTN_ID = 'phitron-capture-btn'

  // Distinguish assignment evaluation modal from other ReactModal dialogs
  // (Add Event, generic dialogs). Require obtainMark input + ql-editor.
  function isAssignmentModal(el: Element): boolean {
    return !!(el.querySelector(MARK_INPUT) && el.querySelector(FEEDBACK_EDITOR))
  }

  function isValidStudentName(text: string): boolean {
    if (!text || text.length < 2 || text.length > 100) return false
    const lower = text.toLowerCase()
    // Exclude common form labels and keywords
    const keywords = ['student', 'name', 'assignment', 'email', 'phone', 'date', 'mark', 'score', 'submission', 'deadline']
    if (keywords.some(k => lower.includes(k))) return false
    // Must have at least one letter
    return /[a-z]/i.test(text)
  }

  function extractQuestions(form: Element): Array<{ number: string; maxMarks: number; prompt?: string }> {
    const questions: Array<{ number: string; maxMarks: number; prompt?: string }> = []

    // Strategy 1 (primary, current Phitron markup):
    //   .feedback-box .row.p-2 contains: <h4>Question-N</h4>
    //                                    <div class="card-body">…<div class="flex-grow-1">PROMPT</div>…<span>10</span></div>
    const rows = form.querySelectorAll('.feedback-box .row.p-2, #load-feedback .row.p-2')
    rows.forEach(row => {
      const heading = row.querySelector('h4')
      const headingText = heading?.textContent?.trim() || ''
      const numMatch = headingText.match(/Question[\s\-:]?\s*(\d+)/i)
      if (!numMatch) return

      // Prompt text: the .flex-grow-1 div inside card-body holds the actual question text
      let promptText = ''
      const promptEl = row.querySelector('.card-body .flex-grow-1, .flex-grow-1')
      if (promptEl) {
        promptText = (promptEl as HTMLElement).innerText?.trim() || promptEl.textContent?.trim() || ''
      }

      // Mark span: last span in mark-cell, or one with min-width style
      const markCell = row.querySelector('.d-flex.my-1.align-items-center, .card-body .d-flex')
      let markText = ''
      if (markCell) {
        const styledSpan = markCell.querySelector('span[style*="min-width"]')
        if (styledSpan) {
          markText = styledSpan.textContent?.trim() || ''
        } else {
          // fallback: last numeric span in cell
          const spans = Array.from(markCell.querySelectorAll('span'))
          for (let i = spans.length - 1; i >= 0; i--) {
            const t = spans[i].textContent?.trim() || ''
            if (/^\d+(\.\d+)?$/.test(t)) {
              markText = t
              break
            }
          }
        }
      }

      // Last-resort: scan row text for trailing number
      if (!markText) {
        const rowText = row.textContent?.trim() || ''
        const tail = rowText.match(/(\d+)\s*$/)
        if (tail) markText = tail[1]
      }

      const marks = parseInt(markText, 10)
      if (!isNaN(marks) && marks > 0) {
        questions.push({ number: numMatch[1], maxMarks: marks, prompt: promptText || undefined })
        console.log(`[Phitron] Found Q${numMatch[1]} = ${marks} marks (prompt: ${promptText.slice(0, 60)}...)`)
      }
    })

    // Strategy 2 (fallback): old badge format `Q1 5/10`
    if (questions.length === 0) {
      const badges = form.querySelectorAll('span.badge, [class*="badge"], [class*="chip"]')
      for (const badge of badges) {
        const text = badge.textContent?.trim() || ''
        const match = text.match(/Q(\d+)\s+(\d+)\/(\d+)/)
        if (match) {
          questions.push({ number: match[1], maxMarks: parseInt(match[3], 10) })
          console.log('[Phitron] Fallback badge: Q', match[1], match[3])
        }
      }
    }

    // Validation: warn if sum mismatches official total
    const sum = questions.reduce((s, q) => s + q.maxMarks, 0)
    console.log(`[Phitron] Extracted ${questions.length} questions from modal (sum: ${sum})`)
    return questions
  }

  function extractSubmissionInfo(form: Element): any {
    const info: any = {
      studentName: '',
      assignmentName: '',
      email: '',
      submissionDate: '',
      colabLink: '',
      totalMarks: 0,
      questionsFromModal: [],
    }

    console.log('[Phitron] Starting extraction from form:', form)

    // Get assignment name from modal header - try multiple strategies
    let header = form.querySelector('header')
    if (!header) header = form.querySelector('[class*="modal-header"]')
    if (!header) header = form.querySelector('[class*="Header"]')
    
    if (header) {
      const headerTitle = header.querySelector('strong')
      if (headerTitle) {
        info.assignmentName = headerTitle.textContent?.trim() || ''
        console.log('[Phitron] Found assignment name via header strong:', info.assignmentName)
      }
      if (!info.assignmentName) {
        const headerText = header.textContent?.trim() || ''
        const parts = headerText.split('\n')
        if (parts[0]) {
          info.assignmentName = parts[0].trim()
          console.log('[Phitron] Found assignment name via header text:', info.assignmentName)
        }
      }
    }

    // Extract all form fields
    const labels = form.querySelectorAll('label')
    console.log('[Phitron] Found', labels.length, 'labels in form')

    // Build a map of field labels to values
    for (let idx = 0; idx < labels.length; idx++) {
      const label = labels[idx]
      const text = label.textContent?.trim() || ''
      const lowerText = text.toLowerCase()

      // Extract student name
      if (lowerText.includes('student name') && !info.studentName) {
        // Strategy 1: Check if next label contains the name (common structure)
        if (idx + 1 < labels.length) {
          const nextLabel = labels[idx + 1]
          const nextText = nextLabel.textContent?.trim() || ''
          if (nextText && !nextText.toLowerCase().includes('student name') &&
              !nextText.toLowerCase().includes('phone') && nextText.length > 2) {
            info.studentName = nextText.split('\n')[0]
            console.log('[Phitron] Found student name from next label:', info.studentName)
            continue
          }
        }

        // Strategy 2: Look in parent's next div for label
        const parent = label.parentElement
        if (parent && parent.nextElementSibling) {
          const nextDiv = parent.nextElementSibling
          const nameLabel = nextDiv.querySelector('label')
          if (nameLabel) {
            const val = nameLabel.textContent?.trim() || ''
            if (val && !val.toLowerCase().includes('student name') && val.length > 2) {
              info.studentName = val.split('\n')[0]
              console.log('[Phitron] Found student name from parent next div:', info.studentName)
              continue
            }
          }
        }

        // Strategy 3: Try text content of next div/span
        let next = label.nextElementSibling
        if (next) {
          const val = next.textContent?.trim() || ''
          if (val && !val.toLowerCase().includes('student name') && val.length > 2) {
            info.studentName = val.split('\n')[0]
            console.log('[Phitron] Found student name via sibling:', info.studentName)
            continue
          }
        }
      }
      
      // Extract email
      if (lowerText.includes('email') && !lowerText.includes('phone') && !info.email) {
        // Strategy 1: Next label
        if (idx + 1 < labels.length) {
          const nextLabel = labels[idx + 1]
          const nextText = nextLabel.textContent?.trim() || ''
          if (nextText && nextText.includes('@')) {
            info.email = nextText
            console.log('[Phitron] Found email from next label:', info.email)
            continue
          }
        }

        // Strategy 2: Next sibling
        let next = label.nextElementSibling
        if (next) {
          const val = next.textContent?.trim() || ''
          if (val && !val.toLowerCase().includes('email')) {
            info.email = val
            console.log('[Phitron] Found email:', info.email)
          }
        }
      }

      // Extract submission date
      if (lowerText.includes('submission date') && !info.submissionDate) {
        // Strategy 1: Next label
        if (idx + 1 < labels.length) {
          const nextLabel = labels[idx + 1]
          const nextText = nextLabel.textContent?.trim() || ''
          if (nextText && !nextText.toLowerCase().includes('submission date')) {
            info.submissionDate = nextText
            console.log('[Phitron] Found submission date from next label:', info.submissionDate)
            continue
          }
        }

        // Strategy 2: Next sibling
        let next = label.nextElementSibling
        if (next) {
          const val = next.textContent?.trim() || ''
          if (val && !val.toLowerCase().includes('submission date')) {
            info.submissionDate = val
            console.log('[Phitron] Found submission date:', info.submissionDate)
          }
        }
      }
    }

    // Aggressive fallback for student name if not found
    if (!info.studentName && labels.length > 0) {
      console.log('[Phitron] Using aggressive fallback for student name...')
      for (let idx = 0; idx < labels.length; idx++) {
        const label = labels[idx]
        const text = label.textContent?.trim() || ''

        if (isValidStudentName(text)) {
          info.studentName = text
          console.log('[Phitron] Found student name via validation fallback:', text)
          break
        }
      }
    }

    // Get Colab link
    const allLinks = form.querySelectorAll('a')
    for (const link of Array.from(allLinks)) {
      const href = link.getAttribute('href') || ''
      if (href.includes('colab')) {
        info.colabLink = href
        console.log('[Phitron] Found Colab link:', href)
        break
      }
    }

    // Extract total marks — try multiple patterns
    const formText = form.textContent || ''
    const patterns = [
      /Approximate\s+Marks\s*:\s*\d+\s*\/\s*(\d+)/i,
      /Score\s*:\s*\d+\s*\/\s*(\d+)/i,
      /out\s+of\s+(\d+)/i,
    ]
    for (const pattern of patterns) {
      const match = formText.match(pattern)
      if (match) {
        info.totalMarks = parseInt(match[1], 10)
        console.log('[Phitron] Found total marks:', info.totalMarks, 'via pattern:', pattern.source)
        break
      }
    }
    // Fallback: read "out of" span
    if (!info.totalMarks) {
      const outOfSpan = form.querySelector('.font-weight-bold.pl-2')
      if (outOfSpan) {
        const num = parseInt(outOfSpan.textContent?.trim() || '', 10)
        if (!isNaN(num) && num > 0) {
          info.totalMarks = num
          console.log('[Phitron] Found total marks via .font-weight-bold.pl-2:', num)
        }
      }
    }

    info.questionsFromModal = extractQuestions(form)
    console.log('[Phitron] Extracted submission info:', info)
    return info
  }

  function createCaptureButton(form: Element): HTMLElement {
    const btn = document.createElement('button')
    btn.id = CAPTURE_BTN_ID
    btn.className = 'btn btn-info btn-sm w-100'
    btn.textContent = '📋 Capture Submission Info'
    btn.type = 'button'
    
    // Enhanced styling with !important for precedence
    btn.style.cssText = `
      margin-bottom: 12px !important;
      font-weight: 600 !important;
      background-color: #0d6efd !important;
      border-color: #0d6efd !important;
      color: white !important;
      padding: 8px 12px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      border: none !important;
      font-size: 14px !important;
      display: block !important;
      width: 100% !important;
      z-index: 9999 !important;
      position: relative !important;
    `

    console.log('[Phitron] Created capture button:', btn)

    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('[Phitron] Capture button clicked')

      // Disable button during capture
      btn.disabled = true
      btn.style.opacity = '0.6'

      try {
        const info = extractSubmissionInfo(form)

        // Validate extracted data
        if (!info.studentName || !info.studentName.trim()) {
          throw new Error('Student name not found. Please check the form structure.')
        }

        console.log('[Phitron] Extracted info, sending message:', info)
        btn.textContent = '⏳ Sending...'

        // Guard sendMessage only — extraction is safe even if context stales
        if (!isExtensionContextValid()) {
          throw new Error('Extension context invalid. Reload page.')
        }

        // Send to side panel via chrome.runtime
        try {
          chrome.runtime.sendMessage(
            {
              action: 'submissionInfoCaptured',
              data: info,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('[Phitron] Message error:', chrome.runtime.lastError)
                btn.textContent = '❌ Error - Try Again'
                btn.style.opacity = '0.8'
                btn.disabled = false
              } else if (response?.success) {
                btn.textContent = '✓ Info Captured - Evaluating...'
                btn.classList.add('disabled')
                btn.disabled = true
              } else {
                btn.textContent = '⚠️ Capture Failed - Try Again'
                btn.style.opacity = '0.8'
                btn.disabled = false
              }
            }
          )
        } catch (msgErr) {
          console.error('[Phitron] sendMessage threw:', msgErr)
          btn.textContent = '❌ Error - Reload Page'
          btn.style.opacity = '0.8'
          btn.disabled = false
        }
      } catch (error) {
        console.error('[Phitron] Error capturing submission info:', error)
        const errorMsg = error instanceof Error ? error.message : 'Capture failed'
        btn.textContent = `❌ ${errorMsg}`
        btn.style.opacity = '0.8'
        btn.disabled = false
      }
    })

    return btn
  }

  function readOutOf(form: Element): number {
    // Try multiple selector strategies to find the "out of" value
    
    // Strategy 1: Look for span with both classes
    let span = form.querySelector('.font-weight-bold.pl-2')
    if (span) {
      const num = parseInt(span.textContent ?? '', 10)
      if (!isNaN(num)) {
        console.log(`[Phitron] readOutOf found: ${num} via .font-weight-bold.pl-2`)
        return num
      }
    }

    // Strategy 2: Look for any span with font-weight-bold class
    span = form.querySelector('span.font-weight-bold')
    if (span) {
      const num = parseInt(span.textContent ?? '', 10)
      if (!isNaN(num)) {
        console.log(`[Phitron] readOutOf found: ${num} via span.font-weight-bold`)
        return num
      }
    }

    // Strategy 3: Look for deadline/mark info in form structure
    const allSpans = form.querySelectorAll('span')
    for (const s of allSpans) {
      const text = s.textContent?.trim() ?? ''
      const num = parseInt(text, 10)
      // Look for reasonable mark values (2-100)
      if (!isNaN(num) && num >= 2 && num <= 200) {
        // Check if it's likely the "out of" value (usually 80, 90, 100, etc.)
        if (text.match(/^[0-9]{2,3}$/)) {
          console.log(`[Phitron] readOutOf found: ${num} via heuristic scan`)
          return num
        }
      }
    }

    console.warn('[Phitron] readOutOf: Could not find out-of value, defaulting to 100')
    return 100
  }

  function fillMarkInput(form: Element, value: number): void {
    const input = form.querySelector(MARK_INPUT) as HTMLInputElement | null
    if (!input) return

    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    if (setter) {
      setter.call(input, String(value))
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  function fillQuillEditor(form: Element, html: string): void {
    const editorContainer = form.querySelector('.ql-container')
    const editorDiv = form.querySelector(FEEDBACK_EDITOR)

    if (!editorDiv) return

    // Try Quill API first
    const Quill = (window as any).Quill
    if (Quill && editorContainer) {
      try {
        const instance = Quill.find(editorContainer)
        if (instance) {
          instance.clipboard.dangerouslyPasteHTML(html)
          return
        }
      } catch (err) {
        console.error('[Phitron] Quill API failed:', err)
      }
    }

    // Fallback: direct innerHTML
    editorDiv.innerHTML = html
  }

  function isExtensionContextValid(): boolean {
    try {
      return !!chrome?.runtime?.id
    } catch {
      return false
    }
  }

  async function loadEvaluationResult(): Promise<any> {
    if (!isExtensionContextValid()) {
      console.warn('[Phitron] Extension context invalidated, skip storage read. Reload page.')
      return null
    }
    return new Promise(resolve => {
      try {
        chrome.storage.local.get('lastEvaluationResult', storageData => {
          if (chrome.runtime.lastError) {
            console.warn('[Phitron] storage.get error:', chrome.runtime.lastError.message)
            resolve(null)
            return
          }
          try {
            const parsedResult = storageData.lastEvaluationResult
              ? JSON.parse(storageData.lastEvaluationResult)
              : null
            resolve(parsedResult)
          } catch {
            resolve(null)
          }
        })
      } catch (err) {
        console.warn('[Phitron] storage.get threw:', err)
        resolve(null)
      }
    })
  }

  function normalizeKey(s: string | undefined | null): string {
    return (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  }

  function matchSubmission(
    result: any,
    current: { assignmentName: string; email: string }
  ): boolean {
    const info = result?.submissionInfo
    if (!info) return false
    const evalAssignment = normalizeKey(info.assignmentName)
    const evalEmail = normalizeKey(info.email)
    const curAssignment = normalizeKey(current.assignmentName)
    const curEmail = normalizeKey(current.email)
    if (!evalAssignment || !evalEmail || !curAssignment || !curEmail) return false
    return evalAssignment === curAssignment && evalEmail === curEmail
  }

  function createMismatchUI(
    result: any,
    current: { assignmentName: string; email: string },
    form: Element
  ): HTMLElement {
    const div = document.createElement('div')
    const evalAssignment = result?.submissionInfo?.assignmentName || '(unknown)'
    const evalEmail = result?.submissionInfo?.email || '(unknown)'
    const curAssignment = current.assignmentName || '(not detected)'
    const curEmail = current.email || '(not detected)'
    div.innerHTML = `
      <div class="card-header bg-warning text-dark py-2 px-3" style="border-radius: 6px 6px 0 0;">
        <strong>⚠️ Evaluation Mismatch</strong>
      </div>
      <div class="card-body">
        <div class="alert alert-warning mb-2 small">
          <p class="mb-1"><strong>Stored eval is for a different submission.</strong></p>
          <p class="mb-1 mt-2"><strong>Evaluated:</strong></p>
          <ul class="mb-1 pl-3">
            <li>📝 ${evalAssignment}</li>
            <li>✉️ ${evalEmail}</li>
          </ul>
          <p class="mb-1 mt-2"><strong>Current modal:</strong></p>
          <ul class="mb-0 pl-3">
            <li>📝 ${curAssignment}</li>
            <li>✉️ ${curEmail}</li>
          </ul>
        </div>
        <button class="btn btn-outline-secondary btn-sm w-100 mb-2" id="phitron-refresh-btn">
          🔄 Refresh — Re-check Match
        </button>
        <p class="small text-muted mb-0">If detection wrong, click Refresh. Else capture this submission and re-evaluate correct Colab notebook.</p>
      </div>
    `
    const refreshBtn = div.querySelector('#phitron-refresh-btn')
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('[Phitron] Refresh clicked, remounting panel')
        mountPanel(form)
      })
    }
    return div
  }

  function createPanelUI(result: any, outOf: number, form: Element): HTMLElement {
    const container = document.createElement('div')
    container.className = 'phitron-ai-panel-root card mb-3'
    container.style.borderTop = '3px solid #0d6efd'
    container.style.borderRadius = '6px'

    // Extract current modal identity once for match check + capture
    const currentInfo = extractSubmissionInfo(form)
    const currentKey = {
      assignmentName: currentInfo.assignmentName || '',
      email: currentInfo.email || '',
    }

    // Add capture button at top
    const captureBtn = createCaptureButton(form)
    container.appendChild(captureBtn)

    if (result && !matchSubmission(result, currentKey)) {
      container.appendChild(createMismatchUI(result, currentKey, form))
      return container
    }

    if (!result) {
      // No result yet - show instructions
      const contentDiv = document.createElement('div')
      contentDiv.innerHTML = `
        <div class="card-header bg-primary text-white py-2 px-3" style="border-radius: 6px 6px 0 0;">
          <strong>✨ AI Evaluation</strong>
        </div>
        <div class="card-body">
          <div class="alert alert-info mb-3" role="alert">
            <strong>📋 No Report Generated Yet</strong>
            <p class="small mb-2 mt-2">Here's what to do next:</p>
            <ol class="small mb-0 pl-3">
              <li class="mb-1">Open the assignment submission in <strong>Colab</strong></li>
              <li class="mb-1">Click the <strong>Phitron Evaluator</strong> popup icon in Chrome toolbar</li>
              <li class="mb-1">Click <strong>Extract & Evaluate</strong> to run the evaluation</li>
              <li class="mb-1">Wait for AI to generate the report (~30-60 seconds)</li>
              <li>Come back here — the report will auto-load when ready</li>
            </ol>
          </div>
          <p class="text-muted small mb-0">
            <em>💡 Tip: The extension needs to analyze the submission before it can generate feedback.</em>
          </p>
        </div>
      `
      container.appendChild(contentDiv)
    } else {
      // Show result preview
      const scaledTotal = Math.round((result.totalScore / result.maxScore) * outOf)

      const ratio = outOf / result.maxScore
      const scaledMax: number[] = result.questionResults.map((q: any) => Math.round(q.maxMarks * ratio))
      const maxDiff = outOf - scaledMax.reduce((a, b) => a + b, 0)
      if (maxDiff !== 0 && scaledMax.length > 0) scaledMax[scaledMax.length - 1] += maxDiff

      const scaledAwarded: number[] = result.questionResults.map((q: any, i: number) => {
        const m = scaledMax[i]
        return q.maxMarks === 0 ? 0 : Math.min(m, Math.round(q.awardedMarks * (m / q.maxMarks)))
      })
      const awardDiff = scaledTotal - scaledAwarded.reduce((a, b) => a + b, 0)
      if (awardDiff !== 0) {
        const idx = scaledAwarded.findIndex((v, i) => v + awardDiff >= 0 && v + awardDiff <= scaledMax[i])
        if (idx >= 0) scaledAwarded[idx] += awardDiff
      }

      const questionBadges = result.questionResults
        .map((q: any, i: number) => {
          const statusClass =
            q.status === 'complete' ? 'badge-success' : q.status === 'partial' ? 'badge-warning' : 'badge-danger'
          return `<span class="badge ${statusClass} mr-1 mb-1">Q${q.questionNumber} ${scaledAwarded[i]}/${scaledMax[i]}</span>`
        })
        .join('')

      const contentDiv = document.createElement('div')
      const studentLabel = result.submissionInfo?.studentName ? ` for ${result.submissionInfo.studentName}` : ''
      contentDiv.innerHTML = `
        <div class="card-header bg-primary text-white py-2 px-3 d-flex justify-content-between align-items-center" style="border-radius: 6px 6px 0 0;">
          <span>
            <strong>✨ AI Evaluation Ready${studentLabel}</strong>
            <span class="badge badge-light text-dark ml-2">${scaledTotal}/${outOf}</span>
            <span class="badge badge-success ml-2">✓ Ready to Apply</span>
          </span>
        </div>
        <div class="card-body">
          <div class="mb-2 small text-muted">
            <strong>Score:</strong> ${result.totalScore}/${result.maxScore} × ${(outOf / result.maxScore).toFixed(2)} = <strong>${scaledTotal}</strong>
          </div>
          <div class="mb-3">
            ${questionBadges}
          </div>
          <button class="btn btn-primary btn-sm w-100" id="phitron-apply-btn">
            ✨ Auto-Fill Form
          </button>
        </div>
      `
      container.appendChild(contentDiv)

      // Add apply button handler
      const applyBtn = container.querySelector('#phitron-apply-btn')
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          fillMarkInput(form, scaledTotal)

          const lines: string[] = []
          lines.push(`<p><strong>Examiner Feedback:</strong> Overall performance evaluated.</p>`)
          lines.push(`<p></p>`)
          result.questionResults.forEach((q: any, i: number) => {
            lines.push(`<p><strong># Question ${q.questionNumber}</strong></p>`)
            lines.push(
              `<p><em>${q.summary || q.questionNumber}</em> → <strong>${scaledAwarded[i]} / ${scaledMax[i]}</strong></p>`
            )
            if (q.mistakes?.[0]) {
              lines.push(`<p><strong>Note:</strong> ${q.mistakes[0]}</p>`)
            }
            lines.push(`<p></p>`)
          })
          // Static footer — Important Instructions
          lines.push(`<p><strong>Important Instructions:</strong></p>`)
          lines.push(`<p>→ Do not post on Facebook, if you have any marks-related issues.</p>`)
          lines.push(`<p>→ Make sure to read all the requirements carefully, If you have any marks-related confusion.</p>`)
          lines.push(`<p>→ If you are confident and If there is a mistake from the examiner's end, give a recheck request.</p>`)
          lines.push(`<p>→ If your recheck reason was not valid, 2 marks will be deducted from your current marks.</p>`)
          lines.push(`<p>→ Please check the documentation below for more information about how to recheck.</p>`)
          lines.push(`<p><br></p>`)
          lines.push(`<p style="color:red;"><strong>We have a recheck option, so please refrain from posting to the group.</strong></p>`)
          lines.push(`<p style="color:green;"><em>If your recheck reason is valid you will get marks, if not valid 2 marks will be deducted.</em></p>`)
          fillQuillEditor(form, lines.join(''))

          // Update button state
          applyBtn.textContent = '✓ Applied — Click to Re-apply'
          applyBtn.classList.add('disabled')
          setTimeout(() => applyBtn.classList.remove('disabled'), 1000)
        })
      }
    }

    return container
  }

  function mountPanel(form: Element): void {
    // Remove existing panel if any
    const existingContainer = document.getElementById(PANEL_CONTAINER_ID)
    if (existingContainer) {
      existingContainer.remove()
    }

    console.log('[Phitron] mountPanel called, form element:', form)

    // Create panel UI immediately (don't wait for async storage load)
    const outOf = readOutOf(form)

    loadEvaluationResult().then(result => {
      // Dedupe: remove ALL stale panels before insert (race-safe)
      document
        .querySelectorAll(`#${PANEL_CONTAINER_ID}, .phitron-ai-panel-root`)
        .forEach(el => el.remove())

      const panelUI = createPanelUI(result, outOf, form)
      panelUI.id = PANEL_CONTAINER_ID

      console.log('[Phitron] Created panelUI:', panelUI)

      // Try multiple insertion points
      let inserted = false

      // Try 1: Insert at the top of modal-body
      const modalBody = form.querySelector('.modal-body')
      if (modalBody) {
        if (modalBody.firstChild) {
          modalBody.insertBefore(panelUI, modalBody.firstChild)
        } else {
          modalBody.appendChild(panelUI)
        }
        inserted = true
        console.log('[Phitron] Panel inserted into .modal-body', modalBody)
      }

      // Try 2: Insert at the top of form itself
      if (!inserted && form.firstChild) {
        form.insertBefore(panelUI, form.firstChild)
        inserted = true
        console.log('[Phitron] Panel inserted into form element')
      }

      // Try 3: Append to form
      if (!inserted) {
        form.appendChild(panelUI)
        inserted = true
        console.log('[Phitron] Panel appended to form element')
      }

      console.log('[Phitron] Panel mounted, inserted:', inserted, 'result:', result)

      // Verify button exists in DOM
      const btn = document.getElementById(CAPTURE_BTN_ID)
      console.log('[Phitron] Capture button in DOM:', !!btn)

      // Storage listener registered once at script load (see below); no per-mount registration
    })
  }

  // Single storage listener — remounts panel for currently visible modal on eval change
  if (isExtensionContextValid()) {
    try {
      chrome.storage.onChanged.addListener((changes: any) => {
        if (!('lastEvaluationResult' in changes)) return
        const forms = Array.from(document.querySelectorAll(FORM_SELECTOR))
        const form = forms.find(f => isAssignmentModal(f))
        if (!form) return

        console.log('[Phitron] Eval changed, remounting panel')


        setTimeout(() => mountPanel(form), 100)
      })
    } catch (err) {
      console.warn('[Phitron] storage.onChanged listener failed:', err)
    }
  }

  const observer = new MutationObserver(() => {
    const forms = document.querySelectorAll(FORM_SELECTOR)
    forms.forEach(form => {
      if (form.getAttribute('data-fillpanel-mounted')) return
      if (!isAssignmentModal(form)) return
      form.setAttribute('data-fillpanel-mounted', 'true')
      console.log('[Phitron] Assignment modal detected, mounting panel...')
      mountPanel(form)
    })
  })

  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true })

  // Also do an immediate check in case the form is already loaded
  document.querySelectorAll(FORM_SELECTOR).forEach(initialForm => {
    if (initialForm.getAttribute('data-fillpanel-mounted')) return
    if (!isAssignmentModal(initialForm)) return
    initialForm.setAttribute('data-fillpanel-mounted', 'true')
    console.log('[Phitron] Assignment modal already loaded, mounting panel immediately...')
    mountPanel(initialForm)
  })

  console.log('[Phitron Content] Script loaded and monitoring for assignment modals')

  console.log('[Phitron] phitronContent loaded - panel will appear when modal opens')
})()
