/**
 * Background Service Worker
 * Handles side panel lifecycle and extension events
 */

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id })
})

// Configure side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.action, 'from tab:', sender.tab?.id)
  
  if (request.action === 'submissionInfoCaptured') {
    console.log('[Background] Processing submission info:', request.data)

    // Open side panel for current tab
    if (sender.tab?.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id }, () => {
        console.log('[Background] Side panel opened for tab:', sender.tab.id)
      })
    }

    // Relay message to side panel
    const message = {
      action: 'submissionInfoCaptured',
      data: request.data,
    }

    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[Background] Could not relay to side panel:', chrome.runtime.lastError.message)
        sendResponse({ success: false })
      } else {
        console.log('[Background] Relayed to side panel, response:', response)
        sendResponse({ success: true })
      }
    })

    return true // Keep channel open for async response
  }
  
  // For unhandled messages, still respond
  sendResponse({ success: false })
})

console.log('[Phitron] Background service worker initialized')
