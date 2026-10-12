import React, { useState } from 'react';
import { Smartphone, Maximize2, Minimize2, Battery, Wifi, ShieldAlert, Beaker, Shield } from 'lucide-react';
import { ValidationSession } from '../../types';

interface DeviceFrameProps {
  children: React.ReactNode;
  onOpenSimulator?: () => void;
  onOpenResearcher?: () => void;
  isSimulatorOpen?: boolean;
  activeInterventionCountToday?: number;
  activeSession?: ValidationSession | null;
  isDemoMode?: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  onOpenSimulator,
  onOpenResearcher,
  isSimulatorOpen,
  activeInterventionCountToday = 0,
  activeSession,
  isDemoMode = true,
}) => {
  const [frameMode, setFrameMode] = useState<'framed' | 'expanded'>('framed');

  // Format current Android status bar time
  const [timeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:py-6 sm:px-4 font-sans select-none antialiased">
      {/* Top Desktop Controls Bar (only visible on tablet/desktop) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Impulse Firewall</span>
          <span>·</span>
          <span>Android Prototype</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenResearcher && (
            <button
              onClick={onOpenResearcher}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900"
              title="Open Researcher Console"
            >
              <Beaker className="w-3.5 h-3.5" />
              <span>Researcher</span>
            </button>
          )}

          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isSimulatorOpen
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Demo Trigger</span>
            </button>
          )}

          <button
            onClick={() => setFrameMode(frameMode === 'framed' ? 'expanded' : 'framed')}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={frameMode === 'framed' ? 'Expand to tablet/full width' : 'Wrap in Android Frame'}
          >
            {frameMode === 'framed' ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minimize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Container - either realistic Android hardware frame or clean full container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col bg-slate-50 text-slate-900 overflow-hidden ${
          frameMode === 'framed'
            ? 'sm:max-w-[420px] sm:min-h-[850px] sm:h-[870px] sm:rounded-[44px] sm:ring-[10px] sm:ring-slate-800 sm:shadow-2xl relative'
            : 'max-w-2xl min-h-screen sm:rounded-2xl sm:shadow-xl'
        }`}
      >
        {/* Android Hardware Camera Punch-Hole & Status Bar */}
        <div className="w-full bg-slate-50 pt-2 px-6 pb-1.5 flex items-center justify-between text-xs font-medium text-slate-600 shrink-0 select-none border-b border-slate-100/60 z-30">
          <span>{timeStr}</span>

          {/* Android Centered Camera Hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-slate-700/50 hidden sm:block" />

          {/* Android Status Icons */}
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-mono">92%</span>
              <Battery className="w-4 h-4 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Obvious Internal Indicator for Mode Isolation */}
        <div
          className={`w-full px-4 py-1 text-[11px] font-medium flex items-center justify-between shrink-0 select-none border-b ${
            activeSession
              ? 'bg-amber-100/90 text-amber-900 border-amber-200'
              : isDemoMode
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : 'bg-teal-50 text-teal-800 border-teal-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                activeSession ? 'bg-amber-600 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {activeSession ? (
              <span>
                <strong>TEST SESSION ACTIVE:</strong> {activeSession.participantId} (
                {activeSession.variant === 'variant_a_fixed' ? 'Var A' : 'Var B'})
              </span>
            ) : isDemoMode ? (
              <span>
                <strong>DEMO MODE:</strong> Seeded data isolated
              </span>
            ) : (
              <span>
                <strong>TEST MODE:</strong> Clean validation
              </span>
            )}
          </div>

          {onOpenResearcher && (
            <button
              onClick={onOpenResearcher}
              className="text-[10px] font-semibold underline text-slate-700 hover:text-slate-900"
            >
              Console
            </button>
          )}
        </div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>

        {/* Android Gesture Navigation Bar */}
        <div className="w-full py-2 bg-slate-50 flex items-center justify-center shrink-0 border-t border-slate-100 select-none z-30">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>

      {/* Mobile-only floating Demo Trigger / Researcher shortcuts */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50 flex items-center gap-2">
        {onOpenResearcher && (
          <button
            onClick={onOpenResearcher}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-900 text-indigo-200 font-medium text-xs shadow-lg shadow-indigo-900/40 active:scale-95 transition-transform border border-indigo-800"
          >
            <Beaker className="w-3.5 h-3.5" />
            <span>Console</span>
          </button>
        )}

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 text-teal-400 font-medium text-xs shadow-lg shadow-slate-900/40 active:scale-95 transition-transform border border-slate-800"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Demo</span>
          </button>
        )}
      </div>
    </div>
  );
};
