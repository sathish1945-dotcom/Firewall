import React, { useState } from 'react';
import { BehavioralEvent, ProtectedApp } from '../../types';
import { BehavioralAnalytics } from '../../services/analytics/behavioralAnalytics';
import { LocalEventStore } from '../../services/storage/localEventStore';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Calendar,
  Clock,
  Layers,
  Info,
} from 'lucide-react';

interface WeeklyReportScreenProps {
  onBack: () => void;
  events: BehavioralEvent[];
  protectedApps: ProtectedApp[];
}

export const WeeklyReportScreen: React.FC<WeeklyReportScreenProps> = ({
  onBack,
  events,
  protectedApps,
}) => {
  const report = BehavioralAnalytics.generateWeeklyReport(events, protectedApps);
  const savedFeedbackMap = LocalEventStore.getWeeklyFeedback();
  const currentFeedback = savedFeedbackMap[report.weekKey]?.helpful || null;

  const [userFeedback, setUserFeedback] = useState<'yes' | 'sometimes' | 'no' | null>(
    currentFeedback
  );
  const [feedbackSavedNotice, setFeedbackSavedNotice] = useState(false);

  const handleFeedback = (val: 'yes' | 'sometimes' | 'no') => {
    setUserFeedback(val);
    LocalEventStore.saveWeeklyFeedback(report.weekKey, val);
    setFeedbackSavedNotice(true);
    setTimeout(() => setFeedbackSavedNotice(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-slate-50 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Weekly Report</h2>
            <p className="text-xs text-slate-500">
              {report.startDate} – {report.endDate}
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* Main Headline Hero Card */}
      <div className="rounded-3xl p-5 bg-white border border-slate-200/80 shadow-2xs space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          7-Day Retrospective
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
          You caught {report.cancelledUnwantedOpens} autopilot moments this week.
        </h1>

        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          Each cancelled open represents a reflexive tap replaced with conscious intention. Not
          every app opening is bad — only the ones you didn't actually choose.
        </p>
      </div>

      {/* Core Weekly Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-500 block mb-1">Protected App Opens</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {report.totalProtectedOpens}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Across {protectedApps.length} apps</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-500 block mb-1">Interventions Shown</span>
          <div className="text-2xl font-bold text-teal-700 tabular-nums">
            {report.interventionsShown}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Triggered by frequency rules</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-500 block mb-1">Cancelled Opens</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {report.cancelledUnwantedOpens}
          </div>
          <p className="text-[10px] text-teal-700 font-medium mt-0.5">
            {report.cancellationRate}% cancellation rate
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] text-slate-500 block mb-1">Continue Rate</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {report.continueRate}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Proceeded with conscious purpose</p>
        </div>
      </div>

      {/* Trigger Patterns & Hotspots */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
          Pattern Breakdown
        </h3>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Peak Trigger Window:</span>
          </div>
          <span className="font-semibold text-slate-900">{report.mostCommonTriggerPeriod}</span>
        </div>

        <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Most Triggered App:</span>
          </div>
          <span className="font-semibold text-slate-900">{report.mostFrequentlyTriggeredApp}</span>
        </div>
      </div>

      {/* Deterministic Local Insights */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Behavioral Observations
          </h3>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Local Deterministic
          </span>
        </div>

        <div className="space-y-2">
          {report.deterministicInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 pt-1 leading-normal flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400 shrink-0" />
          <span>Calculated on-device from local event history. Not a medical or psychological diagnosis.</span>
        </p>
      </div>

      {/* Core Feedback Question */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold text-slate-900">
            Did these pauses help you avoid actions you didn't actually want?
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleFeedback('yes')}
            className={`py-2 rounded-xl text-xs font-medium border transition-all ${
              userFeedback === 'yes'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => handleFeedback('sometimes')}
            className={`py-2 rounded-xl text-xs font-medium border transition-all ${
              userFeedback === 'sometimes'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Sometimes
          </button>
          <button
            onClick={() => handleFeedback('no')}
            className={`py-2 rounded-xl text-xs font-medium border transition-all ${
              userFeedback === 'no'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            No
          </button>
        </div>

        {feedbackSavedNotice && (
          <div className="text-[11px] text-teal-700 font-medium text-center animate-in fade-in">
            ✓ Feedback saved locally to calibrate future sensitivity.
          </div>
        )}
      </div>
    </div>
  );
};
