import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lightbulb, 
  FileText, 
  Download, 
  Copy, 
  ChevronRight, 
  ChevronDown, 
  Code,
  Terminal,
  Settings,
  Sparkles,
  RefreshCw,
  MoreVertical,
  Maximize2,
  Play,
  Filter,
  Check,
  Cpu
} from 'lucide-react';

// --- MOCK DATA ---
const mockEvaluation = {
  student: "alex_smith_midterm.ipynb",
  assignment: "DL Midterm - Neural Networks",
  totalScore: 27,
  maxScore: 45,
  questions: [
    {
      id: "q1",
      title: "Q1: Neural Network Architecture",
      status: "success",
      score: 10,
      max: 10,
      correct: [
        "Architecture layers correctly identified",
        "Activation functions mapped to correct layers"
      ],
      mistakes: [],
      suggestions: ["For production, consider mentioning batch normalization."],
      codeAnalysis: null,
      rubric: "Understands basic feedforward architectures (10 pts)"
    },
    {
      id: "q2",
      title: "Q2: Gradient Calculation",
      status: "warning",
      score: 12,
      max: 20,
      correct: ["Chain rule applied correctly for the first hidden layer"],
      mistakes: ["Sign error in the final derivative step"],
      suggestions: ["Double check the derivative of the Sigmoid function: it should be σ(x)(1-σ(x))"],
      codeAnalysis: null,
      rubric: "Accurate manual backprop calculation (20 pts)"
    },
    {
      id: "q3",
      title: "Q3: Forward Pass Implementation",
      status: "error",
      score: 5,
      max: 15,
      correct: ["Function signature and matrix dot products are correct"],
      mistakes: ["Sigmoid formula is incorrect (missing negative exponent)"],
      suggestions: ["Use np.exp(-x) instead of np.exp(x) to prevent overflow and calculate correctly."],
      codeAnalysis: {
        outputMismatch: "Expected [0.5, 0.73], Got [0.5, 1.2]",
        edgeCase: "Fails on large negative inputs (causes math overflow)"
      },
      rubric: "Working vectorized numpy implementation (15 pts)"
    }
  ]
};

// --- COMPONENTS ---

const StatusIcon = ({ status, size = 20 }) => {
  switch (status) {
    case 'success': return <CheckCircle2 size={size} className="text-emerald-500" />;
    case 'warning': return <AlertTriangle size={size} className="text-amber-500" />;
    case 'error': return <XCircle size={size} className="text-rose-500" />;
    default: return null;
  }
};

const StatusBadge = ({ status }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100/50",
    warning: "bg-amber-100 text-amber-800 border-amber-200 shadow-amber-100/50",
    error: "bg-rose-100 text-rose-800 border-rose-200 shadow-rose-100/50",
  };
  
  const labels = {
    success: "Perfect",
    warning: "Partial",
    error: "Needs Work"
  };

  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border shadow-sm ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const CircularProgress = ({ score, max }) => {
  const percentage = (score / max) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center drop-shadow-md">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-100" />
        <circle 
          cx="40" cy="40" r={radius} 
          stroke="url(#gradient)" 
          strokeWidth="5" 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out" 
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-800 leading-none">{score}</span>
        <span className="text-[10px] text-slate-400 font-bold">/{max}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedQuestion, setSelectedQuestion] = useState("q3");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [filter, setFilter] = useState('all'); // all, issues, perfect

  const filteredQuestions = mockEvaluation.questions.filter(q => {
    if (filter === 'issues') return q.status !== 'success';
    if (filter === 'perfect') return q.status === 'success';
    return true;
  });

  const handleReEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => setIsEvaluating(false), 1500);
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* LEFT SIDE: Simulated Colab Environment */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-200 overflow-y-auto relative">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

        {/* Fake Colab Header */}
        <div className="h-14 border-b border-slate-200 flex items-center px-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-md shadow-inner flex items-center justify-center text-white font-bold text-lg">
              CO
            </div>
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                {mockEvaluation.student}
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Saved</span>
              </div>
              <div className="text-[11px] text-slate-500 flex gap-3 font-medium mt-0.5">
                <span className="hover:text-slate-800 cursor-pointer">File</span>
                <span className="hover:text-slate-800 cursor-pointer">Edit</span>
                <span className="hover:text-slate-800 cursor-pointer">View</span>
                <span className="hover:text-slate-800 cursor-pointer">Insert</span>
                <span className="hover:text-slate-800 cursor-pointer">Runtime</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5 items-end">
               <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <Cpu size={12} /> RAM <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="w-1/3 bg-green-400 h-full"></div></div>
               </div>
               <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <div className="w-3 h-3 border border-slate-400 rounded-sm"></div> DISK <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="w-2/3 bg-blue-400 h-full"></div></div>
               </div>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <button className="bg-slate-800 hover:bg-slate-700 transition-colors text-white text-xs px-4 py-1.5 rounded-md font-semibold shadow-sm flex items-center gap-2">
              Share
            </button>
          </div>
        </div>

        {/* Fake Colab Content */}
        <div className="p-8 max-w-4xl mx-auto w-full space-y-10 relative z-10 pb-32">
          
          {/* ========================================== */}
          {/* QUESTION 1 */}
          {/* ========================================== */}
          <div className="space-y-4" onClick={() => setSelectedQuestion('q1')}>
            {/* Cell: Markdown */}
            <div className="group flex gap-3 cursor-pointer">
              <div className="w-10 pt-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center text-slate-400">
                  <MoreVertical size={14} />
                </div>
              </div>
              <div className="flex-1 text-slate-800 prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold border-b pb-2 text-slate-800 flex items-center justify-between">
                  Part 1: Neural Network Architecture
                  <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">10 Points</span>
                </h2>
                <p className="text-slate-600">Define the layers and activation functions for the network.</p>
              </div>
            </div>

            {/* Cell: Code */}
            <div className={`group flex gap-3 transition-all duration-300 cursor-pointer ${selectedQuestion === 'q1' ? '-mx-4 px-4 py-3 bg-emerald-50/40 rounded-xl' : ''}`}>
              <div className="w-10 pt-3 flex flex-col items-center gap-1 relative z-10">
                <div className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-all">
                  <Play size={14} className="ml-0.5 fill-current" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">[1]</div>
              </div>

              <div className={`flex-1 rounded-xl bg-white overflow-hidden shadow-sm border transition-colors duration-300 ${selectedQuestion === 'q1' ? 'border-emerald-300 ring-4 ring-emerald-500/10' : 'border-slate-200'}`}>
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="ml-2 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Python</span>
                  </div>
                </div>
                <div className="flex bg-[#fcfcfc]">
                  <div className="w-10 bg-slate-50 text-slate-400 font-mono text-right pr-2 py-4 select-none border-r border-slate-100 text-xs leading-6 opacity-70">
                    1<br/>2<br/>3<br/>4<br/>5
                  </div>
                  <div className="p-4 font-mono text-sm overflow-x-auto flex-1 leading-6">
                    <div className="text-slate-600"><span className="text-pink-600 font-medium">def</span> <span className="text-blue-600 font-medium">get_architecture</span>():</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 font-medium">return</span> [</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<span className="text-emerald-600">'Dense'</span>, <span className="text-purple-600">128</span>, <span className="text-emerald-600">'relu'</span>),</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(<span className="text-emerald-600">'Dense'</span>, <span className="text-purple-600">10</span>, <span className="text-emerald-600">'softmax'</span>)</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;]</div>
                  </div>
                </div>
                
                {/* Inline UI for Q1 */}
                {selectedQuestion === 'q1' && (
                  <div className="border-t border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-4 m-3 mt-0 rounded-lg shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-100 p-1.5 rounded-full mt-0.5">
                        <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-emerald-900 block mb-0.5">Perfect Implementation</span>
                        <span className="text-sm text-slate-700 leading-snug">Architecture layers correctly identified and activation functions mapped to the correct layers.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* QUESTION 2 */}
          {/* ========================================== */}
          <div className="space-y-4" onClick={() => setSelectedQuestion('q2')}>
            {/* Cell: Markdown */}
            <div className="group flex gap-3 cursor-pointer">
              <div className="w-10 pt-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center text-slate-400">
                  <MoreVertical size={14} />
                </div>
              </div>
              <div className="flex-1 text-slate-800 prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold border-b pb-2 text-slate-800 flex items-center justify-between">
                  Part 2: Gradient Calculation
                  <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">20 Points</span>
                </h2>
                <p className="text-slate-600">Calculate the gradients for the hidden layer during backpropagation.</p>
              </div>
            </div>

            {/* Cell: Code */}
            <div className={`group flex gap-3 transition-all duration-300 cursor-pointer ${selectedQuestion === 'q2' ? '-mx-4 px-4 py-3 bg-amber-50/40 rounded-xl' : ''}`}>
              <div className="w-10 pt-3 flex flex-col items-center gap-1 relative z-10">
                <div className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:border-amber-200 group-hover:text-amber-600 transition-all">
                  <Play size={14} className="ml-0.5 fill-current" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">[2]</div>
              </div>

              <div className={`flex-1 rounded-xl bg-white overflow-hidden shadow-sm border transition-colors duration-300 ${selectedQuestion === 'q2' ? 'border-amber-300 ring-4 ring-amber-500/10' : 'border-slate-200'}`}>
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="ml-2 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Python</span>
                  </div>
                </div>
                <div className="flex bg-[#fcfcfc]">
                  <div className="w-10 bg-slate-50 text-slate-400 font-mono text-right pr-2 py-4 select-none border-r border-slate-100 text-xs leading-6 opacity-70">
                    1<br/>2<br/>3<br/>4<br/>5
                  </div>
                  <div className="p-4 font-mono text-sm overflow-x-auto relative flex-1 leading-6">
                    <div className="text-slate-600"><span className="text-pink-600 font-medium">def</span> <span className="text-blue-600 font-medium">backward_pass</span>(dz2, w2, a1):</div>
                    <div className="text-slate-500">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-600"># Chain rule for hidden layer</span></div>
                    
                    <div className="relative inline-block w-full">
                      <div className="absolute inset-0 bg-amber-100/50 -mx-1 rounded pointer-events-none"></div>
                      <div className="px-1 -mx-1 border-b-2 border-dashed border-amber-500 relative z-10">
                        &nbsp;&nbsp;&nbsp;&nbsp;dz1 = np.dot(dz2, w2.T) * a1 * (<span className="text-purple-600">1</span> <span className="text-amber-600 font-bold">+</span> a1)
                      </div>
                    </div>
                    
                    <div className="text-slate-600 mt-2">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 font-medium">return</span> dz1</div>
                  </div>
                </div>

                {/* Inline UI for Q2 */}
                {selectedQuestion === 'q2' && (
                  <div className="border-t border-amber-200 bg-gradient-to-b from-amber-50/50 to-white p-4 m-3 mt-0 rounded-lg shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-amber-900 block mb-0.5">Sign Error Detected</span>
                        <span className="text-sm text-slate-700 leading-snug">Chain rule applied correctly, but the derivative of the Sigmoid function has a sign error.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-10 bg-white p-2.5 rounded-md border border-slate-200 shadow-sm">
                      <Lightbulb size={16} className="text-amber-500 flex-shrink-0" />
                      <span className="text-[13px] text-slate-700 font-mono">
                        <span className="text-slate-400">Try:</span> a1 * (1 <span className="text-emerald-600 font-black bg-emerald-100 px-1 rounded">-</span> a1)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* QUESTION 3 */}
          {/* ========================================== */}
          <div className="space-y-4" onClick={() => setSelectedQuestion('q3')}>
            {/* Cell 1: Markdown */}
            <div className="group flex gap-3 cursor-pointer">
              <div className="w-10 pt-2 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center text-slate-400">
                  <MoreVertical size={14} />
                </div>
              </div>
              <div className="flex-1 text-slate-800 prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold border-b pb-2 text-slate-800 flex items-center justify-between">
                  Part 3: Forward Pass
                  <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">15 Points</span>
                </h2>
                <p className="text-slate-600">Implement the forward pass using numpy. Ensure you use the vectorized form of the sigmoid function to handle array inputs efficiently.</p>
              </div>
            </div>

            {/* Cell 2: Code (The Error Cell) */}
            <div className={`group flex gap-3 transition-all duration-300 cursor-pointer ${selectedQuestion === 'q3' ? '-mx-4 px-4 py-3 bg-indigo-50/40 rounded-xl' : ''}`}>
              
              {/* Cell Actions */}
              <div className="w-10 pt-3 flex flex-col items-center gap-1 relative z-10">
                <div className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                  <Play size={14} className="ml-0.5 fill-current" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">[3]</div>
              </div>

              <div className={`flex-1 rounded-xl bg-white overflow-hidden shadow-sm border transition-colors duration-300 ${selectedQuestion === 'q3' ? 'border-indigo-300 ring-4 ring-indigo-500/10' : 'border-slate-200'}`}>
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="ml-2 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Python</span>
                  </div>
                </div>
                
                <div className="flex bg-[#fcfcfc]">
                  <div className="w-10 bg-slate-50 text-slate-400 font-mono text-right pr-2 py-4 select-none border-r border-slate-100 text-xs leading-6 opacity-70">
                    1<br/>2<br/>3<br/>4<br/>5<br/>6<br/>7
                  </div>
                  <div className="p-4 font-mono text-sm overflow-x-auto relative flex-1 leading-6">
                    <div className="text-slate-600"><span className="text-pink-600 font-medium">def</span> <span className="text-blue-600 font-medium">sigmoid</span>(x):</div>
                    <div className="text-slate-500">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-600">"""Compute sigmoid activation."""</span></div>
                    <div className="relative inline-block w-full">
                      <div className="absolute inset-0 bg-rose-100/50 -mx-1 rounded pointer-events-none"></div>
                      <div className="px-1 -mx-1 border-b-2 border-dashed border-rose-500 relative z-10">
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 font-medium">return</span> <span className="text-purple-600">1</span> / (<span className="text-purple-600">1</span> + np.exp(x))
                      </div>
                    </div>
                    <div className="text-slate-600 mt-2"><span className="text-pink-600 font-medium">def</span> <span className="text-blue-600 font-medium">forward_pass</span>(X, W, b):</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;Z = np.dot(X, W) + b</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;A = sigmoid(Z)</div>
                    <div className="text-slate-600">&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 font-medium">return</span> A</div>
                  </div>
                </div>

                {/* Inline UI OVERLAY */}
                {selectedQuestion === 'q3' && (
                  <div className="border-t border-rose-200 bg-gradient-to-b from-rose-50/50 to-white p-4 m-3 mt-0 rounded-lg shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="bg-rose-100 p-1.5 rounded-full mt-0.5">
                        <XCircle size={16} className="text-rose-600 flex-shrink-0" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-rose-900 block mb-0.5">Logic Error Detected</span>
                        <span className="text-sm text-slate-700 leading-snug">The sigmoid formula requires a negative exponent. Positive exponents will cause large inputs to approach 0 instead of 1, and negative inputs will overflow.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-10 bg-white p-2.5 rounded-md border border-slate-200 shadow-sm">
                      <Lightbulb size={16} className="text-amber-500 flex-shrink-0" />
                      <span className="text-[13px] text-slate-700 font-mono">
                        <span className="text-slate-400">Try:</span> return 1 / (1 + np.exp(<span className="text-emerald-600 font-black bg-emerald-100 px-1 rounded">-</span>x))
                      </span>
                      <button className="ml-auto text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-1 rounded hover:bg-indigo-100 transition-colors">
                        Apply Fix
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* RIGHT SIDE: Extension Side Panel */}
      <div className="w-[440px] bg-[#fafafa] h-full flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-10 border-l border-slate-200 relative">
        
        {/* Panel Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-center shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
              <Sparkles size={18} className="text-indigo-300" />
            </div>
            <h1 className="font-bold tracking-wide text-[15px]">TA Evaluator <span className="text-indigo-300 font-medium">Pro</span></h1>
          </div>
          <div className="flex gap-3 text-slate-400 relative z-10">
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Settings size={16} /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Maximize2 size={16} /></button>
          </div>
        </div>

        {/* Score & Summary Card */}
        <div className="p-5 bg-white border-b border-slate-200 z-10">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2">
                <FileText size={12} /> Target Notebook
              </div>
              <h2 className="font-bold text-slate-800 text-[15px] leading-tight mb-1 truncate w-48" title={mockEvaluation.student}>
                {mockEvaluation.student}
              </h2>
              <p className="text-xs text-slate-500 truncate w-48">{mockEvaluation.assignment}</p>
            </div>
            
            <div className="pl-4 border-l border-slate-100">
               <CircularProgress score={mockEvaluation.totalScore} max={mockEvaluation.maxScore} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 pt-4 pb-2 bg-[#fafafa]">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
            >
              All ({mockEvaluation.questions.length})
            </button>
            <button 
              onClick={() => setFilter('issues')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${filter === 'issues' ? 'bg-rose-100 text-rose-800 border border-rose-200 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <AlertTriangle size={12} className={filter === 'issues' ? 'text-rose-600' : 'text-slate-400'} />
              Issues (2)
            </button>
            <button 
              onClick={() => setFilter('perfect')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${filter === 'perfect' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Check size={12} className={filter === 'perfect' ? 'text-emerald-600' : 'text-slate-400'} />
              Perfect (1)
            </button>
          </div>
        </div>

        {/* Question List (Master View) */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3 pb-32">
          
          {filteredQuestions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <CheckCircle2 size={32} className="text-emerald-400 mb-2 opacity-50" />
                <p className="text-sm font-medium">No questions matching this filter.</p>
             </div>
          ) : filteredQuestions.map((q) => {
            const isSelected = selectedQuestion === q.id;
            
            return (
              <div key={q.id} className="flex flex-col gap-2 group">
                <button 
                  onClick={() => setSelectedQuestion(isSelected ? null : q.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-white border-indigo-300 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] ring-1 ring-indigo-100 transform -translate-y-0.5' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                  
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <StatusIcon status={q.status} size={18} />
                      <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {q.title.split(':')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {q.score}/{q.max}
                      </span>
                      <div className={`p-1 rounded-full transition-colors ${isSelected ? 'bg-indigo-50' : 'bg-transparent group-hover:bg-slate-100'}`}>
                         {isSelected ? <ChevronDown size={14} className="text-indigo-500" /> : <ChevronRight size={14} className="text-slate-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 pl-7 pr-2 line-clamp-1 font-medium">
                    {q.title.split(':')[1].trim()}
                  </div>
                </button>

                {isSelected && (
                  <div className="ml-5 pl-4 border-l-2 border-indigo-100 py-2 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex justify-between items-center">
                       <StatusBadge status={q.status} />
                       <span className="text-[10px] text-slate-400 font-mono bg-white border px-1.5 py-0.5 rounded shadow-sm">Ref: {q.rubric}</span>
                    </div>

                    {q.correct.length > 0 && (
                      <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">Done Well</span>
                        </div>
                        <ul className="text-[13px] text-emerald-800 space-y-1.5 list-disc pl-5 marker:text-emerald-400">
                          {q.correct.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    {q.mistakes.length > 0 && (
                      <div className="bg-rose-50/50 rounded-xl p-3.5 border border-rose-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5">
                          <XCircle size={16} className="text-rose-600" />
                          <span className="text-xs font-black text-rose-900 uppercase tracking-wide">Errors</span>
                        </div>
                        <ul className="text-[13px] text-rose-800 space-y-1.5 list-disc pl-5 marker:text-rose-400">
                          {q.mistakes.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    {q.suggestions.length > 0 && (
                      <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Lightbulb size={16} className="text-amber-600" />
                          <span className="text-xs font-black text-amber-900 uppercase tracking-wide">Feedback & Advice</span>
                        </div>
                        <ul className="text-[13px] text-amber-800 space-y-1.5 list-disc pl-5 marker:text-amber-400">
                          {q.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    {q.codeAnalysis && (
                      <div className="bg-[#0f172a] rounded-xl p-3.5 shadow-lg border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-3 right-3 flex gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                           <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                           <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Terminal size={16} className="text-indigo-400" />
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Execution Log</span>
                        </div>
                        <div className="font-mono text-[11px] bg-slate-900/50 p-2.5 rounded-lg text-slate-300 space-y-2 border border-slate-800">
                          <div className="flex flex-col">
                            <span className="text-slate-500 mb-0.5">❯ Output Mismatch:</span>
                            <span className="text-rose-400 bg-rose-900/20 px-1.5 py-0.5 rounded w-fit">{q.codeAnalysis.outputMismatch}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-500 mb-0.5">❯ Edge Case Failure:</span>
                            <span className="text-amber-400 bg-amber-900/20 px-1.5 py-0.5 rounded w-fit">{q.codeAnalysis.edgeCase}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Floating Action Bar (Bottom Fixed) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent pt-10">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-2.5 flex flex-col gap-2">
            <button 
              onClick={handleReEvaluate}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-[13px] hover:from-indigo-500 hover:to-blue-500 hover:shadow-md transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              <RefreshCw size={16} className={isEvaluating ? "animate-spin" : ""} />
              {isEvaluating ? "Running AI Models..." : "Submit & Save Evaluation"}
            </button>
            
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <Download size={14} />
                Export JSON
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 hover:text-slate-800 transition-colors">
                <Copy size={14} />
                Copy Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}