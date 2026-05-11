/**
 * Runs in PAGE WORLD (manifest sets "world": "MAIN").
 * Listens for window.postMessage from the isolated-world content script,
 * reads Colab's internal notebook model, and posts cells back.
 *
 * Isolated content scripts cannot see page globals like window.colab.
 * This bridge is the only reliable way to access them.
 */

;(function () {
  if ((window as any).__phitronColabBridgeLoaded) return
  ;(window as any).__phitronColabBridgeLoaded = true

  const REQUEST = 'PHITRON_COLAB_MODEL_REQUEST'
  const RESPONSE = 'PHITRON_COLAB_MODEL_RESPONSE'

  // Pull text from a cell, trying multiple shapes Colab uses across versions.
  function readCellText(c: any): string {
    if (!c) return ''
    const tryCall = (fn: any) => {
      try { return typeof fn === 'function' ? fn.call(c) : '' } catch { return '' }
    }
    const candidates: string[] = [
      // Plain fields (older / nbformat-style)
      Array.isArray(c.source) ? c.source.join('') : (typeof c.source === 'string' ? c.source : ''),
      typeof c.text === 'string' ? c.text : '',
      typeof c.input === 'string' ? c.input : '',
      // Monaco textModel getters
      tryCall(c.textModel?.getValue),
      tryCall(c.textModel?.getText),
      // Editor / code object getters
      tryCall(c.editor?.getValue),
      tryCall(c.editor?.getText),
      tryCall(c.code?.getValue),
      // Cell-level getters
      tryCall(c.getText),
      tryCall(c.getValue),
      // Nested model
      tryCall(c.model?.getValue),
      tryCall(c.model?.getText),
    ]
    for (const v of candidates) {
      if (typeof v === 'string' && v.length > 0) return v
    }
    return ''
  }

  function readCellOutputs(c: any): number {
    if (!c) return 0
    if (Array.isArray(c.outputs)) return c.outputs.length
    if (typeof c.outputs === 'object' && c.outputs?.length) return c.outputs.length
    if (Array.isArray(c.outputArea?.outputs)) return c.outputArea.outputs.length
    return 0
  }

  window.addEventListener('message', (ev: MessageEvent) => {
    if (ev.source !== window) return
    if (!ev.data || ev.data.type !== REQUEST) return

    const requestId = ev.data.requestId

    try {
      const w = window as any
      const candidates = [
        w.colab?.global?.notebookModel,
        w.colab?.notebookModel,
        w.colab?.notebook,
        w.notebookModel,
      ]

      let foundCells: any[] | null = null
      for (const cand of candidates) {
        if (!cand) continue
        const rawCells =
          cand.cells ||
          cand.cellList ||
          cand.notebook?.cells ||
          (typeof cand.toJSON === 'function' ? cand.toJSON()?.cells : null)
        if (Array.isArray(rawCells) && rawCells.length > 0) {
          foundCells = rawCells.map((c: any) => ({
            cell_type: c.cell_type || c.type || '',
            source: readCellText(c),
            outputs: readCellOutputs(c),
          }))
          break
        }
      }

      window.postMessage({ type: RESPONSE, requestId, cells: foundCells }, '*')
    } catch (err: any) {
      window.postMessage({ type: RESPONSE, requestId, cells: null, error: err?.message }, '*')
    }
  })
})()
