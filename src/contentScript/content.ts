/**
 * Content Script - runs on Colab/Docs pages
 * Listens for extraction requests from the popup
 *
 * Wrapped in IIFE + window guard to prevent double-injection collisions on SPA navigation
 */

import { extractContent } from './extractor'

;(function () {
  // Guard: skip if already loaded (handles SPA re-injections and extension reloads)
  if ((window as any).__phitronContentScriptLoaded) return
  ;(window as any).__phitronContentScriptLoaded = true

  console.log('[Phitron] Content script loaded on', window.location.href)

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'extractContent') {
      extractContent()
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false, error: err?.message || 'Extraction failed' }))
      return true // keep port open for async response
    }

    if (request.action === 'ping') {
      sendResponse({ pong: true })
      return true
    }
  })
})()
