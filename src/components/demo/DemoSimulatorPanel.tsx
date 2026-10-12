import React, { useState } from 'react';
import { ProtectedApp, RuleEvaluationResult } from '../../types';
import { AVAILABLE_APPS } from '../../services/data/defaultApps';
import { LocalEventStore } from '../../services/storage/localEventStore';
import { appUsageProvider } from '../../services/platform/AppUsageProvider';
import {
  X,
  Play,
  RotateCcw,
  Zap,
  Repeat,
  Moon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Beaker,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface DemoSimulatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  protectedApps: ProtectedApp[];
  onTriggerSimulatedOpen: (app: ProtectedApp, customTimestamp?: number) => void;
  onSimulateCloseApp: (appId: string) => void;
  onOpenTestSuite: () => void;
  onOpenResearcher?: () => void;
  onTriggerFatigueSurvey?: () => void;
  onTriggerRegretSurvey?: () => void;
  onResetDemo?: () => void;
}

export const DemoSimulatorPanel: React.FC<DemoSimulatorPanelProps> = ({
  isOpen,
  onClose,
  protectedApps,
  onTriggerSimulatedOpen,
  onSimulateCloseApp,
  onOpenTestSuite,
  onOpenResearcher,
  onTriggerFatigueSurvey,
  onTriggerRegretSurvey,
  onResetDemo,
}) => {
  const [selectedApp, setSelectedApp] = useState<ProtectedApp>(
    protectedApps[0] || AVAILABLE_APPS[0]
  );
  const [simulationLog, setSimulationLog] = useState<
    { time: string; text: string; success: boolean }[]
  >([]);

  if (!isOpen) return null;

  const addLog = (text: string, success: boolean = true) => {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setSimulationLog((prev) => [{ time, text, success }, ...prev.slice(0, 8)]);
  };

  // Scenario 1: Single open
  const handleSingleOpen = () => {
    addLog(`Simulated open for ${selectedApp.name}`);
    onTriggerSimulatedOpen(selectedApp);
  };

  // Scenario 2: Simulate 3 rapid opens within 5 minutes to trigger RepeatedOpenRule
  const handleRapid3Opens = async () => {
    const now = Date.now();
    addLog(`Simulating 3 opens within 5 minutes for ${selectedApp.name}...`);
    // First open: 4 min ago
    await appUsageProvider.simulateAppOpen(selectedApp, now - 4 * 60 * 1000);
    // Second open: 2 min ago
    await appUsageProvider.simulateAppOpen(selectedApp, now - 2 * 60 * 1000);
    // Third open: right now (should trigger RepeatedOpenRule!)
    onTriggerSimulatedOpen(selectedApp, now);
    addLog(`3rd open dispatched (evaluating RepeatedOpenRule)`);
  };

  // Scenario 3: Quick reopen (Closed 30 seconds ago, opening now)
  const handleQuickReopen = async () => {
    const now = Date.now();
    addLog(`Recording close for ${selectedApp.name} 30 seconds ago...`);
    // Record an open 2 min ago, closed 30s ago
    LocalEventStore.addAppOpen({
      id: `sim_quick_${Date.now()}`,
      appId: selectedApp.id,
      timestamp: now - 90 * 1000,
      closedAt: now - 30 * 1000,
    });

    addLog(`Reopening ${selectedApp.name} immediately (< 2 min window)`);
    // Trigger open now
    onTriggerSimulatedOpen(selectedApp, now);
  };

  // Scenario 4: Simulate late night open (11:45 PM)
  const handleLateNightOpen = () => {
    const todayLate = new Date();
    todayLate.setHours(23, 45, 0, 0);
    addLog(`Simulating open during late-night window (23:45)`);
    onTriggerSimulatedOpen(selectedApp, todayLate.getTime());
  };

  // Scenario 5: Simulate during focus period (2:30 PM on weekday)
  const handleFocusHourOpen = () => {
    const focusTime = new Date();
    // Ensure Monday-Friday
    const day = focusTime.getDay();
    if (day === 0 || day === 6) {
      focusTime.setDate(focusTime.getDate() + 2); // advance to weekday
    }
    focusTime.setHours(14, 30, 0, 0);
    addLog(`Simulating open during focus period (14:30 weekday)`);
    onTriggerSimulatedOpen(selectedApp, focusTime.getTime());
  };

  // Scenario 6: Non-protected app open (e.g. Settings / Camera)
  const handleNonProtectedOpen = () => {
    const nonProtected: ProtectedApp = {
      id: 'settings_app',
      name: 'System Settings',
      packageName: 'com.android.settings',
      category: 'other',
      iconColor: '#64748B',
      iconBg: '#F1F5F9',
    };
    addLog(`Simulating non-protected app launch (${nonProtected.name})`);
    onTriggerSimulatedOpen(nonProtected);
  };

  // Reset Cooldowns
  const handleClearCooldowns = () => {
    LocalEventStore.clearCooldowns();
    addLog(`Cleared prompt cooldown timers`, true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Android Event Simulator</h3>
              <p className="text-[11px] text-slate-400">
                Web test harness for OS-level foreground launches
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target App Picker */}
        <div className="my-3">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Select Simulation Target App:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {AVAILABLE_APPS.map((app) => {
              const isSelected = selectedApp.id === app.id;
              const isProtected = protectedApps.some((p) => p.id === app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 border transition-all ${
                    isSelected
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-xs'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: app.iconColor }}
                  />
                  <span>{app.name}</span>
                  {isProtected && (
                    <span className="text-[9px] bg-slate-700 text-slate-300 px-1 py-0.2 rounded-sm">
                      Protected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulation Actions Grid */}
        <div className="space-y-2 mb-4">
          <div className="text-[11px] font-semibold text-slate-400">
            Automated Behavioral Test Triggers:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Action 1: Standard open */}
            <button
              onClick={handleSingleOpen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2 text-slate-200"
            >
              <Play className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div>
                <div className="font-semibold">Single Open</div>
                <div className="text-[10px] text-slate-400">Normal app launch</div>
              </div>
            </button>

            {/* Action 2: 3 Rapid Opens (RepeatedOpenRule) */}
            <button
              onClick={handleRapid3Opens}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2 text-slate-200"
            >
              <Repeat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <div className="font-semibold">3 Opens / 5 Min</div>
                <div className="text-[10px] text-slate-400">Triggers Repeated Rule</div>
              </div>
            </button>

            {/* Action 3: Quick reopen within 2 min */}
            <button
              onClick={handleQuickReopen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2 text-slate-200"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div>
                <div className="font-semibold">Quick Reopen</div>
                <div className="text-[10px] text-slate-400">30s after closing</div>
              </div>
            </button>

            {/* Action 4: Late-night open */}
            <button
              onClick={handleLateNightOpen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2 text-slate-200"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold">Late-Night (23:45)</div>
                <div className="text-[10px] text-slate-400">Overnight window</div>
              </div>
            </button>

            {/* Action 5: Focus Period */}
            <button
              onClick={handleFocusHourOpen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2 text-slate-200"
            >
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div>
                <div className="font-semibold">Focus Hour (14:30)</div>
                <div className="text-[10px] text-slate-400">Work/Study block</div>
              </div>
            </button>

            {/* Action 6: Non-protected app */}
            <button
              onClick={handleNonProtectedOpen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2 text-slate-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div>
                <div className="font-semibold">Non-Protected App</div>
                <div className="text-[10px] text-slate-400">Ignored safely</div>
              </div>
            </button>
          </div>
        </div>

        {/* Validation Instruments & Surveys Section */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 mb-3">
          <div className="text-[11px] font-semibold text-slate-400">
            Validation Surveys & Controls:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {onTriggerFatigueSurvey && (
              <button
                onClick={() => {
                  onClose();
                  onTriggerFatigueSurvey();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-slate-300 flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Prompt Fatigue Survey</span>
              </button>
            )}

            {onTriggerRegretSurvey && (
              <button
                onClick={() => {
                  onClose();
                  onTriggerRegretSurvey();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-slate-300 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Regret / Intention Check</span>
              </button>
            )}
          </div>
        </div>

        {/* Extra Simulator Utilities */}
        <div className="flex items-center justify-between py-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearCooldowns}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Cooldowns</span>
            </button>

            {onResetDemo && (
              <button
                onClick={() => {
                  onResetDemo();
                  addLog('Demo events reset to clean state', true);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Reset Demo
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onOpenResearcher && (
              <button
                onClick={() => {
                  onClose();
                  onOpenResearcher();
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Beaker className="w-3.5 h-3.5" />
                <span>Researcher</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenTestSuite();
              }}
              className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <span>Test Suite (8) →</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Output Console */}
        {simulationLog.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
            <div className="text-slate-500 font-semibold">Simulator Event Stream:</div>
            {simulationLog.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-600">{log.time}</span>
                <span className={log.success ? 'text-teal-400' : 'text-amber-400'}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
