import React, { useState } from 'react';
import { RuleConfiguration } from '../../types';
import { DEFAULT_RULES } from '../../services/data/defaultApps';
import { ArrowLeft, Clock, Sliders, Repeat, Moon, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface RulesSetupScreenProps {
  onBack: () => void;
  onFinish: (rules: RuleConfiguration) => void;
  initialRules?: RuleConfiguration;
}

export const RulesSetupScreen: React.FC<RulesSetupScreenProps> = ({
  onBack,
  onFinish,
  initialRules = DEFAULT_RULES,
}) => {
  const [rules, setRules] = useState<RuleConfiguration>(initialRules);
  const [showCustomization, setShowCustomization] = useState(false);

  const toggleRepeated = () => {
    setRules((prev) => ({
      ...prev,
      repeatedOpens: {
        ...prev.repeatedOpens,
        enabled: !prev.repeatedOpens.enabled,
      },
    }));
  };

  const toggleQuick = () => {
    setRules((prev) => ({
      ...prev,
      quickReopen: {
        ...prev.quickReopen,
        enabled: !prev.quickReopen.enabled,
      },
    }));
  };

  const toggleFocus = () => {
    setRules((prev) => ({
      ...prev,
      focusPeriod: {
        ...prev.focusPeriod,
        enabled: !prev.focusPeriod.enabled,
      },
    }));
  };

  const toggleLateNight = () => {
    setRules((prev) => ({
      ...prev,
      lateNight: {
        ...prev.lateNight,
        enabled: !prev.lateNight.enabled,
      },
    }));
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50">
      <div>
        {/* Navigation header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
            Step 4 of 4
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Protection Rules
        </h2>
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          Impulse Firewall does not interrupt every open. It intervenes only when behavioral patterns suggest autopilot.
        </p>

        {/* Rule cards */}
        <div className="space-y-3">
          {/* Rule A: Repeated opens */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Repeat className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Repeated Opening</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pause when opened {rules.repeatedOpens.maxOpens} times within {rules.repeatedOpens.windowMinutes} minutes
                </p>
              </div>
            </div>
            <button
              onClick={toggleRepeated}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                rules.repeatedOpens.enabled ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  rules.repeatedOpens.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rule B: Quick reopening */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Quick Reopening</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pause when reopened within {rules.quickReopen.windowMinutes} minutes after closing
                </p>
              </div>
            </div>
            <button
              onClick={toggleQuick}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                rules.quickReopen.enabled ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  rules.quickReopen.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rule C: Focus period */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Focus Period</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weekdays ({rules.focusPeriod.startTime} – {rules.focusPeriod.endTime})
                </p>
              </div>
            </div>
            <button
              onClick={toggleFocus}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                rules.focusPeriod.enabled ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  rules.focusPeriod.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rule D: Late Night */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Late-Night Protection</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Overnight ({rules.lateNight.startTime} – {rules.lateNight.endTime})
                </p>
              </div>
            </div>
            <button
              onClick={toggleLateNight}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                rules.lateNight.enabled ? 'bg-slate-900' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  rules.lateNight.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Hidden under "Customize" */}
        <div className="mt-4">
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Thresholds & Cooldowns</span>
            {showCustomization ? (
              <ChevronUp className="w-3.5 h-3.5 ml-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            )}
          </button>

          {showCustomization && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-4 mt-2 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Prompt Cooldown ({rules.cooldownMinutes} minutes)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Minimum quiet time before another pause can be shown for the same app.
                </p>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={rules.cooldownMinutes}
                  onChange={(e) =>
                    setRules({ ...rules, cooldownMinutes: Number(e.target.value) })
                  }
                  className="w-full accent-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Repeated Opens Count</label>
                  <select
                    value={rules.repeatedOpens.maxOpens}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        repeatedOpens: {
                          ...rules.repeatedOpens,
                          maxOpens: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value={2}>2 opens</option>
                    <option value={3}>3 opens (recommended)</option>
                    <option value={4}>4 opens</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Window Period</label>
                  <select
                    value={rules.repeatedOpens.windowMinutes}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        repeatedOpens: {
                          ...rules.repeatedOpens,
                          windowMinutes: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Setup */}
      <div className="pt-6 pb-2">
        <button
          onClick={() => onFinish(rules)}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all hover:bg-slate-800"
        >
          Enable Impulse Protection
        </button>
      </div>
    </div>
  );
};
