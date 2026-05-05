(function(){if(window.__phitronContentLoaded)return;window.__phitronContentLoaded=!0;const C=".ReactModal__Content",k='input[name="obtainMark"]',L=".ql-editor",E="phitron-fill-panel-root",w="phitron-capture-btn";function I(t){if(!t||t.length<2||t.length>100)return!1;const e=t.toLowerCase();return["student","name","assignment","email","phone","date","mark","score","submission","deadline"].some(n=>e.includes(n))?!1:/[a-z]/i.test(t)}function P(t){const e={studentName:"",assignmentName:"",email:"",submissionDate:"",colabLink:""};console.log("[Phitron] Starting extraction from form:",t);let s=t.querySelector("header");if(s||(s=t.querySelector('[class*="modal-header"]')),s||(s=t.querySelector('[class*="Header"]')),s){const o=s.querySelector("strong");if(o&&(e.assignmentName=o.textContent?.trim()||"",console.log("[Phitron] Found assignment name via header strong:",e.assignmentName)),!e.assignmentName){const c=(s.textContent?.trim()||"").split(`
`);c[0]&&(e.assignmentName=c[0].trim(),console.log("[Phitron] Found assignment name via header text:",e.assignmentName))}}const n=t.querySelectorAll("label");console.log("[Phitron] Found",n.length,"labels in form");for(let o=0;o<n.length;o++){const i=n[o],g=(i.textContent?.trim()||"").toLowerCase();if(g.includes("student name")&&!e.studentName){if(o+1<n.length){const p=n[o+1].textContent?.trim()||"";if(p&&!p.toLowerCase().includes("student name")&&!p.toLowerCase().includes("phone")&&p.length>2){e.studentName=p.split(`
`)[0],console.log("[Phitron] Found student name from next label:",e.studentName);continue}}const d=i.parentElement;if(d&&d.nextElementSibling){const p=d.nextElementSibling.querySelector("label");if(p){const f=p.textContent?.trim()||"";if(f&&!f.toLowerCase().includes("student name")&&f.length>2){e.studentName=f.split(`
`)[0],console.log("[Phitron] Found student name from parent next div:",e.studentName);continue}}}let m=i.nextElementSibling;if(m){const l=m.textContent?.trim()||"";if(l&&!l.toLowerCase().includes("student name")&&l.length>2){e.studentName=l.split(`
`)[0],console.log("[Phitron] Found student name via sibling:",e.studentName);continue}}}if(g.includes("email")&&!g.includes("phone")&&!e.email){if(o+1<n.length){const l=n[o+1].textContent?.trim()||"";if(l&&l.includes("@")){e.email=l,console.log("[Phitron] Found email from next label:",e.email);continue}}let d=i.nextElementSibling;if(d){const m=d.textContent?.trim()||"";m&&!m.toLowerCase().includes("email")&&(e.email=m,console.log("[Phitron] Found email:",e.email))}}if(g.includes("submission date")&&!e.submissionDate){if(o+1<n.length){const l=n[o+1].textContent?.trim()||"";if(l&&!l.toLowerCase().includes("submission date")){e.submissionDate=l,console.log("[Phitron] Found submission date from next label:",e.submissionDate);continue}}let d=i.nextElementSibling;if(d){const m=d.textContent?.trim()||"";m&&!m.toLowerCase().includes("submission date")&&(e.submissionDate=m,console.log("[Phitron] Found submission date:",e.submissionDate))}}}if(!e.studentName&&n.length>0){console.log("[Phitron] Using aggressive fallback for student name...");for(let o=0;o<n.length;o++){const c=n[o].textContent?.trim()||"";if(I(c)){e.studentName=c,console.log("[Phitron] Found student name via validation fallback:",c);break}}}const a=t.querySelectorAll("a");for(const o of Array.from(a)){const i=o.getAttribute("href")||"";if(i.includes("colab")){e.colabLink=i,console.log("[Phitron] Found Colab link:",i);break}}return console.log("[Phitron] Extracted submission info:",e),e}function A(t){const e=document.createElement("button");return e.id=w,e.className="btn btn-info btn-sm w-100",e.textContent="📋 Capture Submission Info",e.type="button",e.style.cssText=`
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
    `,console.log("[Phitron] Created capture button:",e),e.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),console.log("[Phitron] Capture button clicked"),e.disabled=!0,e.style.opacity="0.6",e.textContent;try{const n=P(t);if(!n.studentName||!n.studentName.trim())throw new Error("Student name not found. Please check the form structure.");console.log("[Phitron] Extracted info, sending message:",n),chrome.runtime.sendMessage({action:"submissionInfoCaptured",data:n},a=>{chrome.runtime.lastError?(console.error("[Phitron] Message error:",chrome.runtime.lastError),e.textContent="❌ Error - Try Again",e.style.opacity="0.8"):a?.success?(e.textContent="✓ Info Captured - Check Side Panel",e.classList.add("disabled"),e.disabled=!0):(e.textContent="⚠️ Capture Failed - Try Again",e.style.opacity="0.8",e.disabled=!1)})}catch(n){console.error("[Phitron] Error capturing submission info:",n);const a=n instanceof Error?n.message:"Capture failed";e.textContent=`❌ ${a}`,e.style.opacity="0.8",e.disabled=!1}}),e}function M(t){let e=t.querySelector(".font-weight-bold.pl-2");if(e){const n=parseInt(e.textContent??"",10);if(!isNaN(n))return console.log(`[Phitron] readOutOf found: ${n} via .font-weight-bold.pl-2`),n}if(e=t.querySelector("span.font-weight-bold"),e){const n=parseInt(e.textContent??"",10);if(!isNaN(n))return console.log(`[Phitron] readOutOf found: ${n} via span.font-weight-bold`),n}const s=t.querySelectorAll("span");for(const n of s){const a=n.textContent?.trim()??"",o=parseInt(a,10);if(!isNaN(o)&&o>=2&&o<=200&&a.match(/^[0-9]{2,3}$/))return console.log(`[Phitron] readOutOf found: ${o} via heuristic scan`),o}return console.warn("[Phitron] readOutOf: Could not find out-of value, defaulting to 100"),100}function T(t,e){const s=t.querySelector(k);if(!s)return;const n=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;n&&(n.call(s,String(e)),s.dispatchEvent(new Event("input",{bubbles:!0})),s.dispatchEvent(new Event("change",{bubbles:!0})))}function R(t,e){const s=t.querySelector(".ql-container"),n=t.querySelector(L);if(!n)return;const a=window.Quill;if(a&&s)try{const o=a.find(s);if(o){o.clipboard.dangerouslyPasteHTML(e);return}}catch(o){console.error("[Phitron] Quill API failed:",o)}n.innerHTML=e}function S(){try{return!!(chrome?.runtime?.id&&chrome?.storage?.local)}catch{return!1}}async function $(){return S()?new Promise(t=>{try{chrome.storage.local.get("lastEvaluationResult",e=>{if(chrome.runtime.lastError){console.warn("[Phitron] storage.get error:",chrome.runtime.lastError.message),t(null);return}try{const s=e.lastEvaluationResult?JSON.parse(e.lastEvaluationResult):null;t(s)}catch{t(null)}})}catch(e){console.warn("[Phitron] storage.get threw:",e),t(null)}}):(console.warn("[Phitron] Extension context invalidated, skip storage read. Reload page."),null)}function x(t){return(t??"").trim().toLowerCase().replace(/\s+/g," ")}function q(t,e){const s=t?.submissionInfo;if(!s)return!1;const n=x(s.assignmentName),a=x(s.email),o=x(e.assignmentName),i=x(e.email);return!n||!a||!o||!i?!1:n===o&&a===i}function F(t,e,s){const n=document.createElement("div"),a=t?.submissionInfo?.assignmentName||"(unknown)",o=t?.submissionInfo?.email||"(unknown)",i=e.assignmentName||"(not detected)",c=e.email||"(not detected)";n.innerHTML=`
      <div class="card-header bg-warning text-dark py-2 px-3" style="border-radius: 6px 6px 0 0;">
        <strong>⚠️ Evaluation Mismatch</strong>
      </div>
      <div class="card-body">
        <div class="alert alert-warning mb-2 small">
          <p class="mb-1"><strong>Stored eval is for a different submission.</strong></p>
          <p class="mb-1 mt-2"><strong>Evaluated:</strong></p>
          <ul class="mb-1 pl-3">
            <li>📝 ${a}</li>
            <li>✉️ ${o}</li>
          </ul>
          <p class="mb-1 mt-2"><strong>Current modal:</strong></p>
          <ul class="mb-0 pl-3">
            <li>📝 ${i}</li>
            <li>✉️ ${c}</li>
          </ul>
        </div>
        <button class="btn btn-outline-secondary btn-sm w-100 mb-2" id="phitron-refresh-btn">
          🔄 Refresh — Re-check Match
        </button>
        <p class="small text-muted mb-0">If detection wrong, click Refresh. Else capture this submission and re-evaluate correct Colab notebook.</p>
      </div>
    `;const g=n.querySelector("#phitron-refresh-btn");return g&&g.addEventListener("click",()=>{console.log("[Phitron] Refresh clicked, remounting panel"),y(s)}),n}function D(t,e,s){const n=document.createElement("div");n.className="phitron-ai-panel-root card mb-3",n.style.borderTop="3px solid #0d6efd",n.style.borderRadius="6px";const a=A(s);n.appendChild(a);const o=P(s),i={assignmentName:o.assignmentName||"",email:o.email||""};if(t&&!q(t,i))return n.appendChild(F(t,i,s)),n;if(t){const c=Math.round(t.totalScore/t.maxScore*e),g=e/t.maxScore,d=t.questionResults.map(r=>Math.round(r.maxMarks*g)),m=e-d.reduce((r,u)=>r+u,0);m!==0&&d.length>0&&(d[d.length-1]+=m);const l=t.questionResults.map((r,u)=>{const b=d[u];return r.maxMarks===0?0:Math.min(b,Math.round(r.awardedMarks*(b/r.maxMarks)))}),p=c-l.reduce((r,u)=>r+u,0);if(p!==0){const r=l.findIndex((u,b)=>u+p>=0&&u+p<=d[b]);r>=0&&(l[r]+=p)}const f=t.questionResults.map((r,u)=>`<span class="badge ${r.status==="complete"?"badge-success":r.status==="partial"?"badge-warning":"badge-danger"} mr-1 mb-1">Q${r.questionNumber} ${l[u]}/${d[u]}</span>`).join(""),N=document.createElement("div");N.innerHTML=`
        <div class="card-header bg-primary text-white py-2 px-3 d-flex justify-content-between align-items-center" style="border-radius: 6px 6px 0 0;">
          <span>
            <strong>✨ AI Evaluation Ready</strong>
            <span class="badge badge-light text-dark ml-2">${c}/${e}</span>
            <span class="badge badge-success ml-2">✓ Ready to Apply</span>
          </span>
        </div>
        <div class="card-body">
          <div class="mb-2 small text-muted">
            <strong>Score:</strong> ${t.totalScore}/${t.maxScore} × ${(e/t.maxScore).toFixed(2)} = <strong>${c}</strong>
          </div>
          <div class="mb-3">
            ${f}
          </div>
          <button class="btn btn-primary btn-sm w-100" id="phitron-apply-btn">
            ✨ Auto-Fill Form
          </button>
        </div>
      `,n.appendChild(N);const h=n.querySelector("#phitron-apply-btn");h&&h.addEventListener("click",()=>{T(s,c);const r=[];r.push("<p><strong>Examiner Feedback:</strong> Overall performance evaluated.</p>"),r.push("<p></p>"),t.questionResults.forEach((u,b)=>{r.push(`<p><strong># Question ${u.questionNumber}</strong></p>`),r.push(`<p><em>${u.summary||u.questionNumber}</em> → <strong>${l[b]} / ${d[b]}</strong></p>`),u.mistakes?.[0]&&r.push(`<p><strong>Note:</strong> ${u.mistakes[0]}</p>`),r.push("<p></p>")}),R(s,r.join("")),h.textContent="✓ Applied — Click to Re-apply",h.classList.add("disabled"),setTimeout(()=>h.classList.remove("disabled"),1e3)})}else{const c=document.createElement("div");c.innerHTML=`
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
      `,n.appendChild(c)}return n}function y(t){const e=document.getElementById(E);e&&e.remove(),console.log("[Phitron] mountPanel called, form element:",t);const s=M(t);$().then(n=>{document.querySelectorAll(`#${E}, .phitron-ai-panel-root`).forEach(g=>g.remove());const a=D(n,s,t);a.id=E,console.log("[Phitron] Created panelUI:",a);let o=!1;const i=t.querySelector(".modal-body");i&&(i.firstChild?i.insertBefore(a,i.firstChild):i.appendChild(a),o=!0,console.log("[Phitron] Panel inserted into .modal-body",i)),!o&&t.firstChild&&(t.insertBefore(a,t.firstChild),o=!0,console.log("[Phitron] Panel inserted into form element")),o||(t.appendChild(a),o=!0,console.log("[Phitron] Panel appended to form element")),console.log("[Phitron] Panel mounted, inserted:",o,"result:",n);const c=document.getElementById(w);console.log("[Phitron] Capture button in DOM:",!!c)})}if(S())try{chrome.storage.onChanged.addListener(t=>{if(!("lastEvaluationResult"in t))return;const e=document.querySelector(C);e&&(console.log("[Phitron] Eval changed, remounting panel"),setTimeout(()=>y(e),100))})}catch(t){console.warn("[Phitron] storage.onChanged listener failed:",t)}new MutationObserver(()=>{const t=document.querySelector(C);t&&!t.getAttribute("data-fillpanel-mounted")&&(t.setAttribute("data-fillpanel-mounted","true"),console.log("[Phitron] Form detected, mounting panel..."),y(t))}).observe(document.body,{childList:!0,subtree:!0});const v=document.querySelector(C);v&&!v.getAttribute("data-fillpanel-mounted")&&(v.setAttribute("data-fillpanel-mounted","true"),console.log("[Phitron] Form already loaded, mounting panel immediately..."),y(v)),console.log("[Phitron Content] Script loaded and monitoring for assignment modals"),console.log("[Phitron] phitronContent loaded - panel will appear when modal opens")})();
