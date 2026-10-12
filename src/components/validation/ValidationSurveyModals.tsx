import React from 'react';
import { FatigueRating, RegretRating } from '../../types';
import { HelpCircle, Sparkles, X } from 'lucide-react';

interface FatigueSurveyModalProps {
  isOpen: boolean;
  onSelect: (rating: FatigueRating) => void;
  onDismiss: () => void;
}

export const FatigueSurveyModal: React.FC<FatigueSurveyModalProps> = ({
  isOpen,
  onSelect,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Prompt-Fatigue Check
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            How did these pauses feel?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            We measure whether reflective prompts stay helpful or become annoying.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onSelect('helpful')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-medium text-slate-800 transition-all text-center"
          >
            Helpful
          </button>
          <button
            onClick={() => onSelect('neutral')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-medium text-slate-800 transition-all text-center"
          >
            Neutral
          </button>
          <button
            onClick={() => onSelect('slightly_annoying')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-medium text-slate-800 transition-all text-center"
          >
            Slightly annoying
          </button>
          <button
            onClick={() => onSelect('very_annoying')}
            className="p-3 rounded-xl border border-rose-200 text-rose-800 hover:bg-rose-50 font-medium transition-all text-center"
          >
            Very annoying
          </button>
        </div>
      </div>
    </div>
  );
};

interface RegretSurveyModalProps {
  isOpen: boolean;
  onSelect: (rating: RegretRating) => void;
  onDismiss: () => void;
}

export const RegretSurveyModal: React.FC<RegretSurveyModalProps> = ({
  isOpen,
  onSelect,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Intention & Regret Check
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">
            Looking back, were any of these app opens something you didn't actually want to do?
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Measuring whether autopilot opened apps you later wished you had avoided.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => onSelect('yes')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-semibold text-slate-800 transition-all text-center"
          >
            Yes
          </button>
          <button
            onClick={() => onSelect('some')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-semibold text-slate-800 transition-all text-center"
          >
            Some
          </button>
          <button
            onClick={() => onSelect('no')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 font-semibold text-slate-800 transition-all text-center"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};
