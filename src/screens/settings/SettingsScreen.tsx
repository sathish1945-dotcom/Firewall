import React, { useState } from 'react';
import {
  ProtectedApp,
  RuleConfiguration,
  ProtectionState,
  UserGoal,
} from '../../types';
import { LocalEventStore } from '../../services/storage/localEventStore';
import { AVAILABLE_APPS } from '../../services/data/defaultApps';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  Sliders,
  Clock,
  Moon,
  Trash2,
  Download,
  Info,
  Check,
  Lock,
  EyeOff,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  protectedApps: ProtectedApp[];
  rules: RuleConfiguration;
  protectionState: ProtectionState;
  userGoal: UserGoal;
  onUpdateProtectedApps: (apps: ProtectedApp[]) => void;
  onUpdateRules: (rules: RuleConfiguration) => void;
  onPauseProtection: (durationHours: number | null) => void;
  onResumeProtection: () => void;
  onDataReset: () => void;
  onOpenResearcher?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  protectedApps,
  rules,
  protectionState,
  userGoal,
  onUpdateProtectedApps,
  onUpdateRules,
  onPauseProtection,
  onResumeProtection,
  onDataReset,
  onOpenResearcher,
}) => {
  const [activeSection, setActiveSection] = useState<
    'main' | 'apps' | 'rules' | 'privacy' | 'premium'
  >('main');

  const [localRules, setLocalRules] = useState<RuleConfiguration>(rules);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(
    protectedApps.map((a) => a.id)
  );
  const [copiedExport, setCopiedExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // App selection handlers
  const handleToggleApp = (app: ProtectedApp) => {
    if (selectedAppIds.includes(app.id)) {
      if (selectedAppIds.length <= 1) return; // Keep at least 1
      setSelectedAppIds(selectedAppIds.filter((id) => id !== app.id));
    } else {
      if (selectedAppIds.length >= 3) return; // Enforce max 3 in free tier
      setSelectedAppIds([...selectedAppIds, app.id]);
    }
  };

  const handleSaveApps = () => {
    const selected = AVAILABLE_APPS.filter((a) => selectedAppIds.includes(a.id)).slice(0, 3);
    onUpdateProtectedApps(selected);
    LocalEventStore.setProtectedApps(selected);
    setActiveSection('main');
  };

  const handleSaveRules = () => {
    onUpdateRules(localRules);
    LocalEventStore.setRules(localRules);
    setActiveSection('main');
  };

  const handleExportData = () => {
    const data = LocalEventStore.exportDataAsJSON();
    navigator.clipboard.writeText(data).then(() => {
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2000);
    });
  };

  const handleDeleteData = () => {
    LocalEventStore.deleteLocalData();
    setShowDeleteConfirm(false);
    onDataReset();
  };

  return (
    <div className="flex-1 flex flex-col p-5 bg-slate-50 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeSection !== 'main') {
                setActiveSection('main');
              } else {
                onBack();
              }
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {activeSection === 'main'
                ? 'Settings'
                : activeSection === 'apps'
                ? 'Protected Apps'
                : activeSection === 'rules'
                ? 'Protection Rules'
                : activeSection === 'privacy'
                ? 'Privacy & Storage'
                : 'Free vs Future'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeSection === 'main' ? 'Privacy, thresholds & rules' : 'Impulse Firewall'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Navigation */}
      {activeSection === 'main' && (
        <div className="space-y-4">
          {/* Section: Core Protection */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {/* Protected Apps Item */}
            <button
              onClick={() => setActiveSection('apps')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Protected Apps</div>
                  <div className="text-xs text-slate-500">
                    {protectedApps.length} / 3 selected ({protectedApps.map((a) => a.name).join(', ')})
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Protection Rules Item */}
            <button
              onClick={() => setActiveSection('rules')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Protection Rules</div>
                  <div className="text-xs text-slate-500">
                    Repeated opens, quick reopen, cooldown ({rules.cooldownMinutes}m)
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Pause Protection toggle */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">Pause Protection</div>
                <div className="text-xs text-slate-500">
                  {protectionState.isPaused ? 'Currently paused' : 'Active and monitoring'}
                </div>
              </div>
              {protectionState.isPaused ? (
                <button
                  onClick={onResumeProtection}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={() => onPauseProtection(1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Pause 1h
                </button>
              )}
            </div>
          </div>

          {/* Section: Privacy & Transparency */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs divide-y divide-slate-100">
            <button
              onClick={() => setActiveSection('privacy')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Privacy & Permissions</div>
                  <div className="text-xs text-slate-500">
                    Local-first architecture, zero surveillance
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Future Architecture Placeholder */}
            <button
              onClick={() => setActiveSection('premium')}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Free vs Future Roadmap</div>
                  <div className="text-xs text-slate-500">
                    3 apps limit, no ads ever, future extensions
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Researcher Console Link */}
            {onOpenResearcher && (
              <button
                onClick={onOpenResearcher}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Researcher Console</div>
                    <div className="text-xs text-slate-500">
                      15-User interview protocol & validation metrics
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>

          {/* Section: Data Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Local Data Controls
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{copiedExport ? 'Copied to Clipboard!' : 'Export JSON Data'}</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2 px-3 rounded-xl border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                <p className="text-rose-900 font-medium">
                  Delete all local behavioral events and history?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteData}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold text-xs"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1 bg-white border border-rose-200 text-slate-700 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* About & Philosophy */}
          <div className="text-center pt-2 pb-6 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-500">Impulse Firewall v1.0 Prototype</p>
            <p>Do not lock your phone. Catch the moment before autopilot takes over.</p>
          </div>
        </div>
      )}

      {/* SUB-SCREEN: Protected Apps Manager */}
      {activeSection === 'apps' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-800 flex items-center justify-between">
            <span>Free Tier Maximum: 3 protected apps</span>
            <span className="font-bold">{selectedAppIds.length} / 3</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto">
            {AVAILABLE_APPS.map((app) => {
              const isSelected = selectedAppIds.includes(app.id);
              return (
                <button
                  key={app.id}
                  onClick={() => handleToggleApp(app)}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-2xs ring-1 ring-slate-900/10'
                      : 'bg-white/80 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                      style={{ backgroundColor: app.iconBg, color: app.iconColor }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{app.name}</h4>
                      <p className="text-[11px] text-slate-500 capitalize">{app.category}</p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
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
          </div>

          <button
            onClick={handleSaveApps}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center mt-4"
          >
            Save Protected Apps
          </button>
        </div>
      )}

      {/* SUB-SCREEN: Rules Configuration */}
      {activeSection === 'rules' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-4">
            <div>
              <label className="text-slate-900 font-bold block mb-1">
                Prompt Cooldown ({localRules.cooldownMinutes} minutes)
              </label>
              <p className="text-slate-500 mb-2">
                Prevents repeated interruptions for the same app within this timeframe.
              </p>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={localRules.cooldownMinutes}
                onChange={(e) =>
                  setLocalRules({ ...localRules, cooldownMinutes: Number(e.target.value) })
                }
                className="w-full accent-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-slate-900 font-bold block">Repeated Opens Threshold</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block mb-1">Max Opens:</span>
                  <select
                    value={localRules.repeatedOpens.maxOpens}
                    onChange={(e) =>
                      setLocalRules({
                        ...localRules,
                        repeatedOpens: {
                          ...localRules.repeatedOpens,
                          maxOpens: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value={2}>2 opens</option>
                    <option value={3}>3 opens</option>
                    <option value={4}>4 opens</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Window:</span>
                  <select
                    value={localRules.repeatedOpens.windowMinutes}
                    onChange={(e) =>
                      setLocalRules({
                        ...localRules,
                        repeatedOpens: {
                          ...localRules.repeatedOpens,
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

            <div className="pt-3 border-t border-slate-100">
              <label className="text-slate-900 font-bold block mb-1">
                Quick Reopening Window ({localRules.quickReopen.windowMinutes} minutes)
              </label>
              <p className="text-slate-500 mb-2">
                Triggers when reopening right after closing.
              </p>
              <select
                value={localRules.quickReopen.windowMinutes}
                onChange={(e) =>
                  setLocalRules({
                    ...localRules,
                    quickReopen: {
                      ...localRules.quickReopen,
                      windowMinutes: Number(e.target.value),
                    },
                  })
                }
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value={1}>1 minute</option>
                <option value={2}>2 minutes</option>
                <option value={5}>5 minutes</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveRules}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-medium text-xs flex items-center justify-center mt-2"
          >
            Save Rule Settings
          </button>
        </div>
      )}

      {/* SUB-SCREEN: Privacy Trust Breakdown */}
      {activeSection === 'privacy' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <EyeOff className="w-4 h-4 text-teal-600" />
              <span>Zero Content Access Guarantee</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Impulse Firewall inspects metadata (e.g., "com.instagram.android foregrounded at 14:02"). It does not and cannot view:
            </p>
            <ul className="space-y-1.5 pl-2 text-slate-600">
              <li>• Chat or direct message contents</li>
              <li>• Passwords, account names, or logins</li>
              <li>• Keystrokes or typed search terms</li>
              <li>• Videos, photos, or feed contents</li>
              <li>• Any application not in your protected list</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900">On-Device Processing</h4>
            <p className="text-slate-600 leading-relaxed">
              All events, frequency calculations, and weekly metrics are calculated locally. No third-party behavioral trackers or ad networks are integrated.
            </p>
          </div>
        </div>
      )}

      {/* SUB-SCREEN: Free vs Future Roadmap */}
      {activeSection === 'premium' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Current Free Tier</h4>
              <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                Active
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>✓ Maximum 3 protected apps</li>
              <li>✓ Core frequency & quick-reopen rules</li>
              <li>✓ Reflective micro-pause intervention</li>
              <li>✓ Weekly behavioral report</li>
              <li>✓ 100% private local storage</li>
              <li>✓ Zero advertisements forever</li>
            </ul>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Future Premium Tier</h4>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
                Roadmap Preview
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              No payments collected in prototype. Designed for thoughtful attention-conscious users:
            </p>
            <ul className="space-y-1.5 text-slate-300">
              <li>• Unlimited protected applications</li>
              <li>• Custom focus schedule calendars</li>
              <li>• Deeper pattern & context insights</li>
              <li>• Cross-device browser extension companion</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
