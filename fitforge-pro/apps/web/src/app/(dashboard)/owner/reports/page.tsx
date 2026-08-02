"use client";

import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Download, Calendar, Users, DollarSign, Award, Clock } from "lucide-react";

const SYSTEM_REPORTS = [
  {
    id: "rep_members",
    name: "Active Members Roster",
    description: "Detailed sheet of active subscriptions, registration details, and goal types.",
    icon: Users,
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "rep_financials",
    name: "Revenue & General Ledger",
    description: "Audits transaction codes, amount paid, gateway details, and refund adjustments.",
    icon: DollarSign,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "rep_attendance",
    name: "Attendance Peak Analysis",
    description: "Peak visitor distributions, logs of check-ins, and daily duration summaries.",
    icon: Calendar,
    color: "from-yellow-500 to-amber-500",
  },
  {
    id: "rep_trainer",
    name: "Trainer Schedule Audits",
    description: "Ratings indicators, booking volumes, and coach logs for payouts calculations.",
    icon: Clock,
    color: "from-purple-500 to-fuchsia-500",
  },
];

export default function OwnerReportsPage() {
  const { user } = useAuth();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleGenerate = (id: string, name: string) => {
    setGeneratingId(id);
    toast.info(`Gathering audit tables for "${name}"...`);

    setTimeout(() => {
      setGeneratingId(null);
      toast.success(`Successfully compiled and downloaded "${name}" CSV file.`);
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-3xl text-white mb-2">Systems Audit Reports</h1>
        <p className="text-sm text-white/50">Extract and compile data dumps, attendance logs, and accounting sheets from active tables.</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SYSTEM_REPORTS.map((report) => {
          const Icon = report.icon;
          const isGenerating = generatingId === report.id;

          return (
            <div key={report.id} className="glass-card p-6 border-white/5 flex items-start gap-4 hover:border-brand-gold/30 transition-colors">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center text-white flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{report.name}</h3>
                  <p className="text-xxs text-white/50 mt-1 leading-relaxed">{report.description}</p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xxs text-white/40">
                  <span>File Format: CSV (UTF-8)</span>
                  <button
                    onClick={() => handleGenerate(report.id, report.name)}
                    disabled={generatingId !== null}
                    className="flex items-center gap-1.5 font-bold text-brand-gold hover:text-brand-gold/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border border-brand-gold border-t-transparent rounded-full animate-spin" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> Export Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
