# Modal Capture Button - Testing Guide

## Summary of Changes

The extension now includes an auto-capture button injected directly into Phitron assignment modals. When clicked, it extracts student name, assignment name, email, submission date, and Colab link automatically — no manual typing required.

### What Was Built

**phitronContent.ts**
- `extractSubmissionInfo()` - Parses modal DOM for:
  - Student Name (from "Student Name" label field)
  - Assignment Name (from modal header `<strong>` tag)
  - Email (from "Email" label field)
  - Submission Date (from "Submission Date" label field)
  - Colab Link (from href attribute containing 'colab')

- `createCaptureButton()` - Creates styled button that:
  - Says "📋 Capture Submission Info"
  - Sends message to side panel on click
  - Shows "✓ Info Captured - Check Side Panel" on success

**SidePanel.tsx**
- Added `capturedInfo` state to store data from modal
- Added `chrome.runtime.onMessage` listener for `submissionInfoCaptured` action
- Shows amber notification when capture succeeds
- Pre-fills form with captured data

**SubmissionInfoForm.tsx**
- Added `initialData` prop to accept pre-populated values
- Form initializes with captured data if available

---

## Testing Steps

### 1. Load Extension
```bash
# Build complete with no errors ✓
npm run build
```
- Output: `dist/` folder contains all compiled files
- Key files: `phitronContent.js` (6.94 kB), `sidepanel.js` (70.08 kB)

### 2. Install Extension in Chrome
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Navigate to `dist/` folder and select it

### 3. Navigate to Phitron Assignment Modal
1. Go to your Phitron dashboard (instructor view)
2. Open any assignment with student submission
3. Click on a student's submission to open the evaluation modal

### 4. Verify Capture Button Appears
**Expected:**
- At the top of the evaluation panel inside the modal, you should see a blue button
- Button text: "📋 Capture Submission Info"
- Button positioned above the "No Report Generated Yet" or result preview

**If button doesn't appear:**
- Check Chrome DevTools → Console for `[Phitron] phitronContent loaded` message
- If missing: Manifest permissions might be wrong
- Inspect element: Look for `#phitron-capture-btn` in DOM

### 5. Test Capture Extraction
1. **Click the capture button** in the modal

**Expected:**
- Button text changes to: "✓ Info Captured - Check Side Panel"
- Button becomes disabled (opacity 0.6)
- Console shows: `[Phitron] Extracted submission info: { studentName: "...", assignmentName: "...", ... }`

**If extraction fails:**
- Check console for extraction logs
- Modal structure might differ from expected
- May need to adjust selectors in `extractSubmissionInfo()`

### 6. Test Message Passing to Side Panel
1. **Open the side panel**
   - Click Phitron Evaluator icon in Chrome toolbar
   - Icon should show extension UI in right sidebar

**Expected in side panel:**
- Evaluate tab is active
- Amber notification appears: "✓ Submission info captured from Phitron modal!"
- Form shows with pre-populated fields:
  - Student Name: "[Captured Name]"
  - Assignment Name: "[Captured Assignment]"
  - Other fields filled if available

**If side panel doesn't show captured data:**
- Check DevTools → Console: Look for `[SidePanel] Received submission info from modal:`
- Message might not be reaching the listener
- Verify manifest.json has `"web_accessible_resources"` permission

### 7. Test Form Review & Confirmation
1. **Review the pre-filled form** in the side panel
2. **Edit any fields** if needed (they should be editable)
3. **Click "Proceed with Evaluation"** button

**Expected:**
- Form validates (both Student Name and Assignment Name required)
- Badge appears showing captured info:
  - 👤 [Student Name]
  - 📝 [Assignment Name]
  - 📅 [Date if available]
  - ✉️ [Email if available]
- "Ready to Evaluate" section appears below badge
- Previous evaluation result (if any) becomes accessible

### 8. Test Complete Workflow
1. **In Colab notebook:** Extract and evaluate submission
2. **In modal:** Capture button → pre-fills form
3. **In side panel:** Review captured info → evaluate
4. **In modal:** Auto-fill button applies results
5. **In side panel:** Report shows submission context at top

---

## Troubleshooting

### Capture Button Doesn't Appear
```
Check: Are you in the instructor assignment evaluation modal?
       Is extension loaded in chrome://extensions/ ?
       Check console: chrome://extensions/ → Phitron Extension → errors
```

### Extraction Gets Wrong Data
```
DOM selectors might not match actual Phitron version.
Solution: 
1. Inspect modal element
2. Check actual label text (might be "Student" not "Student Name")
3. Update selectors in extractSubmissionInfo()
```

### Message Doesn't Reach Side Panel
```
Check:
1. Is side panel actually open? (check DevTools → Console for [SidePanel] logs)
2. manifest.json has correct permissions
3. Both tabs are running (modal tab + side panel tab)
```

### Form Fields Not Pre-populated
```
Check:
1. SubmissionInfoForm.tsx receives initialData prop
2. Form uses initialData in useState initialization
3. Component is re-rendering when capturedInfo updates
```

---

## Success Criteria

✅ Capture button appears in modal  
✅ Extraction captures all 5 fields (name, assignment, email, date, link)  
✅ Message reaches side panel  
✅ Form pre-fills with captured values  
✅ User can review and confirm  
✅ Submission info badge shows in evaluate view  
✅ Full workflow completes: capture → evaluate → report  

---

## Next Steps (If Testing Passes)
- [ ] Test with multiple assignments
- [ ] Test editing captured values in form
- [ ] Test "Change Submission Info" button
- [ ] Test persistence (info saved to chrome.storage)
- [ ] Test message passing from different Phitron pages
- [ ] Polish UI/UX based on real modal appearance

---

## Debug Commands

**View extraction in console:**
```javascript
// In modal, open DevTools → Console and run:
chrome.storage.local.get('currentSubmissionInfo', (data) => {
  console.log('Stored submission info:', data)
})
```

**Force reload extension:**
```
chrome://extensions/ → Phitron Extension → click reload button
```

**Check if message listener is active:**
```javascript
// In side panel console:
console.log('Message listeners active')
// Should not throw errors if listener exists
```
