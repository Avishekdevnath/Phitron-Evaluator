(function(){if(window.__phitronContentLoaded)return;window.__phitronContentLoaded=!0;const d=".ReactModal__Content .assignment-evaluation-form",u='input[name="obtainMark"]',p=".ql-editor",c="phitron-fill-panel-root";function m(t){const e=t.querySelector(".font-weight-bold.pl-2");if(!e)return 100;const n=parseInt(e.textContent??"",10);return isNaN(n)?100:n}function b(t,e){const n=t.querySelector(u);if(!n)return;const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;s&&(s.call(n,String(e)),n.dispatchEvent(new Event("input",{bubbles:!0})),n.dispatchEvent(new Event("change",{bubbles:!0})))}function g(t,e){const n=t.querySelector(".ql-container"),s=t.querySelector(p);if(!s)return;const r=window.Quill;if(r&&n)try{const a=r.find(n);if(a){a.clipboard.dangerouslyPasteHTML(e);return}}catch(a){console.error("[Phitron] Quill API failed:",a)}s.innerHTML=e}async function h(){return new Promise(t=>{chrome.storage.local.get("lastEvaluationResult",e=>{try{const n=e.lastEvaluationResult?JSON.parse(e.lastEvaluationResult):null;t(n)}catch{t(null)}})})}function v(t,e,n){const s=document.createElement("div");if(s.className="phitron-ai-panel-root card mb-3",s.style.borderTop="3px solid #0d6efd",s.style.borderRadius="6px",!t)s.innerHTML=`
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
      `;else{const r=Math.round(t.totalScore/t.maxScore*e),a=t.questionResults.map(o=>`<span class="badge ${o.status==="complete"?"badge-success":o.status==="partial"?"badge-warning":"badge-danger"} mr-1 mb-1">Q${o.questionNumber} ${o.awardedMarks}/${o.maxMarks}</span>`).join("");s.innerHTML=`
        <div class="card-header bg-primary text-white py-2 px-3 d-flex justify-content-between align-items-center" style="border-radius: 6px 6px 0 0;">
          <span>
            <strong>✨ AI Evaluation Ready</strong>
            <span class="badge badge-light text-dark ml-2">${r}/${e}</span>
            <span class="badge badge-success ml-2">✓ Ready to Apply</span>
          </span>
        </div>
        <div class="card-body">
          <div class="mb-2 small text-muted">
            <strong>Score:</strong> ${t.totalScore}/${t.maxScore} × ${(e/t.maxScore).toFixed(2)} = <strong>${r}</strong>
          </div>
          <div class="mb-3">
            ${a}
          </div>
          <button class="btn btn-primary btn-sm w-100" id="phitron-apply-btn">
            ✨ Auto-Fill Form
          </button>
        </div>
      `;const l=s.querySelector("#phitron-apply-btn");l&&l.addEventListener("click",()=>{b(n,r);const o=[];o.push("<p><strong>Examiner Feedback:</strong> Overall performance evaluated.</p>"),o.push("<p></p>"),t.questionResults.forEach(i=>{o.push(`<p><strong># Question ${i.questionNumber}</strong></p>`),o.push(`<p><em>${i.summary||i.questionNumber}</em> → <strong>${i.awardedMarks} / ${i.maxMarks}</strong></p>`),i.mistakes?.[0]&&o.push(`<p><strong>Note:</strong> ${i.mistakes[0]}</p>`),o.push("<p></p>")}),g(n,o.join("")),l.textContent="✓ Applied — Click to Re-apply",l.classList.add("disabled"),setTimeout(()=>l.classList.remove("disabled"),1e3)})}return s}function y(t){const e=document.getElementById(c);e&&e.remove(),h().then(n=>{const s=m(t),r=v(n,s,t);r.id=c;const a=t.querySelector(".modal-body")||t;a.firstChild?a.insertBefore(r,a.firstChild):a.appendChild(r)})}new MutationObserver(()=>{const t=document.querySelector(d);t&&!t.getAttribute("data-fillpanel-mounted")&&(t.setAttribute("data-fillpanel-mounted","true"),y(t))}).observe(document.body,{childList:!0,subtree:!0}),console.log("[Phitron] phitronContent loaded - panel will appear when modal opens")})();
