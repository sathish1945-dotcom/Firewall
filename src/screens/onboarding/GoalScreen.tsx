import React, { useState } from 'react';
import { UserGoal } from '../../types';
import { PRESET_GOALS } from '../../services/data/defaultApps';
import { Check, ArrowLeft, Plus } from 'lucide-react';

interface GoalScreenProps {
  onBack: () => void;
  onContinue: (goal: UserGoal) => void;
  initialGoal?: UserGoal;
}

export const GoalScreen: React.FC<GoalScreenProps> = ({
  onBack,
  onContinue,
  initialGoal = PRESET_GOALS[0],
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(initialGoal.id);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(Boolean(initialGoal.isCustom));
  const [customTitle, setCustomTitle] = useState<string>(initialGoal.isCustom ? initialGoal.title : '');

  const handleSelectPreset = (goal: UserGoal) => {
    setSelectedGoalId(goal.id);
    setIsCustomMode(false);
  };

  const handleSelectCustom = () => {
    setSelectedGoalId('custom');
    setIsCustomMode(true);
  };

  const handleContinue = () => {
    if (isCustomMode) {
      const trimmed = customTitle.trim() || 'Custom Intentional Goal';
      onContinue({
        id: 'custom',
        title: trimmed,
        description: 'Personalized focus intention.',
        isCustom: true,
      });
    } else {
      const found = PRESET_GOALS.find((g) => g.id === selectedGoalId) || PRESET_GOALS[0];
      onContinue(found);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
            Step 1 of 4
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          What do you want to change?
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Pick your primary objective. Impulse Firewall tunes its pauses around your intention.
        </p>

        {/* Options list */}
        <div className="space-y-3">
          {PRESET_GOALS.map((goal) => {
            const isSelected = !isCustomMode && selectedGoalId === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => handleSelectPreset(goal)}
                className={`w-full p-4 rounded-2xl text-left border transition-all flex items-start justify-between min-h-[56px] ${
                  isSelected
                    ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="pr-3">
                  <h3 className="text-sm font-semibold text-slate-900">{goal.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {goal.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}

          {/* Custom goal option */}
          <div
            onClick={handleSelectCustom}
            className={`w-full p-4 rounded-2xl border transition-all cursor-pointer ${
              isCustomMode
                ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span>Create my own goal</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define a specific behavioral trigger you want to pause
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                  isCustomMode
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isCustomMode && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {isCustomMode && (
              <div className="mt-3 pt-3 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  placeholder="e.g. Stop opening news before getting out of bed"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-slate-900 bg-slate-50/50"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-6 pb-2">
        <button
          onClick={handleContinue}
          className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all hover:bg-slate-800"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
