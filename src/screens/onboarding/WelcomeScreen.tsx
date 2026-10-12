import React, { useState } from 'react';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { Shield, Sparkles, Clock, CheckCircle2, X } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50 relative">
      {/* Top branding */}
      <div className="pt-6">
        <BrandLogo size="lg" />
      </div>

      {/* Main hero value proposition */}
      <div className="my-auto py-8">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700 mb-6 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
          Pause before autopilot takes over.
        </h1>

        <p className="text-base text-slate-600 leading-relaxed max-w-sm">
          Impulse Firewall helps you notice unwanted app-opening habits without locking your phone.
        </p>

        {/* Quiet reassurance badges */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Never locks you out — you always stay in control</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>No passwords, keystrokes, or screen contents read</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Smart cooldowns prevent prompt fatigue</span>
          </div>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="space-y-3 pt-4 pb-2">
        <button
          onClick={onGetStarted}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all hover:bg-slate-800"
        >
          Get Started
        </button>

        <button
          onClick={() => setShowHowItWorks(true)}
          className="w-full h-11 rounded-xl text-slate-700 font-medium text-sm flex items-center justify-center hover:bg-slate-100 active:scale-[0.98] transition-colors"
        >
          How it works
        </button>
      </div>

      {/* How it works modal sheet */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">How Impulse Firewall Works</h3>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Screen-time reports arrive too late</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Looking at a graph at 9 PM doesn’t stop you from opening Reels at 2 PM. We intervene at the exact second you tap.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">A 3–5 second micro-pause</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We ask one simple, non-judgmental question: "What are you opening this for?" If it’s pure autopilot habit, you can turn back.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">You remain in total control</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No punitive locks, no shame screens. You can always choose to continue whenever you genuinely want to.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowHowItWorks(false);
                onGetStarted();
              }}
              className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center mt-2 hover:bg-slate-800"
            >
              Continue to Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
