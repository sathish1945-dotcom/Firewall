import React, { useState, useEffect, useRef } from 'react';
import { ProtectedApp, RuleEvaluationResult, UserIntent, InterventionVariant } from '../../types';
import { Clock, Compass, MessageSquare, Search, Sparkles } from 'lucide-react';

interface MicroPauseScreenProps {
  app: ProtectedApp;
  evaluation: RuleEvaluationResult;
  variant?: InterventionVariant;
  onDecision: (decision: {
    continued: boolean;
    cancelled: boolean;
    userIntent?: UserIntent;
    durationMinutes?: number;
    durationMs?: number;
    bypassed?: boolean;
  }) => void;
}

export const MicroPauseScreen: React.FC<MicroPauseScreenProps> = ({
  app,
  evaluation,
  variant = 'variant_b_context',
  onDecision,
}) => {
  const [selectedIntent, setSelectedIntent] = useState<UserIntent | null>(null);
  const [use10MinCap, setUse10MinCap] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const startTimeRef = useRef<number>(Date.now());

  // 3-second gentle reflection countdown (non-punitive, just a calm pause rhythm)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const intentOptions: { id: UserIntent; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'task',
      label: 'Specific task',
      icon: <Sparkles className="w-4 h-4 text-slate-700" />,
      desc: 'Checking a saved post, order, or setting',
    },
    {
      id: 'reply',
      label: 'Reply to someone',
      icon: <MessageSquare className="w-4 h-4 text-slate-700" />,
      desc: 'Responding to a message or notification',
    },
    {
      id: 'search',
      label: 'Quick search',
      icon: <Search className="w-4 h-4 text-slate-700" />,
      desc: 'Looking up a specific video, account, or item',
    },
    {
      id: 'habit',
      label: 'Habit / Just checking',
      icon: <Compass className="w-4 h-4 text-slate-700" />,
      desc: 'Opened automatically out of boredom or reflex',
    },
  ];

  const handleGoBack = () => {
    const durationMs = Date.now() - startTimeRef.current;
    onDecision({
      continued: false,
      cancelled: true,
      userIntent: selectedIntent || 'habit',
      durationMs,
      bypassed: false,
    });
  };

  const handleContinue = () => {
    const durationMs = Date.now() - startTimeRef.current;
    const bypassed = durationMs < 1200;
    onDecision({
      continued: true,
      cancelled: false,
      userIntent: selectedIntent || 'undecided',
      durationMinutes: use10MinCap ? 10 : undefined,
      durationMs,
      bypassed,
    });
  };

  // Derive reason copy based on Variant A (Fixed) vs Variant B (Context-Aware)
  const getReasonCopy = () => {
    if (variant === 'variant_a_fixed') {
      return {
        headline: `Take a moment to pause.`,
        subline: `A brief check-in to confirm your purpose before opening ${app.name}.`,
      };
    }

    // Variant B: Context-aware prompt describing exact trigger
    if (evaluation.triggerType === 'quick_reopen') {
      return {
        headline: `You just closed ${app.name} a moment ago.`,
        subline: `Quick reopen detected (${evaluation.reason}).`,
      };
    }
    if (evaluation.triggerType === 'repeated_open') {
      return {
        headline: `You've reopened ${app.name} several times recently.`,
        subline: `${evaluation.reason}`,
      };
    }
    if (evaluation.triggerType === 'late_night') {
      return {
        headline: `It’s late night. Autopilot often strikes when tired.`,
        subline: `${evaluation.reason}`,
      };
    }
    if (evaluation.triggerType === 'focus_period') {
      return {
        headline: `Designated focus hours are active right now.`,
        subline: `${evaluation.reason}`,
      };
    }
    return {
      headline: `A gentle pause before opening ${app.name}.`,
      subline: `Catching the moment before autopilot takes over.`,
    };
  };

  const promptCopy = getReasonCopy();

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 text-slate-100 flex flex-col justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4 pt-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: app.iconColor }}
            />
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
              {app.name} · Reflective Pause
            </span>
          </div>

          {/* Gentle breath indicator */}
          <div className="flex items-center gap-1.5 text-xs text-teal-400/90 font-mono">
            {countdown > 0 ? (
              <span className="animate-pulse">Take a breath ({countdown}s)</span>
            ) : (
              <span className="text-slate-400">Conscious choice</span>
            )}
          </div>
        </div>

        {/* Observation banner */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-200">{promptCopy.headline}</p>
            <span className="text-[10px] text-slate-500 font-mono">
              {variant === 'variant_a_fixed' ? 'Variant A (Fixed)' : 'Variant B (Context)'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {promptCopy.subline}
          </p>
        </div>

        {/* Intent Question */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
          What are you opening it for?
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Naming your reason turns reflex into intention.
        </p>

        {/* Intent Options */}
        <div className="space-y-2.5">
          {intentOptions.map((opt) => {
            const isSelected = selectedIntent === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedIntent(opt.id)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between min-h-[54px] ${
                  isSelected
                    ? 'bg-slate-800 border-teal-500/80 shadow-xs ring-1 ring-teal-500/30'
                    : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-teal-400/20 text-teal-300' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{opt.label}</h3>
                    <p className="text-[11px] text-slate-400">{opt.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border transition-colors shrink-0 ${
                    isSelected
                      ? 'border-teal-400 bg-teal-400'
                      : 'border-slate-600 bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Habit reflex check message */}
        {selectedIntent === 'habit' && (
          <div className="mt-4 p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/50 text-teal-200 text-xs animate-in fade-in duration-200">
            <span className="font-semibold block mb-0.5">Autopilot noticed.</span>
            <span>
              Most habit opens end in regret or lost time. Do you still want to continue?
            </span>
          </div>
        )}

        {/* 10-minute cap option */}
        {selectedIntent && selectedIntent !== 'habit' && (
          <div
            onClick={() => setUse10MinCap(!use10MinCap)}
            className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Use with 10-minute intention limit</span>
            </div>
            <input
              type="checkbox"
              checked={use10MinCap}
              onChange={() => {}}
              className="accent-teal-500"
            />
          </div>
        )}
      </div>

      {/* Bottom Decision Actions */}
      <div className="pt-4 pb-2 space-y-2.5">
        {selectedIntent === 'habit' ? (
          <>
            {/* If habit, emphasize Go Back */}
            <button
              onClick={handleGoBack}
              className="w-full h-12 rounded-xl bg-teal-500 text-slate-950 font-semibold text-sm flex items-center justify-center shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all hover:bg-teal-400"
            >
              Go Back (Skip Opening)
            </button>
            <button
              onClick={handleContinue}
              className="w-full h-10 rounded-xl text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center transition-colors"
            >
              Continue to {app.name} anyway
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm flex items-center justify-center active:scale-[0.98] transition-colors border border-slate-700"
            >
              Go Back
            </button>

            <button
              onClick={handleContinue}
              className="flex-1 h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center shadow-lg shadow-white/10 active:scale-[0.98] transition-all"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
