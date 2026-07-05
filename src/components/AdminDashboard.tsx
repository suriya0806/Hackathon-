import { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertOctagon,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  UserCheck,
  BookOpen,
  Sparkles,
  TrendingDown
} from "lucide-react";
import GlassCard from "./GlassCard";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"fraud" | "misinfo" | "system">("fraud");
  const [fraudLogs, setFraudLogs] = useState<any[]>([]);
  const [misinfoLogs, setMisinfoLogs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({ cpu: "14%", memory: "1.2GB/8.0GB", uptime: "14 Days", databaseSync: "Synced" });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Fetch seeded logs from server
      const res1 = await fetch("/api/admin/fraud-audit");
      const logs1 = await res1.json();
      setFraudLogs(logs1);

      const res2 = await fetch("/api/admin/misinfo-audit");
      const logs2 = await res2.json();
      setMisinfoLogs(logs2);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyFraudLog = async (id: string, action: "approved" | "rejected") => {
    // Client-side visual state update representing real verification
    setFraudLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, flagStatus: action } : log))
    );
  };

  const handleVerifyMisinfoLog = async (id: string, action: "verified" | "disproven") => {
    setMisinfoLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, status: action } : log))
    );
  };

  return (
    <div id="admin-dashboard" className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>National Security & Administrative Audit Control Center</span>
            </h2>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
              AI Forensic Checks • Scheme Auditing • Misinformation Fact-Checking
            </p>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab("fraud")}
              className={`py-2 px-4 rounded-xl font-bold transition-all ${
                activeTab === "fraud" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30" : "bg-neutral-100 dark:bg-neutral-900"
              }`}
            >
              Forensic Integrity Audits
            </button>
            <button
              onClick={() => setActiveTab("misinfo")}
              className={`py-2 px-4 rounded-xl font-bold transition-all ${
                activeTab === "misinfo" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30" : "bg-neutral-100 dark:bg-neutral-900"
              }`}
            >
              Misinformation Fact-Checks
            </button>
          </div>
        </div>

        {/* 1. FRAUD & FORENSIC CHECKS MODULE */}
        {activeTab === "fraud" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Logs Table */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">AI Forensic Integrity Audit Logs</h3>
              
              <div className="space-y-4">
                {fraudLogs.map((log) => (
                  <GlassCard key={log.id} className="p-5 border-neutral-200/50 dark:border-neutral-850">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-400">{log.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          log.riskScore >= 80 ? "bg-red-500/15 text-red-500" : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                        }`}>
                          Risk: {log.riskScore}%
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        log.flagStatus === "approved"
                          ? "bg-green-500/15 text-green-500"
                          : log.flagStatus === "rejected"
                          ? "bg-red-500/15 text-red-500"
                          : "bg-neutral-500/15 text-neutral-400 animate-pulse"
                      }`}>
                        {log.flagStatus}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white mb-1">
                      Target Audit: {log.applicantName} • {log.targetScheme}
                    </h4>
                    
                    <p className="text-[11px] text-neutral-500 leading-relaxed mb-3">
                      <strong>AI Detection Findings:</strong> {log.anomalyDetected}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                      <span>Identity Verification: IP: {log.ipAddress}</span>
                      <div className="flex gap-2">
                        {log.flagStatus === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerifyFraudLog(log.id, "approved")}
                              className="px-2.5 py-1 bg-green-500 text-white hover:bg-green-600 rounded text-[9px] cursor-pointer"
                            >
                              Pass Audit
                            </button>
                            <button
                              onClick={() => handleVerifyFraudLog(log.id, "rejected")}
                              className="px-2.5 py-1 bg-red-500 text-white hover:bg-red-600 rounded text-[9px] cursor-pointer"
                            >
                              Deny Claim
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Quick stats & explanations */}
            <div className="space-y-6">
              <GlassCard className="p-5 space-y-4">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Auditing Guidelines</span>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                  The AI Forensic engine scans national databases for duplicate scheme applications, matching applicant Aadhaar identifiers and salary declarations. Confirm risk metrics before executing denials.
                </p>
              </GlassCard>
            </div>

          </div>
        )}

        {/* 2. MISINFORMATION FACT CHECKER */}
        {activeTab === "misinfo" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">AI Fact-Check Verification Logs</h3>
              
              <div className="space-y-4">
                {misinfoLogs.map((log) => (
                  <GlassCard key={log.id} className="p-5 border-neutral-200/50 dark:border-neutral-850">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono text-neutral-400">{log.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                        log.status === "verified"
                          ? "bg-green-500/15 text-green-500"
                          : log.status === "disproven"
                          ? "bg-red-500/15 text-red-500"
                          : "bg-neutral-500/15 text-neutral-400 animate-pulse"
                      }`}>
                        {log.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white mb-2">
                      Reported News: "{log.reportedNews}"
                    </h4>

                    <div className="p-3 bg-neutral-100 dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-800 rounded-xl text-xs space-y-2 mb-4 text-neutral-600 dark:text-neutral-400">
                      <p><strong>Government Source Gazette Fact:</strong> {log.governmentGazetteFact}</p>
                      <p><strong>AI Verdict Analysis:</strong> {log.aiVerdict}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
                      <span>Source Platform: {log.sourcePlatform}</span>
                      <div className="flex gap-2">
                        {log.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleVerifyMisinfoLog(log.id, "verified")}
                              className="px-2.5 py-1 bg-green-500 text-white hover:bg-green-600 rounded text-[9px] cursor-pointer"
                            >
                              Verify Genuine
                            </button>
                            <button
                              onClick={() => handleVerifyMisinfoLog(log.id, "disproven")}
                              className="px-2.5 py-1 bg-red-500 text-white hover:bg-red-600 rounded text-[9px] cursor-pointer"
                            >
                              Mark Fake News
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <GlassCard className="p-5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">Audit Control guidelines</span>
                <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                  Audits verify public statements against official state gazette entries and notify search engine/API partners to flag fraudulent claims automatically, protecting constitutional awareness.
                </p>
              </GlassCard>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
