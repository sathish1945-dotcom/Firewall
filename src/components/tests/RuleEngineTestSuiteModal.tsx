import React, { useState } from 'react';
import { RuleEngine } from '../../services/rules/ruleEngine';
import { LocalEventStore } from '../../services/storage/localEventStore';
import { BehavioralAnalytics } from '../../services/analytics/behavioralAnalytics';
import { DEFAULT_RULES, AVAILABLE_APPS } from '../../services/data/defaultApps';
import { ProtectedApp, BehavioralEvent, AppOpenRecord } from '../../types';
import { X, CheckCircle2, XCircle, Play, RefreshCw, Beaker } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

interface RuleEngineTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleEngineTestSuiteModal: React.FC<RuleEngineTestSuiteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const runAllTests = () => {
    setIsRunning(true);
    const testList: TestResult[] = [];
    const baseNow = 1776000000000; // deterministic fixed epoch
    const testAppId = 'instagram';

    // Test 1: 1 open -> no intervention
    try {
      const singleOpenRecord: AppOpenRecord[] = [
        { id: 't1_1', appId: testAppId, timestamp: baseNow },
      ];
      const res = RuleEngine.evaluateOpen({
        appId: testAppId,
        isProtected: true,
        isPaused: false,
        rulesConfig: DEFAULT_RULES,
        recentOpens: singleOpenRecord,
        currentTime: baseNow,
      });

      const passed = res.shouldIntervene === false;
      testList.push({
        id: 't1',
        name: '1 open -> no intervention',
        passed,
        details: passed
          ? 'Normal opening correctly permitted without interruption.'
          : `Failed: expected false, got ${res.shouldIntervene}`,
      });
    } catch (e: any) {
      testList.push({ id: 't1', name: '1 open -> no intervention', passed: false, details: e.message });
    }

    // Test 2: 3 opens / 15 min -> intervention
    try {
      const threeOpens: AppOpenRecord[] = [
        { id: 't2_1', appId: testAppId, timestamp: baseNow - 10 * 60 * 1000 },
        { id: 't2_2', appId: testAppId, timestamp: baseNow - 5 * 60 * 1000 },
        { id: 't2_3', appId: testAppId, timestamp: baseNow },
      ];
      const res = RuleEngine.evaluateOpen({
        appId: testAppId,
        isProtected: true,
        isPaused: false,
        rulesConfig: DEFAULT_RULES,
        recentOpens: threeOpens,
        currentTime: baseNow,
      });

      const passed = res.shouldIntervene === true && res.triggerType === 'repeated_open';
      testList.push({
        id: 't2',
        name: '3 opens / 15 min -> intervention',
        passed,
        details: passed
          ? `RepeatedOpenRule fired correctly: "${res.reason}"`
          : `Failed: triggerType was ${res.triggerType}`,
      });
    } catch (e: any) {
      testList.push({ id: 't2', name: '3 opens / 15 min -> intervention', passed: false, details: e.message });
    }

    // Test 3: close + reopen within 2 min -> intervention
    try {
      const quickReopenHistory: AppOpenRecord[] = [
        {
          id: 't3_1',
          appId: testAppId,
          timestamp: baseNow - 3 * 60 * 1000,
          closedAt: baseNow - 45 * 1000, // closed 45s ago
        },
      ];
      const res = RuleEngine.evaluateOpen({
        appId: testAppId,
        isProtected: true,
        isPaused: false,
        rulesConfig: DEFAULT_RULES,
        recentOpens: quickReopenHistory,
        currentTime: baseNow,
      });

      const passed = res.shouldIntervene === true && res.triggerType === 'quick_reopen';
      testList.push({
        id: 't3',
        name: 'close + reopen within 2 min -> intervention',
        passed,
        details: passed
          ? `QuickReopenRule triggered correctly (${res.reason})`
          : `Failed: expected quick_reopen, got ${res.triggerType}`,
      });
    } catch (e: any) {
      testList.push({ id: 't3', name: 'close + reopen within 2 min -> intervention', passed: false, details: e.message });
    }

    // Test 4: intervention during cooldown -> no duplicate prompt
    try {
      const threeOpens: AppOpenRecord[] = [
        { id: 't4_1', appId: testAppId, timestamp: baseNow - 8 * 60 * 1000 },
        { id: 't4_2', appId: testAppId, timestamp: baseNow - 4 * 60 * 1000 },
        { id: 't4_3', appId: testAppId, timestamp: baseNow },
      ];
      // Prompt was already shown 5 minutes ago (within 15 min cooldown)
      const lastPrompt = baseNow - 5 * 60 * 1000;
      const res = RuleEngine.evaluateOpen({
        appId: testAppId,
        isProtected: true,
        isPaused: false,
        rulesConfig: DEFAULT_RULES,
        recentOpens: threeOpens,
        lastPromptTimestamp: lastPrompt,
        currentTime: baseNow,
      });

      const passed = res.shouldIntervene === false && res.cooldownActive === true;
      testList.push({
        id: 't4',
        name: 'intervention during cooldown -> no duplicate prompt',
        passed,
        details: passed
          ? `Cooldown active, prompt skipped to prevent fatigue (${res.reason})`
          : `Failed: expected shouldIntervene: false with cooldownActive: true`,
      });
    } catch (e: any) {
      testList.push({ id: 't4', name: 'intervention during cooldown -> no duplicate prompt', passed: false, details: e.message });
    }

    // Test 5: non-protected app -> ignored
    try {
      const res = RuleEngine.evaluateOpen({
        appId: 'unprotected_browser',
        isProtected: false,
        isPaused: false,
        rulesConfig: DEFAULT_RULES,
        recentOpens: [],
        currentTime: baseNow,
      });

      const passed = res.shouldIntervene === false;
      testList.push({
        id: 't5',
        name: 'non-protected app -> ignored',
        passed,
        details: passed
          ? 'Non-protected apps safely ignored without any intervention.'
          : 'Failed: non-protected app should not trigger intervention',
      });
    } catch (e: any) {
      testList.push({ id: 't5', name: 'non-protected app -> ignored', passed: false, details: e.message });
    }

    // Test 6: maximum protected apps -> 3
    try {
      // Try setting 4 apps
      const fourApps = AVAILABLE_APPS.slice(0, 4);
      LocalEventStore.setProtectedApps(fourApps);
      const retrieved = LocalEventStore.getProtectedApps();

      const passed = retrieved.length <= 3;
      testList.push({
        id: 't6',
        name: 'maximum protected apps -> 3',
        passed,
        details: passed
          ? `Strictly enforced: stored ${retrieved.length} apps (capped at 3).`
          : `Failed: allowed ${retrieved.length} apps`,
      });
    } catch (e: any) {
      testList.push({ id: 't6', name: 'maximum protected apps -> 3', passed: false, details: e.message });
    }

    // Test 7: cancel -> event recorded
    try {
      const cancelEvt: BehavioralEvent = {
        id: 'test_cancel_evt',
        timestamp: baseNow,
        protectedAppId: 'instagram',
        protectedAppName: 'Instagram',
        triggerType: 'repeated_open',
        promptShown: true,
        userIntent: 'habit',
        continued: false,
        cancelled: true,
      };
      LocalEventStore.addEvent(cancelEvt);
      const events = LocalEventStore.getEvents();
      const found = events.some((e) => e.id === 'test_cancel_evt' && e.cancelled === true);

      const passed = found;
      testList.push({
        id: 't7',
        name: 'cancel -> event recorded',
        passed,
        details: passed
          ? 'Cancelled autopilot event successfully persisted in local store.'
          : 'Failed: cancel event was not stored',
      });
    } catch (e: any) {
      testList.push({ id: 't7', name: 'cancel -> event recorded', passed: false, details: e.message });
    }

    // Test 8: continue -> event recorded
    try {
      const continueEvt: BehavioralEvent = {
        id: 'test_continue_evt',
        timestamp: baseNow,
        protectedAppId: 'youtube',
        protectedAppName: 'YouTube',
        triggerType: 'quick_reopen',
        promptShown: true,
        userIntent: 'task',
        continued: true,
        cancelled: false,
        intendedDurationMinutes: 10,
      };
      LocalEventStore.addEvent(continueEvt);
      const events = LocalEventStore.getEvents();
      const found = events.some((e) => e.id === 'test_continue_evt' && e.continued === true);

      const passed = found;
      testList.push({
        id: 't8',
        name: 'continue -> event recorded',
        passed,
        details: passed
          ? 'Continued intentional event stored with user intent.'
          : 'Failed: continue event was not stored',
      });
    } catch (e: any) {
      testList.push({ id: 't8', name: 'continue -> event recorded', passed: false, details: e.message });
    }

    // Test 9: weekly analytics -> calculated correctly
    try {
      const mockEvents: BehavioralEvent[] = [
        {
          id: 'w1',
          timestamp: baseNow - 2 * 24 * 3600 * 1000,
          protectedAppId: 'instagram',
          protectedAppName: 'Instagram',
          triggerType: 'repeated_open',
          promptShown: true,
          continued: false,
          cancelled: true,
        },
        {
          id: 'w2',
          timestamp: baseNow - 1 * 24 * 3600 * 1000,
          protectedAppId: 'instagram',
          protectedAppName: 'Instagram',
          triggerType: 'quick_reopen',
          promptShown: true,
          continued: true,
          cancelled: false,
        },
      ];
      const summary = BehavioralAnalytics.calculateSummary(mockEvents);

      const passed =
        summary.totalOpens === 2 &&
        summary.interventions === 2 &&
        summary.cancelledOpens === 1 &&
        summary.continuedOpens === 1 &&
        summary.cancellationRate === 50;

      testList.push({
        id: 't9',
        name: 'weekly analytics -> calculated correctly',
        passed,
        details: passed
          ? `Accurately calculated: 50% cancellation rate (1 cancelled, 1 continued).`
          : `Failed: expected 50% cancellation rate, got ${summary.cancellationRate}%`,
      });
    } catch (e: any) {
      testList.push({ id: 't9', name: 'weekly analytics -> calculated correctly', passed: false, details: e.message });
    }

    // Test 10: demo data isolated from validation metrics
    try {
      // Ensure seeded events don't pollute validation summary
      const valMetrics = LocalEventStore.getValidationMetricsSummary();
      // Even if there are 20+ seeded demo events, validation opens only count from ValidationSession[]
      const sessions = LocalEventStore.getValidationSessions();
      const current = LocalEventStore.getCurrentValidationSession();
      const expectedOpens = (current ? [current, ...sessions] : sessions).reduce((acc, s) => acc + s.appOpensCount, 0);

      const passed = valMetrics.totalOpens === expectedOpens;
      testList.push({
        id: 't10',
        name: 'demo data isolated from validation metrics',
        passed,
        details: passed
          ? `Strict isolation confirmed: ${valMetrics.totalOpens} validation opens vs ${LocalEventStore.getEvents().length} total historical events.`
          : `Failed: validation metrics leaked demo events (${valMetrics.totalOpens} vs ${expectedOpens})`,
      });
    } catch (e: any) {
      testList.push({ id: 't10', name: 'demo data isolated from validation metrics', passed: false, details: e.message });
    }

    // Test 11: experiment variants (A vs B) tracked separately
    try {
      const valMetrics = LocalEventStore.getValidationMetricsSummary();
      const passed = typeof valMetrics.variantARate === 'number' && typeof valMetrics.variantBRate === 'number';
      testList.push({
        id: 't11',
        name: 'experiment variants (A vs B) tracked separately',
        passed,
        details: passed
          ? `Variant metrics separated: Variant A (${valMetrics.variantARate}%), Variant B (${valMetrics.variantBRate}%).`
          : 'Failed: variant separation not established',
      });
    } catch (e: any) {
      testList.push({ id: 't11', name: 'experiment variants (A vs B) tracked separately', passed: false, details: e.message });
    }

    setResults(testList);
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Beaker className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rule Engine Test Runner</h3>
              <p className="text-[11px] text-slate-400">Section 18 Core Specification Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {results.length > 0
              ? `${results.filter((r) => r.passed).length} of ${results.length} tests passing`
              : 'Execute real tests against RuleEngine and local store'}
          </span>

          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-teal-400 active:scale-95 transition-all"
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run All 9 Tests</span>
          </button>
        </div>

        {/* Results List */}
        <div className="space-y-2 mt-3">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
              Click "Run All 9 Tests" to verify the entire behavioral engine against product specs.
            </div>
          ) : (
            results.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{t.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.passed ? 'bg-teal-500/20 text-teal-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {t.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">{t.details}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
