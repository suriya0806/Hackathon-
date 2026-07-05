import React, { useState, useEffect } from "react";
import {
  FileText,
  MapPin,
  Volume2,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  AlertTriangle,
  Bookmark,
  Share2,
  HelpCircle,
  HelpCircle as QuizIcon,
  CheckCircle,
  Clock,
  ExternalLink,
  Bot,
  User,
  GraduationCap
} from "lucide-react";
import GlassCard from "./GlassCard";
import MapComponent from "./MapComponent";
import VoiceAssistant from "./VoiceAssistant";
import PdfGenerator from "./PdfGenerator";
import { translations } from "../utils/translations";
import { Language, UserProfile, Complaint, LandmarkCase, GovernmentScheme } from "../types";

interface CitizenDashboardProps {
  user: UserProfile;
  language: Language;
  onUpdateUser: (updated: any) => void;
}

export default function CitizenDashboard({ user, language, onUpdateUser }: CitizenDashboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<"grievances" | "rights" | "schemes" | "assistant" | "learning" | "cases" | "history">("grievances");

  const [dailyFact, setDailyFact] = useState("Loading today's inspiring constitutional fact...");
  
  // Grievance Portal form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Potholes");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [location, setLocation] = useState({ lat: 13.0827, lng: 80.2707, address: "Ward 4 Office, Chennai" });
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [voiceInputActive, setVoiceInputActive] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Complaints list
  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [selectedTrackComplaint, setSelectedTrackComplaint] = useState<Complaint | null>(null);
  
  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; content: string }[]>([
    { role: "model", content: "Hello! I am your AI Constitutional Assistant. Ask me to explain any Article, Fundamental Right, Amendment, or recommend Government Departments." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Schemes finder
  const [schemeState, setSchemeState] = useState("All States");
  const [schemeAge, setSchemeAge] = useState<number>(18);
  const [schemeGender, setSchemeGender] = useState<"all" | "male" | "female">("all");
  const [schemeOcc, setSchemeOcc] = useState("Student");
  const [schemeIncome, setSchemeIncome] = useState<number>(150000);
  const [recommendedSchemes, setRecommendedSchemes] = useState<GovernmentScheme[]>([]);
  const [searchingSchemes, setSearchingSchemes] = useState(false);

  // Quiz state
  const [quizDiff, setQuizDiff] = useState<"easy" | "medium" | "hard">("medium");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizAns, setSelectedQuizAns] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Landmark cases & articles
  const [landmarkCasesList, setLandmarkCasesList] = useState<LandmarkCase[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDailyFact();
    fetchComplaints();
    fetchStaticResources();
  }, []);

  const fetchDailyFact = async () => {
    try {
      const res = await fetch("/api/daily-fact");
      const data = await res.json();
      setDailyFact(data.fact);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      setMyComplaints(data.filter((c: any) => c.reporter.email === user.email || c.reporter.isAnonymous === false));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaticResources = async () => {
    try {
      const res1 = await fetch("/api/landmark-cases");
      const cases = await res1.json();
      setLandmarkCasesList(cases);

      const res2 = await fetch("/api/articles");
      const arts = await res2.json();
      setArticlesList(arts);

      const res3 = await fetch("/api/constitutional-news");
      const news = await res3.json();
      setNewsList(news);
    } catch (e) {
      console.error(e);
    }
  };

  // Image Upload helper
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Complaint
  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          location,
          reporter: { name: user.name, email: user.email },
          isAnonymous,
          base64Image,
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setBase64Image(null);
        setSubmitSuccess(true);
        fetchComplaints();
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Chat request
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          language,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "model", content: data.content }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "model", content: "Apologies, the legal servers are busy. Please retry in a moment." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Find Schemes
  const findEligibleSchemes = async () => {
    setSearchingSchemes(true);
    try {
      const res = await fetch("/api/schemes");
      const data = await res.json();
      
      // Real client-side rule filter
      const eligible = data.filter((sch: GovernmentScheme) => {
        const matchesState = sch.state === "All States" || sch.state === schemeState;
        const matchesAge = schemeAge >= sch.eligibility.minAge && schemeAge <= sch.eligibility.maxAge;
        const matchesGender = sch.eligibility.gender === "all" || sch.eligibility.gender === schemeGender;
        const matchesIncome = schemeIncome <= sch.eligibility.maxIncome;
        return matchesState && matchesAge && matchesGender && matchesIncome;
      });
      setRecommendedSchemes(eligible);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingSchemes(false);
    }
  };

  // Generate dynamic quiz from server
  const loadQuiz = async () => {
    setQuizLoading(true);
    setQuizFinished(false);
    setQuizIndex(0);
    setSelectedQuizAns(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: quizDiff }),
      });
      const questions = await res.json();
      setQuizQuestions(questions);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswerSubmit = () => {
    if (selectedQuizAns === null) return;
    setQuizSubmitted(true);
    const correct = quizQuestions[quizIndex].correctAnswerIndex === selectedQuizAns;
    if (correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleQuizNext = () => {
    setSelectedQuizAns(null);
    setQuizSubmitted(false);
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      
      // Reward citizen: update streak, score certificates
      const finalPercentage = Math.round((quizScore / quizQuestions.length) * 100);
      const newCert = {
        id: `cert-${Date.now()}`,
        title: `${quizDiff.toUpperCase()} Constitution Challenge`,
        date: new Date().toLocaleDateString(),
        score: finalPercentage,
      };

      const updatedUser = {
        ...user,
        streak: user.streak + 1,
        quizScores: [...(user.quizScores || []), { date: new Date().toISOString(), score: finalPercentage, difficulty: quizDiff }],
        certificates: finalPercentage >= 70 ? [...(user.certificates || []), newCert] : (user.certificates || []),
      };

      onUpdateUser(updatedUser);
    }
  };

  return (
    <div id="citizen-dashboard" className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Daily Fact Ticker as a beautiful Bento Card */}
        <div className="mb-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-5 shadow-sm border border-orange-400/20 flex flex-col sm:flex-row sm:items-center gap-3 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>{t.dailyFact}</span>
          </div>
          <p className="text-sm font-serif italic text-white/95 leading-relaxed">{dailyFact}</p>
        </div>

        {/* Module Nav Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
          <button
            onClick={() => setActiveTab("grievances")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "grievances"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Grievance Portal</span>
          </button>
          
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "history"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span>{t.complaintHistory}</span>
          </button>

          <button
            onClick={() => setActiveTab("assistant")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "assistant"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <Bot className="w-5 h-5 shrink-0" />
            <span>AI Law Guide</span>
          </button>

          <button
            onClick={() => setActiveTab("rights")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "rights"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Know Your Rights</span>
          </button>

          <button
            onClick={() => setActiveTab("schemes")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "schemes"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <GraduationCap className="w-5 h-5 shrink-0" />
            <span>Scheme Finder</span>
          </button>

          <button
            onClick={() => setActiveTab("learning")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "learning"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <QuizIcon className="w-5 h-5 shrink-0" />
            <span>AI Quiz Arena</span>
          </button>

          <button
            onClick={() => setActiveTab("cases")}
            className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center text-center gap-1.5 border ${
              activeTab === "cases"
                ? "bg-indigo-600 text-white border-indigo-500 font-extrabold"
                : "bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            }`}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span>Landmark Cases</span>
          </button>
        </div>

        {/* 1. GRIEVANCES PORTAL */}
        {activeTab === "grievances" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <GlassCard className="p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-2">
                <AlertTriangle className="w-5 h-5 text-indigo-600" />
                <span>{t.submitComplaint}</span>
              </h3>

              {submitSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold">
                  Grievance successfully submitted and verified by AI. A highway department crew has been notified!
                </div>
              )}

              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">Subject / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief headline of grievance (e.g. Broken water pipeline, dark street)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">{t.category}</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option>Potholes</option>
                      <option>Water Leakage</option>
                      <option>Street Light Failure</option>
                      <option>Garbage Collection</option>
                      <option>Drainage Problems</option>
                      <option>Electricity Issues</option>
                      <option>Flooding</option>
                      <option>Public Safety</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">Attach Before Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-600 hover:file:bg-indigo-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">Details & Impact</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="State details, location landmarks, and hazard impact for automatic AI verification analysis..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-500 dark:text-neutral-400 select-none">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(!isAnonymous)}
                      className="accent-indigo-600"
                    />
                    <span>{t.anonymous}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-700 text-white font-bold py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>{submitting ? "Analyzing & Filing..." : "Submit to AI Governance Engine"}</span>
                </button>
              </form>
            </GlassCard>

            {/* Interactive Location Map */}
            <div className="space-y-6">
              <GlassCard className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Select Location Site</span>
                  <span className="text-[10px] text-slate-500">Address Auto-Sync active</span>
                </div>
                <MapComponent
                  interactive={true}
                  selectedLocation={location}
                  onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })}
                />
                <div className="mt-3 p-3 bg-neutral-100 dark:bg-neutral-950/40 rounded-xl text-xs border border-neutral-200/50 dark:border-neutral-800 flex items-start gap-2 text-neutral-600 dark:text-neutral-400">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Current Address:</span>
                    <p className="mt-0.5 leading-relaxed font-medium">{location.address}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Assistant Help inside submit */}
              <VoiceAssistant language={language} />
            </div>
          </div>
        )}

        {/* 2. COMPLAINT HISTORY & TRACKING */}
        {activeTab === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider mb-2">My Registered Grievances</h3>
              {myComplaints.length === 0 ? (
                <GlassCard className="p-6 text-center text-xs text-neutral-500">
                  No grievances found under your profile. Let's submit a complaint to test real-time AI dispatching!
                </GlassCard>
              ) : (
                myComplaints.map((comp) => (
                  <GlassCard
                    key={comp.id}
                    onClick={() => setSelectedTrackComplaint(comp)}
                    className={`p-4 border ${
                      selectedTrackComplaint?.id === comp.id
                        ? "border-indigo-500 bg-indigo-500/5"
                        : "border-neutral-200/40 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">{comp.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        comp.status === "completed"
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 animate-pulse"
                      }`}>
                        {comp.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="font-bold text-xs line-clamp-1 text-neutral-900 dark:text-white mb-1">{comp.title}</p>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mb-2">{comp.description}</p>
                    
                    <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-400">
                      <span>Category: {comp.category}</span>
                      <span className="capitalize text-red-500">Priority: {comp.severity}</span>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>

            {/* Tracking detail */}
            <div className="lg:col-span-2">
              {selectedTrackComplaint ? (
                <div className="space-y-6">
                  <GlassCard className="p-6">
                    <div className="flex justify-between items-start border-b border-neutral-200/40 dark:border-neutral-800 pb-4 mb-4">
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Live Grievance Tracking Timeline</span>
                        <h4 className="font-bold text-base mt-1">{selectedTrackComplaint.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">{selectedTrackComplaint.id}</span>
                    </div>

                    {/* Progress Percent Bar */}
                    <div className="mb-8">
                      <div className="flex justify-between text-xs text-neutral-500 font-bold mb-1">
                        <span>Work Progression</span>
                        <span>{selectedTrackComplaint.progress}% Complete</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${selectedTrackComplaint.progress}%` }} />
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative border-l-2 border-neutral-200 dark:border-neutral-800 pl-6 ml-3 space-y-6">
                      {selectedTrackComplaint.history.map((h, idx) => (
                        <div key={idx} className="relative">
                          {/* Circle Node */}
                          <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white dark:border-neutral-950 flex items-center justify-center shadow" />
                          <div>
                            <span className="text-[10px] font-mono text-neutral-400">{new Date(h.timestamp).toLocaleTimeString()}</span>
                            <p className="text-xs font-bold capitalize text-neutral-900 dark:text-white mt-0.5">{h.status.replace("_", " ")}</p>
                            <p className="text-xs text-neutral-500 mt-1 leading-relaxed font-medium">{h.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* PDF download letter tool */}
                  <PdfGenerator type="complaint" data={{ complaint: selectedTrackComplaint }} />
                </div>
              ) : (
                <GlassCard className="p-8 text-center text-xs text-neutral-500">
                  Select a registered grievance from the history feed to track its live completion progress timeline, download its complaint letter, or view site engineer assignments.
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {/* 3. AI CHATBOT LAW GUIDE */}
        {activeTab === "assistant" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GlassCard className="p-6 h-[500px] flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 border-b border-neutral-200/40 dark:border-neutral-800 pb-2 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span>Real-Time AI Constitutional Law Guide</span>
                  </h3>

                  {/* Messages container */}
                  <div className="space-y-4 h-[340px] overflow-y-auto pr-2">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none shadow"
                            : "bg-neutral-100 dark:bg-neutral-950/40 text-neutral-800 dark:text-neutral-300 rounded-tl-none border border-neutral-200/50 dark:border-neutral-800"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-2 text-xs text-neutral-400 font-semibold animate-pulse">
                        <Bot className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span>AI Legal Assistant is referencing Constitution...</span>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-neutral-200/40 dark:border-neutral-800">
                  <input
                    type="text"
                    placeholder="e.g. Can my fundamental rights be suspended during Emergency?"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-indigo-700 transition-all"
                  >
                    Ask Law Assist
                  </button>
                </form>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <VoiceAssistant language={language} />
              
              <GlassCard className="p-4">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">Suggested Legal Queries</span>
                <div className="space-y-2 text-xs">
                  <button onClick={() => setChatInput("What is Article 21 and Maneka Gandhi case?")} className="w-full text-left p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg hover:border-indigo-500/20 border border-transparent transition-all">
                    "What is Article 21 and Maneka Gandhi case?"
                  </button>
                  <button onClick={() => setChatInput("Explain the golden triangle of Indian Constitution.")} className="w-full text-left p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg hover:border-indigo-500/20 border border-transparent transition-all">
                    "Explain the golden triangle of Indian Constitution."
                  </button>
                  <button onClick={() => setChatInput("Tell me my Fundamental Duties under 51A.")} className="w-full text-left p-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg hover:border-indigo-500/20 border border-transparent transition-all">
                    "Tell me my Fundamental Duties under 51A."
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* 4. KNOW YOUR RIGHTS */}
        {activeTab === "rights" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-neutral-200/40 dark:border-neutral-800 pb-2">
                <BookOpen className="w-4 h-4" />
                <span>Essential Constitutional Rights Sections</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1 text-sm">Women's Safeguards (Article 15(3))</h4>
                  <p className="text-neutral-500 leading-relaxed font-medium">Guarantees special legal provisions for women and children to ensure absolute gender parity, safety, and workspace equality.</p>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1 text-sm">Right to Education (Article 21A)</h4>
                  <p className="text-neutral-500 leading-relaxed font-medium">Mandates free and compulsory primary education to all children aged 6 to 14 years as an enforceable fundamental right.</p>
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1 text-sm">Right to Information (RTI Act, 2005)</h4>
                  <p className="text-neutral-500 leading-relaxed font-medium">Empowers citizens to demand files, expenditure reports, and project audit sheets from any public department within 30 days.</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-neutral-200/40 dark:border-neutral-800 pb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions (FAQs)</span>
              </h3>
              <div className="space-y-4 text-xs leading-relaxed text-neutral-500">
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">Q: Can I file an RTI online for municipal spending?</p>
                  <p className="mt-1 font-medium">A: Yes, any citizen can log onto RTI Online portal or register a query via municipal bodies to receive complete itemized budget details on neighborhood infrastructure projects.</p>
                </div>
                <div>
                  <p className="font-bold text-neutral-800 dark:text-neutral-200">Q: What should I do if a police officer refuses to file an FIR?</p>
                  <p className="mt-1 font-medium">A: Under the Lalita Kumari landmark judgment, filing an FIR is mandatory for cognizable offenses. You can report non-compliance to the Superintendent of Police or file under Article 32/226.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* 5. WELFARE SCHEMES ELIGIBILITY FINDER */}
        {activeTab === "schemes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 border-b border-neutral-200/40 dark:border-neutral-800 pb-2">
                Filter Scheme Eligibility
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">State Area</label>
                  <select value={schemeState} onChange={(e) => setSchemeState(e.target.value)} className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500">
                    <option>All States</option>
                    <option>Tamil Nadu</option>
                    <option>Maharashtra</option>
                    <option>Delhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Age (Years)</label>
                  <input type="number" value={schemeAge} onChange={(e) => setSchemeAge(Number(e.target.value))} className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Gender Group</label>
                  <div className="flex gap-2">
                    <button onClick={() => setSchemeGender("all")} className={`flex-1 py-1 px-2.5 rounded-lg text-center ${schemeGender === "all" ? "bg-indigo-600 text-white font-bold" : "bg-neutral-100 dark:bg-neutral-900"}`}>All</button>
                    <button onClick={() => setSchemeGender("male")} className={`flex-1 py-1 px-2.5 rounded-lg text-center ${schemeGender === "male" ? "bg-indigo-600 text-white font-bold" : "bg-neutral-100 dark:bg-neutral-900"}`}>Male</button>
                    <button onClick={() => setSchemeGender("female")} className={`flex-1 py-1 px-2.5 rounded-lg text-center ${schemeGender === "female" ? "bg-indigo-600 text-white font-bold" : "bg-neutral-100 dark:bg-neutral-900"}`}>Female</button>
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Family Annual Income (₹)</label>
                  <input type="number" step="10000" value={schemeIncome} onChange={(e) => setSchemeIncome(Number(e.target.value))} className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500" />
                </div>

                <button onClick={findEligibleSchemes} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer hover:bg-indigo-700 text-xs shadow-sm shadow-indigo-600/15">
                  Search Eligible Schemes
                </button>
              </div>
            </GlassCard>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">Eligible Government Schemes Found</h3>
              {recommendedSchemes.length === 0 ? (
                <GlassCard className="p-8 text-center text-xs text-neutral-500">
                  Configure details in the eligibility finder on the left and click 'Search' to locate available federal/state welfare subsidies.
                </GlassCard>
              ) : (
                recommendedSchemes.map((sch) => (
                  <div key={sch.id} className="space-y-4">
                    <GlassCard className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{sch.state} • {sch.ministry}</span>
                        <span className="px-2 py-0.5 bg-green-500/15 text-green-600 text-[9px] uppercase font-bold rounded">Eligible</span>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2">{sch.name}</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-3"><strong>Benefit:</strong> {sch.benefits}</p>
                      
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-950/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800 text-xs space-y-2 mb-4 text-neutral-600 dark:text-neutral-400">
                        <p><strong>Required Verification Docs:</strong> {sch.requiredDocuments.join(", ")}</p>
                        <p><strong>Guidance:</strong> {sch.applicationGuidance}</p>
                      </div>
                    </GlassCard>
                    <PdfGenerator type="scheme" data={{ scheme: sch }} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 6. AI LEARNING & DYNAMIC QUIZ */}
        {activeTab === "learning" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <GlassCard className="p-6">
              <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 border-b border-neutral-200/40 dark:border-neutral-800 pb-2 flex items-center gap-1.5">
                <GraduationCap className="w-5 h-5" />
                <span>Quiz Challenge Arena</span>
              </h3>
              
              <div className="space-y-4 text-xs">
                <p className="text-neutral-500 leading-relaxed">Choose difficulty and generate a dynamic set of custom quiz questions directly from AI to test your knowledge of Fundamental Rights, Duties, and Landmark judgments!</p>
                
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Select Difficulty</label>
                  <select value={quizDiff} onChange={(e) => setQuizDiff(e.target.value as any)} className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500">
                    <option value="easy">Easy (Chief Architect, Samvidhan Divas)</option>
                    <option value="medium">Medium (Emergency, Part III Rights)</option>
                    <option value="hard">Hard (Legal Writs, Global borrowing)</option>
                  </select>
                </div>

                <button
                  onClick={loadQuiz}
                  disabled={quizLoading}
                  className="w-full bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl hover:bg-amber-600 cursor-pointer text-xs"
                >
                  {quizLoading ? "AI Generating Quiz..." : "Initialize Dynamic Challenge"}
                </button>
              </div>
            </GlassCard>

            <div className="lg:col-span-2">
              {quizLoading ? (
                <div className="p-12 text-center animate-pulse flex flex-col items-center justify-center gap-3">
                  <Bot className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                  <span className="text-sm font-semibold text-neutral-500">AI Tutor is drafting professional questions...</span>
                </div>
              ) : quizQuestions.length > 0 && !quizFinished ? (
                <GlassCard className="p-6">
                  <div className="flex justify-between items-center mb-4 text-xs font-bold text-neutral-400">
                    <span>Question {quizIndex + 1} of {quizQuestions.length}</span>
                    <span className="uppercase text-indigo-600 dark:text-indigo-400">{quizDiff} Level</span>
                  </div>

                  <p className="font-bold text-sm text-neutral-900 dark:text-white mb-6 leading-relaxed">
                    {quizQuestions[quizIndex].question}
                  </p>

                  <div className="space-y-3 mb-6">
                    {quizQuestions[quizIndex].options.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => !quizSubmitted && setSelectedQuizAns(idx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                          selectedQuizAns === idx
                            ? "border-indigo-500 bg-indigo-500/10 font-bold"
                            : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        }`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && idx === quizQuestions[quizIndex].correctAnswerIndex && (
                          <span className="text-green-500 font-bold">✓ Correct Answer</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {quizSubmitted ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        selectedQuizAns === quizQuestions[quizIndex].correctAnswerIndex
                          ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                      }`}>
                        <p className="font-bold text-sm mb-1">
                          {selectedQuizAns === quizQuestions[quizIndex].correctAnswerIndex ? t.correct : t.incorrect}
                        </p>
                        <p className="mt-1 font-medium">{quizQuestions[quizIndex].explanation}</p>
                      </div>

                      <button onClick={handleQuizNext} className="w-full bg-slate-900 dark:bg-neutral-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-950">
                        {quizIndex + 1 === quizQuestions.length ? "Finish Quiz & Grade" : "Proceed to Next Question"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleQuizAnswerSubmit}
                      disabled={selectedQuizAns === null}
                      className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs disabled:bg-neutral-300 disabled:text-neutral-500"
                    >
                      Submit Answer
                    </button>
                  )}
                </GlassCard>
              ) : quizFinished ? (
                <div className="space-y-6">
                  <GlassCard className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h4 className="font-bold text-lg text-neutral-900 dark:text-white mb-2">Challenge Conquered!</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                      Amazing job! You scored <strong className="text-indigo-600 dark:text-indigo-400">{quizScore} / {quizQuestions.length}</strong> correct. Your calligraphic study streak has increased!
                    </p>

                    <button onClick={loadQuiz} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-indigo-700">
                      Take Another Challenge
                    </button>
                  </GlassCard>

                  {/* PDF Cert center */}
                  <PdfGenerator
                    type="certificate"
                    data={{
                      quizScore: {
                        score: Math.round((quizScore / quizQuestions.length) * 100),
                        difficulty: quizDiff,
                        date: new Date().toLocaleDateString(),
                        name: user.name
                      }
                    }}
                  />
                </div>
              ) : (
                <GlassCard className="p-8 text-center text-xs text-neutral-500">
                  Click 'Initialize Dynamic Challenge' on the left side menu to load your dynamic custom-designed Constitution Quiz directly from Gemini.
                </GlassCard>
              )}
            </div>
          </div>
        )}

        {/* 7. LANDMARK CASES */}
        {activeTab === "cases" && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search landmark cases by name, year or significance (e.g. basic structure, Maneka, etc.)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {landmarkCasesList
                .filter((c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.significance.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((c) => (
                  <GlassCard key={c.id} className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{c.year}</span>
                      <Bookmark className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-indigo-600 transition-all" />
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2 leading-relaxed">{c.name}</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-3"><strong>Facts:</strong> {c.facts}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-3"><strong>Judgment:</strong> {c.judgment}</p>
                    
                    <div className="p-3 bg-neutral-100 dark:bg-neutral-950/40 rounded-xl border border-neutral-200/50 dark:border-neutral-800 text-xs space-y-1.5 text-neutral-600 dark:text-neutral-400">
                      <p><strong>Articles Reference:</strong> {c.articlesUsed.join(", ")}</p>
                      <p><strong>AI Digest Summary:</strong> {c.aiSummary}</p>
                    </div>
                  </GlassCard>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
