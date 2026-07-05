import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  Map as MapIcon,
  User,
  AlertTriangle,
  Sparkles,
  Layers,
  Edit,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Activity
} from "lucide-react";
import GlassCard from "./GlassCard";
import MapComponent from "./MapComponent";
import { Complaint, UserProfile } from "../types";
import { translations } from "../utils/translations";

interface OfficerDashboardProps {
  user: UserProfile;
  language: "en" | "ta" | "hi";
}

export default function OfficerDashboard({ user, language }: OfficerDashboardProps) {
  const t = translations[language];

  // Feed & Complaints
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [engineersList, setEngineersList] = useState<string[]>(["Engineer Ramesh Kumar", "Engineer Priya Raj", "Engineer Vignesh S."]);
  const [assignedEngineer, setAssignedEngineer] = useState("Engineer Ramesh Kumar");
  const [priorityLevel, setPriorityLevel] = useState<"low" | "medium" | "high" | "emergency">("medium");
  const [officerNote, setOfficerNote] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, complete: 0, critical: 0 });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      setComplaints(data);
      calculateStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateStats = (list: Complaint[]) => {
    const total = list.length;
    const active = list.filter((c) => c.status !== "completed").length;
    const complete = list.filter((c) => c.status === "completed").length;
    const critical = list.filter((c) => c.severity === "emergency" || c.severity === "high").length;
    setStats({ total, active, complete, critical });
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      const updatedStatus = "assigned_to_engineer";
      const updatedHistory = [
        ...selectedComplaint.history,
        {
          status: updatedStatus,
          timestamp: new Date().toISOString(),
          note: `Officer Note: ${officerNote || "Referral sent to ward engineer."}. Assigned: ${assignedEngineer}.`
        }
      ];

      const payload = {
        ...selectedComplaint,
        status: updatedStatus,
        severity: priorityLevel,
        assignedTo: assignedEngineer,
        progress: 30,
        history: updatedHistory,
      };

      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelectedComplaint(null);
        setOfficerNote("");
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter list
  const filteredComplaints = complaints.filter((comp) => {
    const matchesCategory = filterCategory === "All" || comp.category === filterCategory;
    const matchesSeverity = filterSeverity === "All" || comp.severity === filterSeverity;
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) || comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  return (
    <div id="officer-dashboard" className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Headers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Municipal Ward Officer Command Dashboard</span>
            </h2>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
              Smart Grievance Allocation • Chennai Municipal Ward 4
            </p>
          </div>
          <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800 text-xs text-neutral-500 items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>AI Dispatch System: ACTIVE & SYNCED</span>
          </div>
        </div>

        {/* Analytical Scorecards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 border-neutral-200/40 dark:border-neutral-850">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Total Grievances Filed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">{stats.total}</span>
              <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+12% wk</span>
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-neutral-200/40 dark:border-neutral-850">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">Pending Field Work</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.active}</span>
              <span className="text-[10px] text-neutral-400">awaiting repair</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-neutral-200/40 dark:border-neutral-850">
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider block mb-1">Works Signed Off</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-green-500">{stats.complete}</span>
              <span className="text-[10px] text-green-400 font-semibold">100% Quality audited</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-neutral-200/40 dark:border-neutral-850 bg-red-500/5">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">Critical Road Hazards</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-500">{stats.critical}</span>
              <span className="text-[10px] text-red-400 font-bold animate-pulse">Needs immediate dispatch</span>
            </div>
          </GlassCard>
        </div>

        {/* Interactive map representing live ward heatmaps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Live Grievance Site Geolocation Heatmap</span>
                <span className="text-[10px] text-slate-500">Auto tracking Ward 4 incidents</span>
              </div>
              <MapComponent heatmapMode={true} interactive={false} complaintsList={complaints} />
            </GlassCard>
          </div>

          {/* Quick Analytics Breakdown (Custom SVG Chart) */}
          <div className="space-y-4">
            <GlassCard className="p-6 h-full flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-4 border-b border-neutral-200/40 dark:border-neutral-800 pb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Ward Analytics & Auto-Resolution Breakdown</span>
                </h4>

                {/* Beautiful Inline SVG Bar Chart */}
                <div className="py-4 flex justify-center">
                  <svg viewBox="0 0 200 120" className="w-full max-w-[240px]">
                    {/* Grid Lines */}
                    <line x1="20" y1="100" x2="190" y2="100" stroke="#444" strokeWidth="1" />
                    <line x1="20" y1="20" x2="190" y2="20" stroke="#333" strokeDasharray="2" strokeWidth="0.5" />
                    <line x1="20" y1="60" x2="190" y2="60" stroke="#333" strokeDasharray="2" strokeWidth="0.5" />

                    {/* Bar 1: Potholes */}
                    <rect x="35" y="40" width="16" height="60" fill="#f59e0b" rx="2" />
                    <text x="43" y="112" className="text-[8px] fill-neutral-400 font-semibold" textAnchor="middle">Roads</text>

                    {/* Bar 2: Light */}
                    <rect x="75" y="60" width="16" height="40" fill="#eab308" rx="2" />
                    <text x="83" y="112" className="text-[8px] fill-neutral-400 font-semibold" textAnchor="middle">Lights</text>

                    {/* Bar 3: Water */}
                    <rect x="115" y="30" width="16" height="70" fill="#3b82f6" rx="2" />
                    <text x="123" y="112" className="text-[8px] fill-neutral-400 font-semibold" textAnchor="middle">Water</text>

                    {/* Bar 4: Drainage */}
                    <rect x="155" y="50" width="16" height="50" fill="#ef4444" rx="2" />
                    <text x="163" y="112" className="text-[8px] fill-neutral-400 font-semibold" textAnchor="middle">Sewers</text>
                  </svg>
                </div>

                <div className="space-y-2 mt-4 text-xs font-semibold text-neutral-500">
                  <div className="flex justify-between">
                    <span>Average Resolution Rate</span>
                    <span className="text-green-500">4.2 Days (Target: 5.0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Citizen Satisfaction Index</span>
                    <span className="text-indigo-600 dark:text-indigo-400">89.4% Overall</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Bottom List and Interactive Allocation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Complaints Feed List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">Citizen Grievances Feed</h3>
              
              {/* Category & Severity Filters */}
              <div className="flex gap-2 text-xs">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl focus:outline-none">
                  <option>All Categories</option>
                  <option>Potholes</option>
                  <option>Water Leakage</option>
                  <option>Street Light Failure</option>
                  <option>Drainage Problems</option>
                </select>
                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-xl focus:outline-none">
                  <option value="All">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredComplaints.length === 0 ? (
                <GlassCard className="p-8 text-center text-xs text-neutral-500">
                  No grievances found matching the chosen filters.
                </GlassCard>
              ) : (
                filteredComplaints.map((comp) => (
                  <GlassCard
                    key={comp.id}
                    onClick={() => setSelectedComplaint(comp)}
                    className={`p-4 border cursor-pointer hover:border-indigo-500/40 transition-all ${
                      selectedComplaint?.id === comp.id ? "border-indigo-500 bg-indigo-500/5" : "border-neutral-200/40 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-400">{comp.id}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-neutral-400 rounded text-[9px] font-bold tracking-wider capitalize">{comp.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        comp.severity === "emergency"
                          ? "bg-red-500/15 text-red-500"
                          : comp.severity === "high"
                          ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                          : "bg-blue-500/15 text-blue-500"
                      }`}>
                        {comp.severity}
                      </span>
                    </div>

                    <p className="font-bold text-xs text-neutral-900 dark:text-white mb-1">{comp.title}</p>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mb-3">{comp.description}</p>
                    
                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                      <span>Address: {comp.location.address}</span>
                      <span className="capitalize text-indigo-600 dark:text-indigo-400">Status: {comp.status.replace("_", " ")}</span>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>

          {/* Allocation & Assignment form */}
          <div>
            {selectedComplaint ? (
              <GlassCard className="p-6 space-y-4">
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-200/40 dark:border-neutral-800 pb-2">
                  Assign Ward Engineer & Set Priority
                </h4>

                <div className="p-3 bg-neutral-100 dark:bg-neutral-950/40 rounded-xl text-xs space-y-1.5 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <p><strong>Grievance:</strong> {selectedComplaint.title}</p>
                  <p><strong>Address:</strong> {selectedComplaint.location.address}</p>
                  <p><strong>Auto AI Assessment:</strong> Pothole damage confirmed. Recommended department: Highways.</p>
                </div>

                <form onSubmit={handleUpdateComplaint} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Ward Engineer Assignment</label>
                    <select
                      value={assignedEngineer}
                      onChange={(e) => setAssignedEngineer(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-white"
                    >
                      {engineersList.map((eng) => (
                        <option key={eng}>{eng}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Escalate Priority Level</label>
                    <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 border border-neutral-800 rounded-xl">
                      {(["low", "medium", "high", "emergency"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setPriorityLevel(lvl)}
                          className={`py-1.5 rounded text-[9px] uppercase font-bold transition-all ${
                            priorityLevel === lvl
                              ? "bg-indigo-600 text-white shadow"
                              : "text-neutral-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Directives / Inspection Instructions</label>
                    <textarea
                      rows={3}
                      placeholder="Input site-specific engineering guidelines or instruction rules..."
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-indigo-600/20"
                  >
                    <span>Dispatch Field Crew</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </GlassCard>
            ) : (
              <GlassCard className="p-6 text-center text-xs text-neutral-500">
                Select a grievance card from the citizen feed on the left to allocate a municipal ward engineer, edit priority level, draft site orders, and sign dispatch warrants.
              </GlassCard>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
