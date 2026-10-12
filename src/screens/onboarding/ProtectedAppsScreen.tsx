import React, { useState } from 'react';
import { ProtectedApp } from '../../types';
import { AVAILABLE_APPS } from '../../services/data/defaultApps';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';

interface ProtectedAppsScreenProps {
  onBack: () => void;
  onContinue: (selectedApps: ProtectedApp[]) => void;
  initialSelected?: ProtectedApp[];
}

export const ProtectedAppsScreen: React.FC<ProtectedAppsScreenProps> = ({
  onBack,
  onContinue,
  initialSelected = [],
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelected.length > 0 ? initialSelected.map((a) => a.id).slice(0, 3) : ['instagram', 'youtube']
  );
  const [limitWarning, setLimitWarning] = useState<boolean>(false);

  const toggleApp = (app: ProtectedApp) => {
    if (selectedIds.includes(app.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== app.id));
      setLimitWarning(false);
    } else {
      if (selectedIds.length >= 3) {
        setLimitWarning(true);
        setTimeout(() => setLimitWarning(false), 2500);
        return;
      }
      setSelectedIds([...selectedIds, app.id]);
      setLimitWarning(false);
    }
  };

  const handleContinue = () => {
    const chosen = AVAILABLE_APPS.filter((a) => selectedIds.includes(a.id)).slice(0, 3);
    onContinue(chosen);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50">
      <div>
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
              Step 2 of 4
            </div>
          </div>

          {/* Counter badge */}
          <div
            className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
              selectedIds.length === 3
                ? 'bg-slate-900 text-white'
                : selectedIds.length > 0
                ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {selectedIds.length} / 3 selected
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Which apps pull you in automatically?
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Start small. Impulse Firewall works best when protecting the apps that cause the most unwanted opens.
        </p>

        {limitWarning && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Maximum 3 apps allowed in MVP to prevent cognitive overload.</span>
          </div>
        )}

        {/* Installed Apps List */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {AVAILABLE_APPS.map((app) => {
            const isSelected = selectedIds.includes(app.id);
            return (
              <button
                key={app.id}
                onClick={() => toggleApp(app)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between min-h-[58px] ${
                  isSelected
                    ? 'bg-white border-slate-900 shadow-xs ring-1 ring-slate-900/10'
                    : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                    style={{ backgroundColor: app.iconBg, color: app.iconColor }}
                  >
                    {app.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{app.name}</h3>
                    <p className="text-[11px] text-slate-500 capitalize">{app.category}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-6 pb-2">
        <button
          onClick={handleContinue}
          disabled={selectedIds.length === 0}
          className={`w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center shadow-lg transition-all ${
            selectedIds.length > 0
              ? 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {selectedIds.length === 0 ? 'Select at least 1 app' : `Continue (${selectedIds.length} protected)`}
        </button>
      </div>
    </div>
  );
};
