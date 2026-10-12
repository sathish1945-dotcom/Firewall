import React, { useState } from 'react';
import {
  InterviewResponse,
  InterventionVariant,
  ValidationSession,
} from '../../types';
import { LocalEventStore } from '../../services/storage/localEventStore';
import {
  ArrowLeft,
  Beaker,
  FileText,
  Download,
  RotateCcw,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  Trash2,
  TrendingDown,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ResearcherScreenProps {
  onBack: () => void;
  activeSession: ValidationSession | null;
  onStartSession: (participantId: string, variant: InterventionVariant, notes: string) => void;
  onEndSession: () => void;
  onResetDemo: () => void;
  onRefresh: () => void;
}

export const ResearcherScreen: React.FC<ResearcherScreenProps> = ({
  onBack,
  activeSession,
  onStartSession,
  onEndSession,
  onResetDemo,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'interview' | 'sessions'>('summary');

  // Interview Form state
  const [participantId, setParticipantId] = useState(
    activeSession ? activeSession.participantId : `P-${String(LocalEventStore.getInterviewResponses().length + 1).padStart(2, '0')}`
  );
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState<'pause' | 'hard_block' | 'other'>('pause');
  const [q5, setQ5] = useState('');
  const [q6, setQ6] = useState<'helpful' | 'neutral' | 'annoying'>('helpful');
  const [q7, setQ7] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [q8, setQ8] = useState('');
  const [interviewSavedNotice, setInterviewSavedNotice] = useState(false);

  // New Session form state
  const [newSessionParticipant, setNewSessionParticipant] = useState(
    `P-${String(LocalEventStore.getValidationSessions().length + 1).padStart(2, '0')}`
  );
  const [selectedVariant, setSelectedVariant] = useState<InterventionVariant>(
    LocalEventStore.getActiveVariant()
  );
  const [sessionNotes, setSessionNotes] = useState('');

  // Export alerts
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Load summary metrics strictly isolated from demo data
  const valMetrics = LocalEventStore.getValidationMetricsSummary();
  const pastSessions = LocalEventStore.getValidationSessions();
  const pastInterviews = LocalEventStore.getInterviewResponses();
  const isDemo = LocalEventStore.isDemoModeActive();

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const newInterview: InterviewResponse = {
      id: `interview_${Date.now()}`,
      participantId: participantId.trim() || 'P-01',
      createdAt: Date.now(),
      q1UnintendedApps: q1,
      q2WhenUsually: q2,
      q3WhatTriggers: q3,
      q4PauseOrBlock: q4,
      q5DailyTolerance: q5,
      q6HelpfulOrAnnoying: q6,
      q7KeepOneWeek: q7,
      q8DisableReason: q8,
    };

    LocalEventStore.saveInterviewResponse(newInterview);
    setInterviewSavedNotice(true);
    setTimeout(() => setInterviewSavedNotice(false), 2500);

    // Clear form for next participant
    setQ1('');
    setQ2('');
    setQ3('');
    setQ5('');
    setQ8('');
    setParticipantId(`P-${String(LocalEventStore.getInterviewResponses().length + 1).padStart(2, '0')}`);
    onRefresh();
  };

  const handleExportJSON = () => {
    const jsonStr = LocalEventStore.exportValidationDatasetJSON();
    navigator.clipboard.writeText(jsonStr).then(() => {
      setExportNotice('Validation JSON dataset copied to clipboard!');
      setTimeout(() => setExportNotice(null), 2500);
    });
  };

  const handleExportCSV = () => {
    const csvStr = LocalEventStore.exportInterviewsCSV();
    navigator.clipboard.writeText(csvStr).then(() => {
      setExportNotice('Interviews CSV copied to clipboard!');
      setTimeout(() => setExportNotice(null), 2500);
    });
  };

  const handleClearValidationData = () => {
    if (window.confirm('Delete all recorded validation sessions and interview responses?')) {
      LocalEventStore.resetValidationData();
      onRefresh();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-50 space-y-4">
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Researcher Console
              </h2>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                Validation Instrument
              </span>
            </div>
            <p className="text-xs text-slate-500">15-User Behavioral Pilot Protocol</p>
          </div>
        </div>

        {/* Global Demo vs Active Test indicator */}
        <div
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            activeSession
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : isDemo
              ? 'bg-slate-200 text-slate-700 border-slate-300'
              : 'bg-teal-50 text-teal-800 border-teal-300'
          }`}
        >
          {activeSession
            ? `Active: ${activeSession.participantId}`
            : isDemo
            ? 'Demo Mode Active'
            : 'Ready for Test'}
        </div>
      </div>

      {/* Mode Isolation Banner */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600 shrink-0" />
          <div>
            <span className="font-semibold text-slate-900">Strict Data Isolation:</span>{' '}
            <span className="text-slate-500">
              {isDemo
                ? 'Demo data is isolated from real user validation metrics.'
                : 'Validation session recording active. Zero demo events included.'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            onClick={() => {
              onResetDemo();
              onRefresh();
            }}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
            title="Reset seeded demo events"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            activeTab === 'summary'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Validation Summary
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            activeTab === 'interview'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Interview ({pastInterviews.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-1.5 rounded-lg transition-colors ${
            activeTab === 'sessions'
              ? 'bg-white text-slate-900 font-semibold shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Test Sessions ({valMetrics.totalSessions})
        </button>
      </div>

      {exportNotice && (
        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs text-center font-medium animate-in fade-in">
          {exportNotice}
        </div>
      )}

      {/* TAB 1: VALIDATION DASHBOARD & DECISION GATE */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Top Metric Cards (Exclusively from Validation Sessions) */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block mb-1">Cancellation Rate</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {valMetrics.cancellationRate}%
              </div>
              <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                {valMetrics.totalCancels} of {valMetrics.totalInterventions} pauses
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block mb-1">Continue Rate</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {valMetrics.continueRate}%
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {valMetrics.totalContinues} intentional opens
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block mb-1">Avg Pause Duration</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {valMetrics.avgDurationSeconds}s
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Target: 3.0s – 5.0s</p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-slate-500 block mb-1">Prompts / Session</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {valMetrics.promptsPerSession}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {valMetrics.totalCooldownSuppressions} cooldown suppressions
              </p>
            </div>
          </div>

          {/* Prompt Annoyance Breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Prompt Annoyance Rating</h4>
            <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
              <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                <div className="text-sm font-bold text-teal-800">
                  {valMetrics.fatigueCounts.helpful}
                </div>
                <div className="text-[10px] text-teal-700">Helpful</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-sm font-bold text-slate-800">
                  {valMetrics.fatigueCounts.neutral}
                </div>
                <div className="text-[10px] text-slate-600">Neutral</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-sm font-bold text-amber-800">
                  {valMetrics.fatigueCounts.slightly_annoying}
                </div>
                <div className="text-[10px] text-amber-700">Slightly Annoying</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <div className="text-sm font-bold text-rose-800">
                  {valMetrics.fatigueCounts.very_annoying}
                </div>
                <div className="text-[10px] text-rose-700">Very Annoying</div>
              </div>
            </div>
          </div>

          {/* Variant A vs Variant B Performance Comparison */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Experiment Variants (A vs B)</h4>
              <span className="text-[10px] text-slate-400">Strictly Isolated</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Variant A: Fixed Reflective</div>
                  <div className="text-[11px] text-slate-500">
                    {valMetrics.variantAInterventions} interventions tested
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">
                    {valMetrics.variantARate}%
                  </div>
                  <div className="text-[10px] text-slate-500">cancellation rate</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Variant B: Context-Aware Trigger</div>
                  <div className="text-[11px] text-slate-500">
                    {valMetrics.variantBInterventions} interventions tested
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">
                    {valMetrics.variantBRate}%
                  </div>
                  <div className="text-[10px] text-slate-500">cancellation rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Retention & Unwanted Opens */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
            <h4 className="font-bold text-slate-900">Self-Reported Unwanted Opens & Retention</h4>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">Would keep enabled for 1 week:</span>
              <span className="font-bold text-slate-900">
                {valMetrics.wouldKeepPct}% ({pastInterviews.filter((i) => i.q7KeepOneWeek === 'yes').length} of {pastInterviews.length})
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-600">Unwanted opens acknowledged (Regret):</span>
              <span className="font-bold text-slate-900">
                {valMetrics.regretCounts.yes + valMetrics.regretCounts.some} participants
              </span>
            </div>
          </div>

          {/* Section 8: VALIDATION DECISION GATE */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">Validation Decision Gate</h3>
              <span className="text-[10px] text-teal-400 font-mono">Stage 1 Pilot Criteria</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-teal-500/30">
                <div className="font-bold text-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GO</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Users experience recurring unwanted opens, interventions produce meaningful cancellations, annoyance is acceptable, and users say they would keep it enabled.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-amber-500/30">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>PIVOT</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  The unwanted-open problem exists, but interventions are too annoying or bypassed too frequently. Rework prompt friction, launcher, or cooldown logic.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-rose-500/30">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>KILL / RECONSIDER</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Users don't care about the problem, almost always bypass interventions, or report they would disable the feature within 1–2 weeks. Do not hide failure by adding AI.
                </p>
              </div>
            </div>
          </div>

          {/* Data Export Bar */}
          <div className="flex items-center gap-2 pt-1 pb-4">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Dataset</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Interviews CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: RESEARCHER USER INTERVIEW FORM */}
      {activeTab === 'interview' && (
        <form onSubmit={handleSaveInterview} className="space-y-4 text-xs pb-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Standardized 8-Question Protocol</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Participant:</span>
                <input
                  type="text"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="w-16 px-2 py-0.5 border border-slate-300 rounded font-bold text-center text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Q1 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                1. Which 3 apps do you open without intending to?
              </label>
              <input
                type="text"
                placeholder="e.g. Instagram, YouTube, Reddit"
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-900"
                required
              />
            </div>

            {/* Q2 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                2. When does it usually happen?
              </label>
              <input
                type="text"
                placeholder="e.g. In bed before sleep, between tasks at work, on the bus"
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-900"
                required
              />
            </div>

            {/* Q3 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                3. What normally triggers it?
              </label>
              <input
                type="text"
                placeholder="e.g. Boredom, notification chime, needing a mental break"
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-900"
                required
              />
            </div>

            {/* Q4 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                4. Would you prefer a short pause or a hard block?
              </label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setQ4('pause')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q4 === 'pause'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Short pause
                </button>
                <button
                  type="button"
                  onClick={() => setQ4('hard_block')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q4 === 'hard_block'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Hard block
                </button>
                <button
                  type="button"
                  onClick={() => setQ4('other')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q4 === 'other'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Other / Neither
                </button>
              </div>
            </div>

            {/* Q5 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                5. How many interruptions per day would you tolerate?
              </label>
              <input
                type="text"
                placeholder="e.g. 3–5 per day max"
                value={q5}
                onChange={(e) => setQ5(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-900"
                required
              />
            </div>

            {/* Q6 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                6. Did this intervention feel helpful or annoying?
              </label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setQ6('helpful')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q6 === 'helpful'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Helpful
                </button>
                <button
                  type="button"
                  onClick={() => setQ6('neutral')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q6 === 'neutral'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Neutral
                </button>
                <button
                  type="button"
                  onClick={() => setQ6('annoying')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q6 === 'annoying'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Annoying
                </button>
              </div>
            </div>

            {/* Q7 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                7. Would you keep this enabled for one week?
              </label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setQ7('yes')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q7 === 'yes'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setQ7('maybe')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q7 === 'maybe'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Maybe
                </button>
                <button
                  type="button"
                  onClick={() => setQ7('no')}
                  className={`py-2 rounded-xl border text-center font-medium transition-all ${
                    q7 === 'no'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Q8 */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                8. What would make you disable it?
              </label>
              <textarea
                placeholder="e.g. False alarms when replying to an urgent message; too many questions"
                value={q8}
                onChange={(e) => setQ8(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-900"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-slate-900/10 hover:bg-slate-800"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Interview Record ({participantId})</span>
          </button>

          {interviewSavedNotice && (
            <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-center font-medium">
              ✓ Interview saved locally and queued for validation report.
            </div>
          )}
        </form>
      )}

      {/* TAB 3: TEST SESSIONS & PILOT RUNNER */}
      {activeTab === 'sessions' && (
        <div className="space-y-4 text-xs">
          {/* Active Session Status Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Current Test Session</h3>
              {activeSession ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Running ({activeSession.participantId})
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400">No active session</span>
              )}
            </div>

            {activeSession ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-500">Variant</span>
                    <div className="font-bold text-slate-900">
                      {activeSession.variant === 'variant_a_fixed' ? 'Variant A (Fixed)' : 'Variant B (Context)'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-500">Duration</span>
                    <div className="font-bold text-slate-900">
                      {Math.round((Date.now() - activeSession.startedAt) / 60000)} mins
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-500">App Opens</span>
                    <div className="font-bold text-slate-900">{activeSession.appOpensCount}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-500">Interventions</span>
                    <div className="font-bold text-teal-700">{activeSession.interventionsShown}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-500">Cancels</span>
                    <div className="font-bold text-slate-900">{activeSession.cancelCount}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onEndSession();
                    onRefresh();
                  }}
                  className="w-full h-10 rounded-xl bg-rose-600 text-white font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-700"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>End Session & Save to History</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Participant ID</label>
                    <input
                      type="text"
                      value={newSessionParticipant}
                      onChange={(e) => setNewSessionParticipant(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Experiment Variant</label>
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value as InterventionVariant)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <option value="variant_a_fixed">Variant A (Fixed Prompt)</option>
                      <option value="variant_b_context">Variant B (Context-Aware)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Context Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. In-person interview, Android tester #3"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>

                <button
                  onClick={() => {
                    onStartSession(newSessionParticipant, selectedVariant, sessionNotes);
                    onRefresh();
                  }}
                  className="w-full h-10 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Fresh Test Session</span>
                </button>
              </div>
            )}
          </div>

          {/* Past Validation Sessions List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Recorded Test Sessions ({pastSessions.length})</h4>
              <button
                onClick={handleClearValidationData}
                className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All Sessions</span>
              </button>
            </div>

            {pastSessions.length === 0 ? (
              <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                No past validation sessions recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {pastSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{s.participantId}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          {s.variant === 'variant_a_fixed' ? 'Variant A' : 'Variant B'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(s.startedAt).toLocaleDateString()} · {s.events.length} events logged
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {s.interventionsShown > 0
                          ? `${Math.round((s.cancelCount / s.interventionsShown) * 100)}% cancel`
                          : '0 interventions'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {s.interventionsShown} pauses shown
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
