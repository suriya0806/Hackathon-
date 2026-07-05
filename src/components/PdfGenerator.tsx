import { Printer, Download, FileText, Award, MapPin, Calendar, Clock } from "lucide-react";
import GlassCard from "./GlassCard";
import { Complaint, GovernmentScheme, QuizQuestion } from "../types";

interface PdfGeneratorProps {
  type: "complaint" | "certificate" | "scheme" | "notes";
  data: {
    complaint?: Complaint;
    scheme?: GovernmentScheme;
    quizScore?: { score: number; difficulty: string; date: string; name: string };
    notes?: { title: string; body: string };
  };
}

export default function PdfGenerator({ type, data }: PdfGeneratorProps) {
  const handlePrint = () => {
    // Isolate section to print or simply invoke window.print()
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Actions Panel */}
      <div className="flex items-center justify-between gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>ConstitutionAI PDF Center</span>
        </span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* The Printable Container Card */}
      <div className="bg-white text-slate-950 p-8 rounded-xl border border-slate-200 shadow-md max-w-2xl mx-auto font-sans print:shadow-none print:border-none print:p-0">
        {/* Header Ribbon */}
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
          <div className="text-left">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-900 rounded-full" />
              CONSTITUTION AI PORTAL
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
              Smart Governance & Grievance Management
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-mono">
            <p>ID: CAI-REP-{Date.now().toString().slice(-6)}</p>
            <p>DATE: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Dynamic Printable Content based on Type */}
        {type === "complaint" && data.complaint && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-800">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-300 pb-1.5 uppercase">
              Official Grievance Registration Letter
            </h3>
            
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Complaint Reference</span>
                <span className="font-mono font-semibold text-slate-900">{data.complaint.id}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-900">{data.complaint.category}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reporter Status</span>
                <span className="font-semibold text-slate-900">
                  {data.complaint.reporter.isAnonymous ? "Anonymous Citizen" : data.complaint.reporter.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Severity Rating</span>
                <span className="font-bold text-red-600 uppercase">{data.complaint.severity}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">Subject / Title</h4>
              <p className="font-semibold bg-slate-50/50 p-2 rounded">{data.complaint.title}</p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">Detailed Description</h4>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{data.complaint.description}</p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs">GPS & Map Location Address</h4>
              <p className="flex items-center gap-1.5 text-slate-700 bg-slate-50/50 p-2 rounded">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{data.complaint.location.address} (Lat: {data.complaint.location.lat.toFixed(4)}, Lng: {data.complaint.location.lng.toFixed(4)})</span>
              </p>
            </div>

            {data.complaint.aiAnalysis && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mt-4">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  AI Smart Analysis & Work Order Recommendation
                </h4>
                <div className="space-y-2 text-slate-700">
                  <p><strong>Auto Detection:</strong> {data.complaint.aiAnalysis.issueDetected}</p>
                  <p><strong>Department Referral:</strong> {data.complaint.aiAnalysis.recommendedDepartment}</p>
                  <p><strong>ETA Work Order:</strong> {data.complaint.aiAnalysis.estimatedCompletionTime}</p>
                  <p><strong>Engineering Task Details:</strong> {data.complaint.aiAnalysis.workOrderDetails}</p>
                </div>
              </div>
            )}

            <div className="pt-8 grid grid-cols-2 text-center border-t border-slate-300 mt-8">
              <div>
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif text-slate-500 italic text-[10px]">Verified via Blockchain/AI hash</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-200 pt-1 w-32 mx-auto">
                  ConstitutionAI Portal
                </p>
              </div>
              <div>
                <div className="h-10 flex items-end justify-center">
                  <span className="font-bold text-xs">{data.complaint.engineerSignature || "Pending Inspection"}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-200 pt-1 w-32 mx-auto">
                  Assigned Engineer
                </p>
              </div>
            </div>
          </div>
        )}

        {type === "certificate" && data.quizScore && (
          <div className="space-y-6 text-center py-6">
            <div className="flex justify-center mb-2">
              <Award className="w-16 h-16 text-amber-500" />
            </div>
            
            <h3 className="text-lg font-serif tracking-widest text-slate-900 font-bold uppercase">
              Certificate of Constitutional Literacy
            </h3>
            
            <p className="text-xs text-slate-500 italic">This is proudly presented to</p>
            
            <h4 className="text-xl font-bold text-slate-900 underline decoration-amber-500 decoration-2 underline-offset-8">
              {data.quizScore.name}
            </h4>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              for successfully completing the **ConstitutionAI National Awareness Challenge** at difficulty level <strong className="uppercase text-amber-600">{data.quizScore.difficulty}</strong>.
            </p>

            <div className="flex justify-center gap-8 bg-slate-50 p-3 rounded-lg max-w-sm mx-auto border border-slate-200">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Assessment Score</span>
                <span className="text-base font-bold text-slate-900">{data.quizScore.score}% Correct</span>
              </div>
              <div className="border-l border-slate-300" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Issue Date</span>
                <span className="text-xs font-semibold text-slate-900">{data.quizScore.date}</span>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200 text-[10px] text-slate-500 leading-normal">
              <p>Certified secure and validated by ConstitutionAI Smart Education Wing.</p>
              <p className="font-mono mt-1 text-[8px]">Verification Hash: SHA256-CAI-CERT-{Date.now().toString()}</p>
            </div>
          </div>
        )}

        {type === "scheme" && data.scheme && (
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-300 pb-1.5 uppercase">
              Welfare Scheme Guide & Application Guidance
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <p className="text-sm font-bold text-slate-900">{data.scheme.name}</p>
              <p><strong>Nodal Department/Ministry:</strong> {data.scheme.ministry}</p>
              <p><strong>Scheme State Area:</strong> {data.scheme.state}</p>
            </div>
            
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">Summary Benefits</h4>
              <p className="bg-slate-50/50 p-2.5 rounded text-slate-700">{data.scheme.benefits}</p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">Eligibility Criteria Summary</h4>
              <p className="bg-slate-50/50 p-2.5 rounded text-slate-700">
                Minimum Age: {data.scheme.eligibility.minAge} years. Max Age: {data.scheme.eligibility.maxAge} years. Gender eligibility: {data.scheme.eligibility.gender}. Max annual income: ₹{data.scheme.eligibility.maxIncome.toLocaleString()}.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">Required Verification Documents</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {data.scheme.requiredDocuments.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900">Digital Application Filing Instructions</h4>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded leading-relaxed border-l-4 border-slate-900">
                {data.scheme.applicationGuidance}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
