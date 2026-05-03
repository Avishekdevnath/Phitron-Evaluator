import{c as y,r as f,j as e,B as l,C,a as E,R as I}from"./circle-check-DWcsRHwm.js";import{s as A,E as M}from"./ErrorBoundary-DLW1Z4Ka.js";import{S as b}from"./settings-DoyJqaFk.js";/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],O=y("circle-alert",P);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],T=y("copy",R);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],F=y("loader-circle",$);/**
 * @license lucide-react v1.8.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],_=y("play",z);function v(o){const s=[];return s.push("<p><strong>Examiner Feedback:</strong> Overall performance evaluated.</p>"),s.push("<p></p>"),o.questionResults.forEach(n=>{s.push(`<p><strong># Question - ${n.questionNumber}</strong></p>`),s.push(`<p><em>${n.summary||n.questionNumber}</em> → <strong>${n.awardedMarks} / ${n.maxMarks}</strong></p>`),n.status==="partial"?(n.mistakes?.[0]&&s.push(`<p><strong>note:</strong> ${n.mistakes[0]}</p>`),n.suggestions?.[0]&&s.push(`<p>💡 ${n.suggestions[0]}</p>`)):n.status==="skipped"&&s.push("<p><strong>note:</strong> not attempted</p>"),s.push("<p></p>")}),s.push("<p><strong>Important Instructions:</strong></p>"),s.push("<p> → Do not post on Facebook, if you have any marks-related issues.</p>"),s.push("<p> → Make sure to read all the requirements carefully.</p>"),s.push("<p> → If you are confident there is a mistake, give a recheck request.</p>"),s.join("")}async function L(o){if(await chrome.storage.local.set({lastEvaluationResult:JSON.stringify(o)}),chrome.sidePanel?.open){const s=await chrome.windows.getCurrent();if(s.id){await chrome.sidePanel.open({windowId:s.id});return}}chrome.runtime.openOptionsPage()}function B(){const[o,s]=f.useState("idle"),[n,u]=f.useState(null),[r,p]=f.useState(null),[k,h]=f.useState("");async function g(){s("extracting"),u(null),h("Extracting notebook content...");try{const[a]=await chrome.tabs.query({active:!0,currentWindow:!0});if(!a?.id)throw new Error("No active tab found");const i=await new Promise((N,j)=>{chrome.tabs.sendMessage(a.id,{action:"extractContent"},S=>{if(chrome.runtime.lastError){j(new Error("Content script not loaded. Refresh the page and try again."));return}N(S)})});if(!i?.success)throw new Error(i?.error||"Failed to extract content from page");const c=i.content.text,t=i.content.title;s("evaluating");const d=Math.round(c.length/1e3);h(`Evaluating ${d}K chars... (may take a minute)`);const m=await A.getProviderSettings();if(!m.apiKey)throw new Error("OpenAI API key not set. Click Settings to add it.");const x=m.evaluatorSettings||{strictness:"balanced",detectAI:!0,feedbackFormat:"html"},w=await D(c,t,m.apiKey,m.model||"gpt-4o-mini",x.strictness,x.detectAI);p(w),await chrome.storage.local.set({lastEvaluationResult:JSON.stringify(w)}),s("done")}catch(a){u(a.message||"Something went wrong"),s("error")}}if(o==="idle")return e.jsxs("div",{className:"p-4 bg-white",children:[e.jsx("h1",{className:"text-lg font-bold text-slate-900 mb-1",children:"Phitron Evaluator"}),e.jsx("p",{className:"text-xs text-slate-500 mb-4",children:"Open a Colab notebook, then click Evaluate."}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(l,{onClick:g,className:"w-full",variant:"primary",icon:e.jsx(_,{size:18}),children:"Evaluate This Notebook"}),e.jsx(l,{onClick:()=>chrome.runtime.openOptionsPage(),className:"w-full",variant:"secondary",icon:e.jsx(b,{size:18}),children:"Settings"}),e.jsx(l,{onClick:()=>chrome.sidePanel?.open?chrome.windows.getCurrent().then(a=>{a.id&&chrome.sidePanel.open({windowId:a.id})}):chrome.runtime.openOptionsPage(),className:"w-full",variant:"secondary",children:"Open Side Panel"})]})]});if(o==="extracting"||o==="evaluating")return e.jsxs("div",{className:"p-6 bg-white flex flex-col items-center justify-center min-h-[200px]",children:[e.jsx(F,{size:32,className:"text-blue-600 animate-spin mb-3"}),e.jsx("p",{className:"text-sm font-medium text-slate-700",children:k}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"This may take a minute..."})]});if(o==="error")return e.jsxs("div",{className:"p-4 bg-white",children:[e.jsxs("div",{className:"flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg mb-3",children:[e.jsx(O,{size:20,className:"text-red-500 shrink-0 mt-0.5"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-red-800",children:"Evaluation Failed"}),e.jsx("p",{className:"text-xs text-red-600 mt-1",children:n})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(l,{onClick:g,className:"w-full",variant:"primary",children:"Try Again"}),e.jsx(l,{onClick:()=>chrome.runtime.openOptionsPage(),className:"w-full",variant:"secondary",icon:e.jsx(b,{size:18}),children:"Settings"})]})]});if(o==="done"&&r){const a=r.maxScore>0?Math.round(r.totalScore/r.maxScore*100):0,i=a>=70?"text-emerald-600":a>=50?"text-amber-600":"text-rose-600",c=async()=>{try{const t=v(r),d=t.replace(/<[^>]*>/g,"").replace(/&nbsp;/g," "),m=new Blob([t],{type:"text/html"}),x=[new ClipboardItem({"text/html":m,"text/plain":new Blob([d])})];await navigator.clipboard.write(x),alert("✓ Feedback copied as rich HTML. Paste in Phitron modal.")}catch{try{const d=v(r);await navigator.clipboard.writeText(d),alert("✓ Copied (plaintext mode). Formatting may not work - use auto-fill instead.")}catch{alert("Failed to copy. Try again.")}}};return e.jsxs("div",{className:"p-4 bg-white",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx(C,{size:20,className:"text-emerald-500"}),e.jsx("h2",{className:"text-sm font-bold text-slate-900",children:"Evaluation Complete"})]}),e.jsxs("div",{className:"bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3 text-center",children:[e.jsxs("div",{className:`text-3xl font-bold ${i}`,children:[a,"%"]}),e.jsxs("div",{className:"text-sm text-slate-500 mt-1",children:[r.totalScore," / ",r.maxScore," marks"]})]}),e.jsx("div",{className:"space-y-1.5 mb-3 max-h-[200px] overflow-y-auto",children:r.questionResults.map((t,d)=>e.jsxs("div",{className:"flex items-center justify-between p-2 bg-gray-50 rounded text-xs",children:[e.jsxs("span",{className:"font-medium text-slate-700",children:["Q",t.questionNumber]}),e.jsxs("span",{className:`font-bold ${t.status==="complete"?"text-emerald-600":t.status==="partial"?"text-amber-600":"text-rose-600"}`,children:[t.awardedMarks,"/",t.maxMarks]})]},d))}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(l,{onClick:()=>L(r),className:"w-full",variant:"primary",children:"View Full Report"}),e.jsx(l,{onClick:c,className:"w-full",variant:"secondary",icon:e.jsx(T,{size:18}),children:"Copy Feedback"}),e.jsx(l,{onClick:()=>{s("idle"),p(null)},className:"w-full",variant:"secondary",children:"Evaluate Again"})]})]})}return null}async function D(o,s,n,u,r="balanced",p=!0){const k={lenient:"Be generous with marks. Award marks for effort and partial understanding. Only deduct marks for completely wrong answers.",balanced:"Apply fair academic standards. Award full marks for correct/excellent answers, partial marks for incomplete but correct answers, and no marks for wrong answers.",strict:"Apply rigorous standards. Deduct marks for any inaccuracies, incomplete explanations, or missing edge case handling."},h=p?"Also detect if answers show signs of AI generation (e.g., overly polished language, generic explanations, suspicious technical perfection). Flag answers with high AI likelihood using aiCopyPercentage (0-100).":"Do not perform AI detection. Set aiCopyPercentage to 0 for all answers.",g=`You are an expert academic evaluator for programming assignments.

I will give you the FULL content of a student's Colab notebook. The notebook contains:
- Assignment instructions and questions (with marks for each question)
- The student's code answers and outputs

IMPORTANT: You MUST identify ALL questions in the notebook. Look for patterns like "Question 01:", "Question 02:", etc. with their marks like "[Marks 05]", "[Marks 10]", "[Marks 20]". Do NOT stop early - read the ENTIRE notebook and evaluate EVERY question.

Grading Strictness: ${r.toUpperCase()}
${k[r]}

${h}

Your job:
1. Identify EVERY question and its allocated marks (read the full notebook!)
2. Find the student's answer/code for each question
3. Evaluate each answer fairly
4. Return a structured JSON result

Here is the notebook content:
---
${o.substring(0,1e5)}
---

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "questions": [
    {
      "questionNumber": "01",
      "questionTitle": "brief title of the question",
      "maxMarks": 5,
      "awardedMarks": 4,
      "status": "complete|partial|skipped",
      "summary": "brief assessment",
      "strengths": ["strength1"],
      "mistakes": ["mistake1"],
	      "suggestions": ["suggestion1"],
	      "rubricAlignment": "how well it meets the criteria",
	      "aiCopyPercentage": 0,
	      "confidence": "high|medium|low"
	    }
  ],
  "totalScore": 25,
  "maxScore": 30
}`,a=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify({model:u,messages:[{role:"system",content:"You are an expert academic evaluator. Evaluate student programming assignments fairly. Always respond with valid JSON only."},{role:"user",content:g}],temperature:.3,max_tokens:8e3,response_format:{type:"json_object"}})});if(!a.ok){const t=await a.json().catch(()=>({}));throw new Error(t.error?.message||`OpenAI API error: ${a.status}`)}const i=await a.json(),c=JSON.parse(i.choices[0].message.content);return{id:crypto.randomUUID(),assignmentId:"colab-direct",assignmentVersion:1,submissionId:"colab-direct",submissionName:s,strictness:r,totalScore:c.totalScore||0,maxScore:c.maxScore||0,generatedAt:new Date().toISOString(),questionResults:(c.questions||[]).map(t=>({questionId:t.questionNumber,questionNumber:t.questionNumber,awardedMarks:Math.max(0,t.awardedMarks||0),maxMarks:t.maxMarks||0,summary:t.summary||"",strengths:t.strengths||[],mistakes:t.mistakes||[],suggestions:t.suggestions||[],rubricAlignment:t.rubricAlignment||"",aiCopyPercentage:Math.min(Math.max(t.aiCopyPercentage||0,0),100),confidence:t.confidence||"medium",status:t.status||"complete"}))}}const J=E.createRoot(document.getElementById("popup-root"));J.render(e.jsx(I.StrictMode,{children:e.jsx(M,{children:e.jsx(B,{})})}));
