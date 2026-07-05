import React, { useState, useEffect } from "react";
import {
  Wrench,
  CheckCircle,
  MapPin,
  Clock,
  Camera,
  Edit,
  User,
  ArrowRight,
  Shield,
  Signature
} from "lucide-react";
import GlassCard from "./GlassCard";
import MapComponent from "./MapComponent";
import { Complaint } from "../types";

interface EngineerDashboardProps {
  user: any;
}

export default function EngineerDashboard({ user }: EngineerDashboardProps) {
  const [tasks, setTasks] = useState<Complaint[]>([]);
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);

  // Resolution form states
  const [resolutionComment, setResolutionComment] = useState("");
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [etaText, setEtaText] = useState("2 Hours");
  const [signatureText, setSignatureText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  const fetchAssignedTasks = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      
      // Filter tasks assigned to this engineer ( Ramesh / Priya / Vignesh etc. )
      // For demo, we display tasks with assignedTo field or default pending ones.
      const assigned = data.filter((c: any) => c.status !== "completed");
      setTasks(assigned);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTaskComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !signatureText) return;

    setSubmitting(true);
    try {
      const updatedHistory = [
        ...selectedTask.history,
        {
          status: "completed",
          timestamp: new Date().toISOString(),
          note: `Field Engineer Resolution: ${resolutionComment}. Site status certified completed. Digital Signature: ${signatureText}.`
        }
      ];

      const payload = {
        ...selectedTask,
        status: "completed",
        progress: 100,
        history: updatedHistory,
        afterImage: afterImage,
        engineerSignature: signatureText,
      };

      const res = await fetch(`/api/complaints/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelectedTask(null);
        setResolutionComment("");
        setAfterImage(null);
        setSignatureText("");
        setSuccess(true);
        fetchAssignedTasks();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="engineer-dashboard" className="min-h-screen bg-slate-50 dark:bg-neutral-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Field Engineers Job Execution Terminal</span>
          </h2>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
            Ward 4 Maintenance Operations • Site Sign-offs
          </p>
        </div>

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded-xl">
            Grievance successfully signed-off. Completion certificate generated for Citizen review!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tasks List Feed */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-sm text-neutral-500 uppercase tracking-wider">My Assigned Field Warrants</h3>
            
            {tasks.length === 0 ? (
              <GlassCard className="p-8 text-center text-xs text-neutral-500">
                Excellent! All assigned field warrants resolved. No pending maintenance jobs detected.
              </GlassCard>
            ) : (
              tasks.map((task) => (
                <GlassCard
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 border cursor-pointer hover:border-indigo-500/40 transition-all ${
                    selectedTask?.id === task.id ? "border-indigo-500 bg-indigo-500/5" : "border-neutral-200/40 dark:border-neutral-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-neutral-400">{task.id}</span>
                    <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold tracking-wider capitalize">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-neutral-900 dark:text-white mb-1">{task.title}</p>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 leading-relaxed mb-2">{task.location.address}</p>
                  
                  <div className="flex justify-between items-center text-[9px] font-bold text-neutral-400">
                    <span className="text-red-500 uppercase">{task.severity} priority</span>
                    <span>Progression: {task.progress}%</span>
                  </div>
                </GlassCard>
              ))
            )}
          </div>

          {/* Interactive Job Execution Form */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Site coordinates Map & Task details */}
                <div className="space-y-4">
                  <GlassCard className="p-4">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-2">Grievance GPS Navigation Map</span>
                    <MapComponent interactive={false} selectedLocation={selectedTask.location} />
                    <div className="mt-3 text-xs leading-relaxed text-neutral-500 font-medium">
                      <p><strong>Site Location:</strong> {selectedTask.location.address}</p>
                      <p className="mt-1"><strong>Before Photo & Impact:</strong> {selectedTask.description}</p>
                    </div>
                  </GlassCard>

                  {selectedTask.base64Image && (
                    <GlassCard className="p-4">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">Citizen Uploaded Before Image</span>
                      <img
                        src={selectedTask.base64Image}
                        alt="Before grievance"
                        className="w-full rounded-xl object-cover h-36 border border-neutral-200/50"
                        referrerPolicy="no-referrer"
                      />
                    </GlassCard>
                  )}
                </div>

                {/* Repair & Resolution submission form */}
                <GlassCard className="p-6">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-200/40 dark:border-neutral-800 pb-2 mb-4">
                    Site Repair Log & Digital Sign-off
                  </h4>

                  <form onSubmit={handleTaskComplete} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Estimated Completion Time (ETA)</label>
                      <input
                        type="text"
                        value={etaText}
                        onChange={(e) => setEtaText(e.target.value)}
                        placeholder="e.g. 2 Hours, Completed now"
                        className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Attach After Resolution Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAfterImageChange}
                        className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/10 file:text-indigo-600 hover:file:bg-indigo-600/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Resolution Field Notes</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="e.g. Patched potholes with cold asphalt mixture, tested road surface resilience..."
                        value={resolutionComment}
                        onChange={(e) => setResolutionComment(e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Digital Security Signature</label>
                      <div className="relative">
                        <Signature className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          required
                          placeholder="Type full legal name for authentication"
                          value={signatureText}
                          onChange={(e) => setSignatureText(e.target.value)}
                          className="w-full bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 pl-9 pr-4 text-xs font-serif italic text-indigo-600 dark:text-indigo-400 tracking-wide focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{submitting ? "Signing Off..." : "Certify Site Work Complete"}</span>
                    </button>
                  </form>
                </GlassCard>

              </div>
            ) : (
              <GlassCard className="p-8 text-center text-xs text-neutral-500">
                Select an assigned field warrant from the left side panel to review navigation coordinates, attach completion photo evidence, and digitally sign quality sign-offs.
              </GlassCard>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
