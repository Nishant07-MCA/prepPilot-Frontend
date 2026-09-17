import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  HelpCircle, 
  Code2, 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Terminal, 
  ExternalLink, 
  BookOpen, 
  Trophy, 
  Check, 
  LogOut, 
  Lock, 
  Mail, 
  User as UserIcon,
  Sparkles
} from 'lucide-react';
import API from './api';

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [expandedWeek, setExpandedWeek] = useState(2);

  // Authentication & Dynamic Stats State
  const defaultStats = {
    dsaSolved: 0,
    correctMcqs: 0,
    totalAttempted: 0,
    accuracy: 0,
    roadmapTasks: 0,
    score: 100,
    streak: 1
  };

  // Agar user logged in nahi hai, toh null rahega
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('preppilot_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [userStats, setUserStats] = useState(() => {
    const savedStats = localStorage.getItem('preppilot_stats');
    return savedStats ? JSON.parse(savedStats) : {
      dsaSolved: 48,
      correctMcqs: 31,
      totalAttempted: 40,
      accuracy: 77.5,
      roadmapTasks: 12,
      score: 1420,
      streak: 7
    };
  });

  const [solvedProblemIds, setSolvedProblemIds] = useState({});
  const [authMode, setAuthMode] = useState('login'); // 'login' ya 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    API.get('/questions')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setQuestions(res.data);
        }
      })
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('preppilot_stats', JSON.stringify(userStats));
    }
  }, [userStats, user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const res = await API.post(endpoint, formData);
      
      if (res.data.token) {
        localStorage.setItem('preppilot_token', res.data.token);
      }

      const userData = res.data.user || { 
        name: formData.name || formData.email.split('@')[0], 
        email: formData.email,
        isLoggedIn: true 
      };

      const freshStats = authMode === 'register' 
        ? defaultStats 
        : { dsaSolved: 48, correctMcqs: 31, totalAttempted: 40, accuracy: 77.5, roadmapTasks: 12, score: 1420, streak: 7 };

      setUser(userData);
      setUserStats(freshStats);
      setSelectedOptions({});
      setShowExplanation({});
      setSolvedProblemIds({});
      localStorage.setItem('preppilot_user', JSON.stringify(userData));
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication error. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('preppilot_token');
    localStorage.removeItem('preppilot_user');
    localStorage.removeItem('preppilot_stats');
    setUser(null);
    setUserStats(defaultStats);
    setSelectedOptions({});
    setShowExplanation({});
    setSolvedProblemIds({});
  };

  const handleOptionClick = (question, chosenOption, chosenIndex) => {
    if (selectedOptions[question._id]) return;

    setSelectedOptions(prev => ({ 
      ...prev, 
      [question._id]: { text: chosenOption, index: chosenIndex } 
    }));
    setShowExplanation(prev => ({ ...prev, [question._id]: true }));

    const isCorrect = 
      chosenOption === question.correctAnswer ||
      chosenOption === question.correctOption ||
      chosenIndex === question.correctAnswer ||
      chosenIndex === question.correctOption;

    setUserStats(prev => {
      const newTotal = prev.totalAttempted + 1;
      const newCorrect = isCorrect ? prev.correctMcqs + 1 : prev.correctMcqs;
      const newAccuracy = Number(((newCorrect / newTotal) * 100).toFixed(1));
      const newScore = isCorrect ? prev.score + 25 : prev.score;

      return {
        ...prev,
        totalAttempted: newTotal,
        correctMcqs: newCorrect,
        accuracy: newAccuracy,
        score: newScore
      };
    });
  };

  const handleProblemSolved = (probTitle) => {
    if (solvedProblemIds[probTitle]) return;

    setSolvedProblemIds(prev => ({ ...prev, [probTitle]: true }));
    setUserStats(prev => ({
      ...prev,
      dsaSolved: prev.dsaSolved + 1,
      score: prev.score + 50
    }));
  };

  const filteredQuestions = selectedCategory === 'ALL' 
    ? questions 
    : questions.filter(q => q.category?.toUpperCase() === selectedCategory);

  const categories = ['ALL', 'OOP', 'DBMS', 'OS', 'DSA'];

  // ==========================================
  // GATEKEEPER: AGAR USER LOGIN NAHI HAI TOH FULL SCREEN AUTH DIKHEGI
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-200 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 z-10">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
            <Terminal size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">PrepPilot</h1>
            <p className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">SDE Placement Readiness Portal</p>
          </div>
        </div>

        {/* Auth Box */}
        <div className="bg-[#12192c] border border-slate-800/80 rounded-2xl w-full max-w-md p-8 relative shadow-2xl z-10">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {authMode === 'login' ? 'Welcome back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login' ? 'Sign in to continue your placement track' : 'Begin your targeted placement prep roadmap'}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles size={18} />
            </div>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <XCircle size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    placeholder="Nishant Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0e1424] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  required
                  placeholder="nishant@nitrr.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0e1424] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#0e1424] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-bold py-3 rounded-xl transition-all mt-2 cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              {authLoading ? 'Verifying...' : authMode === 'login' ? 'Sign In to Portal' : 'Register & Start Prep'}
            </button>
          </form>

          {/* Switch Login / Register */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              {authMode === 'login' ? "Don't have an account yet?" : "Already registered with PrepPilot?"}{' '}
              <button 
                type="button"
                onClick={() => {
                  setAuthMode(m => m === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-2 ml-1"
              >
                {authMode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD VIEW (AFTER SUCCESSFUL LOGIN)
  // ==========================================
  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-200 font-sans overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0e1424] flex flex-col justify-between p-4 shrink-0">
        <div>
          <div 
            className="flex items-center gap-3 px-3 py-4 mb-6 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Terminal size={22} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">PrepPilot</span>
              <span className="block text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">SDE Prep Portal</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'roadmap', label: 'Roadmap & Tasks', icon: Map },
              { id: 'mcqs', label: 'Practice MCQs', icon: HelpCircle },
              { id: 'coding', label: 'Coding Arena', icon: Code2 },
              { id: 'analytics', label: 'Performance', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-400 shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                Target: SDE-1
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Sign Out"
            className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0e1424]/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">Target Role:</span>
            <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
              Full Stack / SDE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
              <Flame size={16} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300">{userStats.streak} Days Streak</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
              <span className="text-xs font-mono text-slate-400">Atlas Live</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user.name} 🚀</h1>
                  <p className="text-sm text-slate-400">Track tasks, evaluate concepts, and monitor your placement performance live.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('roadmap')}
                  className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  Resume Week 2 Plan <ChevronRight size={15} />
                </button>
              </div>

              {/* Dynamic KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#12192c] border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-slate-400">DSA Solved</span>
                    <Code2 size={18} className="text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{userStats.dsaSolved} <span className="text-xs font-medium text-slate-500">/ 150</span></div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (userStats.dsaSolved / 150) * 100)}%` }} />
                  </div>
                </div>

                <div className="bg-[#12192c] border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-slate-400">Core CS Accuracy</span>
                    <HelpCircle size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{userStats.accuracy}%</div>
                  <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={12} /> {userStats.correctMcqs} of {userStats.totalAttempted} Correct
                  </p>
                </div>

                <div className="bg-[#12192c] border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-slate-400">Roadmap Tasks</span>
                    <Map size={18} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{userStats.roadmapTasks} <span className="text-xs font-medium text-slate-500">/ 16 Done</span></div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(userStats.roadmapTasks / 16) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-[#12192c] border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-slate-400">Global Score</span>
                    <Trophy size={18} className="text-violet-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{userStats.score.toLocaleString()} <span className="text-xs font-medium text-slate-500">XP</span></div>
                  <p className="text-[11px] text-violet-400 mt-2 font-medium">Top Rank Tier</p>
                </div>
              </div>

              {/* Quick Jump Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setActiveTab('mcqs')}
                  className="bg-[#12192c] border border-slate-800 hover:border-indigo-500/50 p-5 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-400" /> Practice Core CS
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Live questions from MongoDB Atlas. Earn +25 XP per answer!</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>

                <div 
                  onClick={() => setActiveTab('coding')}
                  className="bg-[#12192c] border border-slate-800 hover:border-emerald-500/50 p-5 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 size={16} className="text-emerald-400" /> Curated Coding Problems
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Solve interview problems on LeetCode. Earn +50 XP!</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-500" />
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ROADMAP & TASKS */}
          {activeTab === 'roadmap' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Map size={22} className="text-amber-400" /> SDE Placement Track: 6-Week Roadmap
                </h2>
                <p className="text-xs text-slate-400 mt-1">Click on any week to view detailed sub-topics and milestones</p>
              </div>

              <div className="space-y-3">
                {[
                  { 
                    id: 1,
                    week: "Week 1", 
                    title: "Arrays, Strings, Two Pointers & Sliding Window", 
                    status: "Completed", 
                    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                    tasks: [
                      "Kadane's Algorithm & Prefix Sum patterns",
                      "Two Pointers: 3Sum, Container With Most Water",
                      "Sliding Window: Longest Substring Without Repeating Characters",
                      "In-place string manipulations and Palindrome verification"
                    ]
                  },
                  { 
                    id: 2,
                    week: "Week 2", 
                    title: "Binary Search, Recursion & Backtracking", 
                    status: "In Progress", 
                    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    tasks: [
                      "Binary Search on Answer Space (Aggressive Cows, Book Allocation)",
                      "Search in Rotated Sorted Array",
                      "Subsets, Permutations & Combinations generator",
                      "Classic Backtracking: N-Queens & Sudoku Solver"
                    ]
                  },
                  { 
                    id: 3,
                    week: "Week 3", 
                    title: "Linked Lists, Stacks, Queues & Priority Queues", 
                    status: "Upcoming", 
                    color: "text-slate-400 bg-slate-800/40 border-slate-700",
                    tasks: [
                      "Reverse Linked List in K-Groups & Cycle Detection (Floyd's)",
                      "Next Greater Element using Monotonic Stack",
                      "LRU Cache implementation with Doubly Linked List & Hash Map",
                      "Top K Frequent Elements using Min-Heap"
                    ]
                  },
                  { 
                    id: 4,
                    week: "Week 4", 
                    title: "Binary Trees, BST & Graph Traversals (BFS/DFS)", 
                    status: "Upcoming", 
                    color: "text-slate-400 bg-slate-800/40 border-slate-700",
                    tasks: [
                      "Lowest Common Ancestor (LCA) in Binary Tree & BST",
                      "Diameter & Maximum Path Sum of Binary Tree",
                      "Graph Traversals: Cycle Detection, Topological Sort (Kahn's)",
                      "Shortest Path: Dijkstra's Algorithm & Bellman-Ford"
                    ]
                  },
                  { 
                    id: 5,
                    week: "Week 5", 
                    title: "Dynamic Programming & Greedy Algorithms", 
                    status: "Upcoming", 
                    color: "text-slate-400 bg-slate-800/40 border-slate-700",
                    tasks: [
                      "0/1 Knapsack & Unbounded Knapsack patterns",
                      "Longest Common Subsequence (LCS) & Edit Distance",
                      "Coin Change & Partition Equal Subset Sum",
                      "Greedy Job Sequencing with Deadlines & Activity Selection"
                    ]
                  },
                  { 
                    id: 6,
                    week: "Week 6", 
                    title: "Core CS: Operating Systems, DBMS & Computer Networks", 
                    status: "Upcoming", 
                    color: "text-slate-400 bg-slate-800/40 border-slate-700",
                    tasks: [
                      "OS: Process Scheduling, Mutex vs Semaphores, Deadlock Conditions",
                      "DBMS: ACID Guarantees, Indexing (B+ Trees), 1NF to BCNF",
                      "SQL: Complex JOINs, Window Functions, Aggregate Queries",
                      "CN: TCP Handshake, DNS Resolution, HTTP/HTTPS & WebSockets"
                    ]
                  },
                ].map((step) => {
                  const isExpanded = expandedWeek === step.id;
                  return (
                    <div 
                      key={step.id} 
                      className="bg-[#12192c] border border-slate-800 hover:border-slate-700 rounded-xl transition-all overflow-hidden"
                    >
                      <div 
                        onClick={() => setExpandedWeek(isExpanded ? null : step.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                            {step.week}
                          </span>
                          <span className="text-sm font-medium text-slate-200">{step.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${step.color}`}>
                            {step.status}
                          </span>
                          <ChevronRight 
                            size={16} 
                            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 border-t border-slate-800/80 bg-slate-900/30">
                          <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2.5">
                            Core Focus Areas:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {step.tasks.map((task, tidx) => (
                              <div key={tidx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                                <CheckCircle2 size={14} className="text-indigo-400 shrink-0" />
                                <span>{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 3: PRACTICE MCQS */}
          {activeTab === 'mcqs' && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen size={22} className="text-indigo-400" /> Core CS Practice Bank
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Live questions evaluated with real-time feedback and XP gains</p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#12192c] border border-slate-800 p-1 rounded-xl">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map((q) => {
                  const userChoice = selectedOptions[q._id];
                  const isAnswered = userChoice !== undefined;

                  return (
                    <div key={q._id} className="bg-[#12192c] border border-slate-800/90 hover:border-slate-700 p-5 rounded-xl flex flex-col justify-between transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[11px] font-bold tracking-wider uppercase bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                            {q.category}
                          </span>
                          <span className="text-xs font-medium text-slate-400">{q.difficulty}</span>
                        </div>

                        <p className="text-sm font-semibold text-slate-100 mb-4 leading-relaxed">
                          {q.questionText}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, idx) => {
                            const isCorrectOption = 
                              opt === q.correctAnswer ||
                              opt === q.correctOption ||
                              idx === q.correctAnswer ||
                              idx === q.correctOption;

                            const isUserSelected = 
                              userChoice?.text === opt || 
                              userChoice?.index === idx;

                            let optStyle = "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-indigo-500 hover:bg-slate-800/60 cursor-pointer";
                            
                            if (isAnswered) {
                              if (isCorrectOption) {
                                optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold cursor-default";
                              } else if (isUserSelected) {
                                optStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold cursor-default";
                              } else {
                                optStyle = "bg-slate-900/30 border-slate-800/40 text-slate-600 cursor-default";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={isAnswered}
                                onClick={() => handleOptionClick(q, opt, idx)}
                                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${optStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isCorrectOption && (
                                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                )}
                                {isAnswered && isUserSelected && !isCorrectOption && (
                                  <XCircle size={15} className="text-rose-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {showExplanation[q._id] && (
                        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg">
                          <span className="font-semibold text-indigo-400">Explanation: </span>
                          {q.explanation || "Evaluated according to core computer science principles."}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 4: CODING ARENA */}
          {activeTab === 'coding' && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 size={22} className="text-emerald-400" /> Curated Coding Arena
                </h2>
                <p className="text-xs text-slate-400 mt-1">Mark problems as solved to increment your DSA progress and score</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Two Sum", difficulty: "Easy", tags: "Array • Hash Table", url: "https://leetcode.com/problems/two-sum/" },
                  { title: "Valid Parentheses", difficulty: "Easy", tags: "Stack • String", url: "https://leetcode.com/problems/valid-parentheses/" },
                  { title: "Reverse Linked List", difficulty: "Easy", tags: "Linked List • Pointers", url: "https://leetcode.com/problems/reverse-linked-list/" },
                  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", tags: "Sliding Window • Set", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
                  { title: "Binary Tree Level Order Traversal", difficulty: "Medium", tags: "Tree • BFS", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
                  { title: "Merge Intervals", difficulty: "Medium", tags: "Array • Sorting", url: "https://leetcode.com/problems/merge-intervals/" }
                ].map((prob, idx) => {
                  const isSolved = solvedProblemIds[prob.title];
                  return (
                    <div key={idx} className="bg-[#12192c] border border-slate-800 p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-sm font-bold ${isSolved ? 'line-through text-slate-500' : 'text-white'}`}>
                            {prob.title}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            prob.difficulty === 'Easy' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{prob.tags}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleProblemSolved(prob.title)}
                          disabled={isSolved}
                          title={isSolved ? "Completed" : "Mark Done (+50 XP)"}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            isSolved 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                        <a 
                          href={prob.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                          Solve <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 5: PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 size={22} className="text-indigo-400" /> Placement Analytics & Readiness
                </h2>
                <p className="text-xs text-slate-400 mt-1">Detailed evaluation across core competencies</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-[#12192c] border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Core CS Accuracy</span>
                  <p className="text-2xl font-black text-white">{userStats.accuracy}%</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${userStats.accuracy}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">{userStats.correctMcqs} of {userStats.totalAttempted} Questions Answered Correctly</p>
                </div>

                <div className="p-5 bg-[#12192c] border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-slate-400">DSA Coverage</span>
                  <p className="text-2xl font-black text-white">{userStats.dsaSolved} Solved</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, (userStats.dsaSolved / 150) * 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-400">Target: 150 Core Interview Problems</p>
                </div>

                <div className="p-5 bg-[#12192c] border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-slate-400">Total Placement Score</span>
                  <p className="text-2xl font-black text-white">{userStats.score.toLocaleString()} XP</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[85%]" />
                  </div>
                  <p className="text-[11px] text-slate-400">Cumulative Experience Points Earned</p>
                </div>
              </div>
            </section>
          )}

        </div>
      </main>

    </div>
  );
}