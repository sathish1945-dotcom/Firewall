import React, { useState } from 'react';
import {
  ProtectedApp,
  ProtectionState,
  SummaryStats,
  UserGoal,
} from '../../types';
import { BrandLogo } from '../../components/brand/BrandLogo';
import {
  Shield,
  ShieldAlert,
  ShieldOff,
  Pause,
  Play,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingDown,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface DashboardScreenProps {
  protectedApps: ProtectedApp[];
  protectionState: ProtectionState;
  todayStats: SummaryStats;
  userGoal: UserGoal;
  onPauseProtection: (durationHours: number | null) => void;
  onResumeProtection: () => void;
  onNavigateToActivity: () => void;
  onNavigateToReport: () => void;
  onNavigateToSettings: () => void;
  onOpenSimulator: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  protectedApps,
  protectionState,
  todayStats,
  userGoal,
  onPauseProtection,
  onResumeProtection,
  onNavigateToActivity,
  onNavigateToReport,
  onNavigateToSettings,
  onOpenSimulator,
}) => {
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const getNextSunday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + (7 - day) % 7;
    const nextSunday = new Date(d.setDate(diff));
    return nextSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isPaused = protectionState.isPaused;

  return (
    <div className="flex-1 flex flex-col p-5 bg-slate-50 space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between pt-1">
        <BrandLogo size="sm" />
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/80 active:scale-95 transition-all shadow-2xs"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Demo Simulator</span>
        </button>
      </div>

      {/* Main Status Hero Card */}
      <div
        className={`rounded-3xl p-5 border transition-all shadow-sm ${
          isPaused
            ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
                isPaused
                  ? 'bg-amber-200/80 text-amber-800'
                  : 'bg-teal-50 text-teal-700 border border-teal-200/60'
              }`}
            >
              {isPaused ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">
                  {isPaused ? 'Protection Paused' : 'Protection Active'}
                </span>
                {!isPaused && (
                  <span className="text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">
                    On Duty
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPaused
                  ? 'Pauses are temporarily suspended'
                  : `Watching ${protectedApps.length} apps for autopilot triggers`}
              </p>
            </div>
          </div>
        </div>

        {/* Protected apps icon avatars */}
        <div className="flex items-center gap-2 py-2 border-y border-slate-100">
          <span className="text-xs text-slate-500">Protected:</span>
          <div className="flex items-center gap-1.5">
            {protectedApps.map((app) => (
              <span
                key={app.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: app.iconColor }}
                />
                <span className="text-slate-800">{app.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Primary pause control */}
        <div className="mt-4 pt-1">
          {isPaused ? (
            <button
              onClick={onResumeProtection}
              className="w-full h-10 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 active:scale-98 transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Protection Now</span>
            </button>
          ) : (
            <div>
              {!showPauseMenu ? (
                <button
                  onClick={() => setShowPauseMenu(true)}
                  className="w-full h-9 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Protection...</span>
                </button>
              ) : (
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1 text-slate-600 font-semibold">
                    <span>Temporarily Pause</span>
                    <button
                      onClick={() => setShowPauseMenu(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        onPauseProtection(1);
                        setShowPauseMenu(false);
                      }}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium hover:border-slate-400 text-center"
                    >
                      1 Hour
                    </button>
                    <button
                      onClick={() => {
                        onPauseProtection(8);
                        setShowPauseMenu(false);
                      }}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium hover:border-slate-400 text-center"
                    >
                      8 Hours
                    </button>
                    <button
                      onClick={() => {
                        onPauseProtection(null);
                        setShowPauseMenu(false);
                      }}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-medium hover:border-slate-400 text-center"
                    >
                      Until Resumed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TODAY Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500">
            Today's Micro-Pauses
          </h3>
          <span className="text-xs text-slate-400">Neutral behavioral count</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Metric 1: Protected app opens */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block mb-1">Protected App Opens</span>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {todayStats.totalOpens}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Normal & triggered launches</p>
          </div>

          {/* Metric 2: Interventions shown */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block mb-1">Interventions Shown</span>
            <div className="text-2xl font-bold text-teal-700 tabular-nums">
              {todayStats.interventions}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Pauses triggered by rules</p>
          </div>

          {/* Metric 3: Cancelled opens (Autopilot caught) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Cancelled Opens</span>
              <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {todayStats.cancelledOpens}
            </div>
            <p className="text-[11px] text-teal-700 font-medium mt-1">
              Autopilot moments caught
            </p>
          </div>

          {/* Metric 4: Continued opens */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block mb-1">Continued Opens</span>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {todayStats.continuedOpens}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Proceeded with intention</p>
          </div>
        </div>
      </div>

      {/* Goal & Weekly Report Promos */}
      <div className="space-y-2.5">
        {/* Weekly Report shortcut card */}
        <button
          onClick={onNavigateToReport}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                Weekly Behavioral Report
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Next summary generates {getNextSunday()}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Activity log shortcut */}
        <button
          onClick={onNavigateToActivity}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                Detailed Activity Log
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                View patterns across 7 & 30 days
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Navigation Tabs */}
      <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-around text-xs">
        <button className="flex flex-col items-center gap-1 text-slate-900 font-bold py-1">
          <Shield className="w-5 h-5 text-teal-600" />
          <span>Firewall</span>
        </button>
        <button
          onClick={onNavigateToActivity}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 py-1"
        >
          <Clock className="w-5 h-5" />
          <span>Activity</span>
        </button>
        <button
          onClick={onNavigateToReport}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 py-1"
        >
          <Sparkles className="w-5 h-5" />
          <span>Report</span>
        </button>
        <button
          onClick={onNavigateToSettings}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-900 py-1"
        >
          <ArrowRight className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
