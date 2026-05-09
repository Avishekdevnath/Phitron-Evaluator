(function(){if(window.__phitronContentLoaded)return;window.__phitronContentLoaded=!0;const w=".ReactModal__Content",S='input[name="obtainMark"]',N=".ql-editor",E="phitron-fill-panel-root",I="phitron-capture-btn";function k(t){return!!(t.querySelector(S)&&t.querySelector(N))}function L(t){if(!t||t.length<2||t.length>100)return!1;const e=t.toLowerCase();return["student","name","assignment","email","phone","date","mark","score","submission","deadline"].some(n=>e.includes(n))?!1:/[a-z]/i.test(t)}function A(t){const e=[],o=t.querySelectorAll('span.badge, [class*="badge"], [class*="chip"]');for(const n of o){const a=(n.textContent?.trim()||"").match(/Q(\d+)\s+(\d+)\/(\d+)/);a&&(e.push({number:a[1],maxMarks:parseInt(a[3],10)}),console.log("[Phitron] Found question from modal:",a[1],a[3]))}return console.log("[Phitron] Extracted",e.length,"questions from modal"),e}function M(t){const e={studentName:"",assignmentName:"",email:"",submissionDate:"",colabLink:"",totalMarks:0,questionsFromModal:[]};console.log("[Phitron] Starting extraction from form:",t);let o=t.querySelector("header");if(o||(o=t.querySelector('[class*="modal-header"]')),o||(o=t.querySelector('[class*="Header"]')),o){const s=o.querySelector("strong");if(s&&(e.assignmentName=s.textContent?.trim()||"",console.log("[Phitron] Found assignment name via header strong:",e.assignmentName)),!e.assignmentName){const u=(o.textContent?.trim()||"").split(`
`);u[0]&&(e.assignmentName=u[0].trim(),console.log("[Phitron] Found assignment name via header text:",e.assignmentName))}}const n=t.querySelectorAll("label");console.log("[Phitron] Found",n.length,"labels in form");for(let s=0;s<n.length;s++){const l=n[s],b=(l.textContent?.trim()||"").toLowerCase();if(b.includes("student name")&&!e.studentName){if(s+1<n.length){const g=n[s+1].textContent?.trim()||"";if(g&&!g.toLowerCase().includes("student name")&&!g.toLowerCase().includes("phone")&&g.length>2){e.studentName=g.split(`
`)[0],console.log("[Phitron] Found student name from next label:",e.studentName);continue}}const f=l.parentElement;if(f&&f.nextElementSibling){const g=f.nextElementSibling.querySelector("label");if(g){const x=g.textContent?.trim()||"";if(x&&!x.toLowerCase().includes("student name")&&x.length>2){e.studentName=x.split(`
`)[0],console.log("[Phitron] Found student name from parent next div:",e.studentName);continue}}}let c=l.nextElementSibling;if(c){const m=c.textContent?.trim()||"";if(m&&!m.toLowerCase().includes("student name")&&m.length>2){e.studentName=m.split(`
`)[0],console.log("[Phitron] Found student name via sibling:",e.studentName);continue}}}if(b.includes("email")&&!b.includes("phone")&&!e.email){if(s+1<n.length){const m=n[s+1].textContent?.trim()||"";if(m&&m.includes("@")){e.email=m,console.log("[Phitron] Found email from next label:",e.email);continue}}let f=l.nextElementSibling;if(f){const c=f.textContent?.trim()||"";c&&!c.toLowerCase().includes("email")&&(e.email=c,console.log("[Phitron] Found email:",e.email))}}if(b.includes("submission date")&&!e.submissionDate){if(s+1<n.length){const m=n[s+1].textContent?.trim()||"";if(m&&!m.toLowerCase().includes("submission date")){e.submissionDate=m,console.log("[Phitron] Found submission date from next label:",e.submissionDate);continue}}let f=l.nextElementSibling;if(f){const c=f.textContent?.trim()||"";c&&!c.toLowerCase().includes("submission date")&&(e.submissionDate=c,console.log("[Phitron] Found submission date:",e.submissionDate))}}}if(!e.studentName&&n.length>0){console.log("[Phitron] Using aggressive fallback for student name...");for(let s=0;s<n.length;s++){const u=n[s].textContent?.trim()||"";if(L(u)){e.studentName=u,console.log("[Phitron] Found student name via validation fallback:",u);break}}}const i=t.querySelectorAll("a");for(const s of Array.from(i)){const l=s.getAttribute("href")||"";if(l.includes("colab")){e.colabLink=l,console.log("[Phitron] Found Colab link:",l);break}}const a=t.textContent||"",p=[/Approximate\s+Marks\s*:\s*\d+\s*\/\s*(\d+)/i,/Score\s*:\s*\d+\s*\/\s*(\d+)/i,/out\s+of\s+(\d+)/i];for(const s of p){const l=a.match(s);if(l){e.totalMarks=parseInt(l[1],10),console.log("[Phitron] Found total marks:",e.totalMarks,"via pattern:",s.source);break}}if(!e.totalMarks){const s=t.querySelector(".font-weight-bold.pl-2");if(s){const l=parseInt(s.textContent?.trim()||"",10);!isNaN(l)&&l>0&&(e.totalMarks=l,console.log("[Phitron] Found total marks via .font-weight-bold.pl-2:",l))}}return e.questionsFromModal=A(t),console.log("[Phitron] Extracted submission info:",e),e}function q(t){const e=document.createElement("button");return e.id=I,e.className="btn btn-info btn-sm w-100",e.textContent="📋 Capture Submission Info",e.type="button",e.style.cssText=`
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
    `,console.log("[Phitron] Created capture button:",e),e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),console.log("[Phitron] Capture button clicked"),e.disabled=!0,e.style.opacity="0.6";try{const n=M(t);if(!n.studentName||!n.studentName.trim())throw new Error("Student name not found. Please check the form structure.");if(console.log("[Phitron] Extracted info, sending message:",n),e.textContent="⏳ Sending...",!P())throw new Error("Extension context invalid. Reload page.");try{chrome.runtime.sendMessage({action:"submissionInfoCaptured",data:n},i=>{chrome.runtime.lastError?(console.error("[Phitron] Message error:",chrome.runtime.lastError),e.textContent="❌ Error - Try Again",e.style.opacity="0.8",e.disabled=!1):i?.success?(e.textContent="✓ Info Captured - Evaluating...",e.classList.add("disabled"),e.disabled=!0):(e.textContent="⚠️ Capture Failed - Try Again",e.style.opacity="0.8",e.disabled=!1)})}catch(i){console.error("[Phitron] sendMessage threw:",i),e.textContent="❌ Error - Reload Page",e.style.opacity="0.8",e.disabled=!1}}catch(n){console.error("[Phitron] Error capturing submission info:",n);const i=n instanceof Error?n.message:"Capture failed";e.textContent=`❌ ${i}`,e.style.opacity="0.8",e.disabled=!1}}),e}function R(t){let e=t.querySelector(".font-weight-bold.pl-2");if(e){const n=parseInt(e.textContent??"",10);if(!isNaN(n))return console.log(`[Phitron] readOutOf found: ${n} via .font-weight-bold.pl-2`),n}if(e=t.querySelector("span.font-weight-bold"),e){const n=parseInt(e.textContent??"",10);if(!isNaN(n))return console.log(`[Phitron] readOutOf found: ${n} via span.font-weight-bold`),n}const o=t.querySelectorAll("span");for(const n of o){const i=n.textContent?.trim()??"",a=parseInt(i,10);if(!isNaN(a)&&a>=2&&a<=200&&i.match(/^[0-9]{2,3}$/))return console.log(`[Phitron] readOutOf found: ${a} via heuristic scan`),a}return console.warn("[Phitron] readOutOf: Could not find out-of value, defaulting to 100"),100}function T(t,e){const o=t.querySelector(S);if(!o)return;const n=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;n&&(n.call(o,String(e)),o.dispatchEvent(new Event("input",{bubbles:!0})),o.dispatchEvent(new Event("change",{bubbles:!0})))}function $(t,e){const o=t.querySelector(".ql-container"),n=t.querySelector(N);if(!n)return;const i=window.Quill;if(i&&o)try{const a=i.find(o);if(a){a.clipboard.dangerouslyPasteHTML(e);return}}catch(a){console.error("[Phitron] Quill API failed:",a)}n.innerHTML=e}function P(){try{return!!chrome?.runtime?.id}catch{return!1}}async function F(){return P()?new Promise(t=>{try{chrome.storage.local.get("lastEvaluationResult",e=>{if(chrome.runtime.lastError){console.warn("[Phitron] storage.get error:",chrome.runtime.lastError.message),t(null);return}try{const o=e.lastEvaluationResult?JSON.parse(e.lastEvaluationResult):null;t(o)}catch{t(null)}})}catch(e){console.warn("[Phitron] storage.get threw:",e),t(null)}}):(console.warn("[Phitron] Extension context invalidated, skip storage read. Reload page."),null)}function v(t){return(t??"").trim().toLowerCase().replace(/\s+/g," ")}function D(t,e){const o=t?.submissionInfo;if(!o)return!1;const n=v(o.assignmentName),i=v(o.email),a=v(e.assignmentName),p=v(e.email);return!n||!i||!a||!p?!1:n===a&&i===p}function O(t,e,o){const n=document.createElement("div"),i=t?.submissionInfo?.assignmentName||"(unknown)",a=t?.submissionInfo?.email||"(unknown)",p=e.assignmentName||"(not detected)",s=e.email||"(not detected)";n.innerHTML=`
      <div class="card-header bg-warning text-dark py-2 px-3" style="border-radius: 6px 6px 0 0;">
        <strong>⚠️ Evaluation Mismatch</strong>
      </div>
      <div class="card-body">
        <div class="alert alert-warning mb-2 small">
          <p class="mb-1"><strong>Stored eval is for a different submission.</strong></p>
          <p class="mb-1 mt-2"><strong>Evaluated:</strong></p>
          <ul class="mb-1 pl-3">
            <li>📝 ${i}</li>
            <li>✉️ ${a}</li>
          </ul>
          <p class="mb-1 mt-2"><strong>Current modal:</strong></p>
          <ul class="mb-0 pl-3">
            <li>📝 ${p}</li>
            <li>✉️ ${s}</li>
          </ul>
        </div>
        <button class="btn btn-outline-secondary btn-sm w-100 mb-2" id="phitron-refresh-btn">
          🔄 Refresh — Re-check Match
        </button>
        <p class="small text-muted mb-0">If detection wrong, click Refresh. Else capture this submission and re-evaluate correct Colab notebook.</p>
      </div>
    `;const l=n.querySelector("#phitron-refresh-btn");return l&&l.addEventListener("click",()=>{console.log("[Phitron] Refresh clicked, remounting panel"),C(o)}),n}function _(t,e,o){const n=document.createElement("div");n.className="phitron-ai-panel-root card mb-3",n.style.borderTop="3px solid #0d6efd",n.style.borderRadius="6px";const i=M(o),a={assignmentName:i.assignmentName||"",email:i.email||""},p=q(o);if(n.appendChild(p),t&&!D(t,a))return n.appendChild(O(t,a,o)),n;if(t){const s=Math.round(t.totalScore/t.maxScore*e),l=e/t.maxScore,u=t.questionResults.map(r=>Math.round(r.maxMarks*l)),b=e-u.reduce((r,d)=>r+d,0);b!==0&&u.length>0&&(u[u.length-1]+=b);const f=t.questionResults.map((r,d)=>{const h=u[d];return r.maxMarks===0?0:Math.min(h,Math.round(r.awardedMarks*(h/r.maxMarks)))}),c=s-f.reduce((r,d)=>r+d,0);if(c!==0){const r=f.findIndex((d,h)=>d+c>=0&&d+c<=u[h]);r>=0&&(f[r]+=c)}const m=t.questionResults.map((r,d)=>`<span class="badge ${r.status==="complete"?"badge-success":r.status==="partial"?"badge-warning":"badge-danger"} mr-1 mb-1">Q${r.questionNumber} ${f[d]}/${u[d]}</span>`).join(""),g=document.createElement("div"),x=t.submissionInfo?.studentName?` for ${t.submissionInfo.studentName}`:"";g.innerHTML=`
        <div class="card-header bg-primary text-white py-2 px-3 d-flex justify-content-between align-items-center" style="border-radius: 6px 6px 0 0;">
          <span>
            <strong>✨ AI Evaluation Ready${x}</strong>
            <span class="badge badge-light text-dark ml-2">${s}/${e}</span>
            <span class="badge badge-success ml-2">✓ Ready to Apply</span>
          </span>
        </div>
        <div class="card-body">
          <div class="mb-2 small text-muted">
            <strong>Score:</strong> ${t.totalScore}/${t.maxScore} × ${(e/t.maxScore).toFixed(2)} = <strong>${s}</strong>
          </div>
          <div class="mb-3">
            ${m}
          </div>
          <button class="btn btn-primary btn-sm w-100" id="phitron-apply-btn">
            ✨ Auto-Fill Form
          </button>
        </div>
      `,n.appendChild(g);const y=n.querySelector("#phitron-apply-btn");y&&y.addEventListener("click",()=>{T(o,s);const r=[];r.push("<p><strong>Examiner Feedback:</strong> Overall performance evaluated.</p>"),r.push("<p></p>"),t.questionResults.forEach((d,h)=>{r.push(`<p><strong># Question ${d.questionNumber}</strong></p>`),r.push(`<p><em>${d.summary||d.questionNumber}</em> → <strong>${f[h]} / ${u[h]}</strong></p>`),d.mistakes?.[0]&&r.push(`<p><strong>Note:</strong> ${d.mistakes[0]}</p>`),r.push("<p></p>")}),r.push("<p><strong>Important Instructions:</strong></p>"),r.push("<p>→ Do not post on Facebook, if you have any marks-related issues.</p>"),r.push("<p>→ Make sure to read all the requirements carefully, If you have any marks-related confusion.</p>"),r.push("<p>→ If you are confident and If there is a mistake from the examiner's end, give a recheck request.</p>"),r.push("<p>→ If your recheck reason was not valid, 2 marks will be deducted from your current marks.</p>"),r.push("<p>→ Please check the documentation below for more information about how to recheck.</p>"),r.push("<p><br></p>"),r.push('<p style="color:red;"><strong>We have a recheck option, so please refrain from posting to the group.</strong></p>'),r.push('<p style="color:green;"><em>If your recheck reason is valid you will get marks, if not valid 2 marks will be deducted.</em></p>'),$(o,r.join("")),y.textContent="✓ Applied — Click to Re-apply",y.classList.add("disabled"),setTimeout(()=>y.classList.remove("disabled"),1e3)})}else{const s=document.createElement("div");s.innerHTML=`
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
      `,n.appendChild(s)}return n}function C(t){const e=document.getElementById(E);e&&e.remove(),console.log("[Phitron] mountPanel called, form element:",t);const o=R(t);F().then(n=>{document.querySelectorAll(`#${E}, .phitron-ai-panel-root`).forEach(l=>l.remove());const i=_(n,o,t);i.id=E,console.log("[Phitron] Created panelUI:",i);let a=!1;const p=t.querySelector(".modal-body");p&&(p.firstChild?p.insertBefore(i,p.firstChild):p.appendChild(i),a=!0,console.log("[Phitron] Panel inserted into .modal-body",p)),!a&&t.firstChild&&(t.insertBefore(i,t.firstChild),a=!0,console.log("[Phitron] Panel inserted into form element")),a||(t.appendChild(i),a=!0,console.log("[Phitron] Panel appended to form element")),console.log("[Phitron] Panel mounted, inserted:",a,"result:",n);const s=document.getElementById(I);console.log("[Phitron] Capture button in DOM:",!!s)})}if(P())try{chrome.storage.onChanged.addListener(t=>{if(!("lastEvaluationResult"in t))return;const o=Array.from(document.querySelectorAll(w)).find(n=>k(n));o&&(console.log("[Phitron] Eval changed, remounting panel"),setTimeout(()=>C(o),100))})}catch(t){console.warn("[Phitron] storage.onChanged listener failed:",t)}new MutationObserver(()=>{document.querySelectorAll(w).forEach(e=>{e.getAttribute("data-fillpanel-mounted")||k(e)&&(e.setAttribute("data-fillpanel-mounted","true"),console.log("[Phitron] Assignment modal detected, mounting panel..."),C(e))})}).observe(document.body,{childList:!0,subtree:!0}),document.querySelectorAll(w).forEach(t=>{t.getAttribute("data-fillpanel-mounted")||k(t)&&(t.setAttribute("data-fillpanel-mounted","true"),console.log("[Phitron] Assignment modal already loaded, mounting panel immediately..."),C(t))}),console.log("[Phitron Content] Script loaded and monitoring for assignment modals"),console.log("[Phitron] phitronContent loaded - panel will appear when modal opens")})();
