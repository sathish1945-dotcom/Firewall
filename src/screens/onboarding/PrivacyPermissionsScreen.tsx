import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, EyeOff, Lock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PrivacyPermissionsScreenProps {
  onBack: () => void;
  onContinue: () => void;
  onNotNow: () => void;
}

export const PrivacyPermissionsScreen: React.FC<PrivacyPermissionsScreenProps> = ({
  onBack,
  onContinue,
  onNotNow,
}) => {
  const [expandedPerm, setExpandedPerm] = useState<string | null>('usage');

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
            Step 3 of 4
          </div>
        </div>

        {/* Shield icon & headline */}
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Your behavior stays yours.
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Impulse Firewall needs limited Android access to detect when your selected apps open. All behavioral checks process locally on your device.
        </p>

        {/* Explicit NOT collected list */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span>What we will NEVER collect or access</span>
          </div>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>No text messages</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>No screen contents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>No passwords</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>No keystrokes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>No private chats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>No unrelated app data</span>
            </div>
          </div>
        </div>

        {/* Detailed Permission breakdowns */}
        <div className="space-y-2.5">
          {/* Permission 1: Usage Access */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <button
              onClick={() => setExpandedPerm(expandedPerm === 'usage' ? null : 'usage')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div>Usage Access</div>
                  <div className="text-[11px] font-normal text-slate-500">Detects app foreground switches</div>
                </div>
              </div>
              {expandedPerm === 'usage' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedPerm === 'usage' && (
              <div className="px-4 pb-3.5 pt-1 text-[11px] text-slate-600 space-y-1.5 border-t border-slate-100 bg-slate-50/40">
                <p>
                  <strong className="text-slate-900 font-medium">Why it is required:</strong> To recognize when one of your 3 protected apps has been opened.
                </p>
                <p>
                  <strong className="text-slate-900 font-medium">What it provides:</strong> App package name and timestamp of the launch event.
                </p>
                <p>
                  <strong className="text-slate-900 font-medium">What is NOT collected:</strong> Anything typed, viewed, searched, or tapped inside the app.
                </p>
              </div>
            )}
          </div>

          {/* Permission 2: Display Over Other Apps */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <button
              onClick={() => setExpandedPerm(expandedPerm === 'overlay' ? null : 'overlay')}
              className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-slate-900 hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div>Display Over Other Apps</div>
                  <div className="text-[11px] font-normal text-slate-500">Shows the 3-second reflection pause</div>
                </div>
              </div>
              {expandedPerm === 'overlay' ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedPerm === 'overlay' && (
              <div className="px-4 pb-3.5 pt-1 text-[11px] text-slate-600 space-y-1.5 border-t border-slate-100 bg-slate-50/40">
                <p>
                  <strong className="text-slate-900 font-medium">Why it is required:</strong> To present the gentle micro-pause overlay on top of the opening app.
                </p>
                <p>
                  <strong className="text-slate-900 font-medium">What it provides:</strong> Ability to render the reflective intention screen.
                </p>
                <p>
                  <strong className="text-slate-900 font-medium">What is NOT collected:</strong> Zero observation of other applications’ display buffers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2.5 pt-6 pb-2">
        <button
          onClick={onContinue}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all hover:bg-slate-800"
        >
          Continue
        </button>

        <button
          onClick={onNotNow}
          className="w-full h-10 rounded-xl text-slate-600 font-medium text-xs flex items-center justify-center hover:bg-slate-100 active:scale-[0.98] transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
};
