/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ProtectedApp,
  RuleConfiguration,
  ProtectionState,
  UserGoal,
  BehavioralEvent,
  RuleEvaluationResult,
  UserIntent,
  ValidationSession,
  InterventionVariant,
  FatigueRating,
  RegretRating,
} from './types';
import { LocalEventStore } from './services/storage/localEventStore';
import { appUsageProvider } from './services/platform/AppUsageProvider';
import { BehavioralAnalytics } from './services/analytics/behavioralAnalytics';
import { DeviceFrame } from './components/common/DeviceFrame';
import { WelcomeScreen } from './screens/onboarding/WelcomeScreen';
import { GoalScreen } from './screens/onboarding/GoalScreen';
import { ProtectedAppsScreen } from './screens/onboarding/ProtectedAppsScreen';
import { PrivacyPermissionsScreen } from './screens/onboarding/PrivacyPermissionsScreen';
import { RulesSetupScreen } from './screens/onboarding/RulesSetupScreen';
import { DashboardScreen } from './screens/dashboard/DashboardScreen';
import { MicroPauseScreen } from './screens/intervention/MicroPauseScreen';
import { ActivityScreen } from './screens/activity/ActivityScreen';
import { WeeklyReportScreen } from './screens/report/WeeklyReportScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { ResearcherScreen } from './screens/researcher/ResearcherScreen';
import { DemoSimulatorPanel } from './components/demo/DemoSimulatorPanel';
import { RuleEngineTestSuiteModal } from './components/tests/RuleEngineTestSuiteModal';
import { FatigueSurveyModal, RegretSurveyModal } from './components/validation/ValidationSurveyModals';

type ScreenState =
  | 'welcome'
  | 'goal'
  | 'protected_apps'
  | 'privacy_permissions'
  | 'rules_setup'
  | 'dashboard'
  | 'activity'
  | 'report'
  | 'settings'
  | 'researcher';

export default function App() {
  // Navigation & Screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    return LocalEventStore.isOnboardingCompleted() ? 'dashboard' : 'welcome';
  });

  // Core Data States
  const [protectedApps, setProtectedApps] = useState<ProtectedApp[]>(() =>
    LocalEventStore.getProtectedApps()
  );
  const [rules, setRules] = useState<RuleConfiguration>(() =>
    LocalEventStore.getRules()
  );
  const [protectionState, setProtectionState] = useState<ProtectionState>(() =>
    LocalEventStore.getProtectionState()
  );
  const [userGoal, setUserGoal] = useState<UserGoal>(() =>
    LocalEventStore.getGoal()
  );
  const [events, setEvents] = useState<BehavioralEvent[]>(() =>
    LocalEventStore.getEvents()
  );

  // Validation Session State
  const [activeSession, setActiveSession] = useState<ValidationSession | null>(() =>
    LocalEventStore.getCurrentValidationSession()
  );
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() =>
    LocalEventStore.isDemoModeActive()
  );

  // Active Micro-Pause Intervention Overlay State
  const [activeIntervention, setActiveIntervention] = useState<{
    app: ProtectedApp;
    evaluation: RuleEvaluationResult;
    onDecision: (decision: {
      continued: boolean;
      cancelled: boolean;
      userIntent?: UserIntent;
      durationMinutes?: number;
      durationMs?: number;
      bypassed?: boolean;
    }) => void;
  } | null>(null);

  // Modals & Instrumentation Controls
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isTestSuiteOpen, setIsTestSuiteOpen] = useState(false);
  const [isFatigueSurveyOpen, setIsFatigueSurveyOpen] = useState(false);
  const [isRegretSurveyOpen, setIsRegretSurveyOpen] = useState(false);

  // Reload events & validation session from storage
  const refreshState = useCallback(() => {
    setEvents([...LocalEventStore.getEvents()]);
    setActiveSession(LocalEventStore.getCurrentValidationSession());
    setIsDemoMode(LocalEventStore.isDemoModeActive());
  }, []);

  // Listen to platform launch triggers from AppUsageProvider
  useEffect(() => {
    const unsubscribe = appUsageProvider.registerLaunchListener(
      ({ app, evaluation, onUserDecision }) => {
        setActiveIntervention({
          app,
          evaluation,
          onDecision: (decision) => {
            onUserDecision(decision);
            setActiveIntervention(null);
            refreshState();

            // Fatigue measurement trigger: after several interventions in an active session
            const current = LocalEventStore.getCurrentValidationSession();
            if (
              current &&
              current.interventionsShown >= 3 &&
              !current.fatigueRating
            ) {
              setTimeout(() => {
                setIsFatigueSurveyOpen(true);
              }, 600);
            }
          },
        });
      }
    );
    return () => unsubscribe();
  }, [refreshState]);

  // Handle Simulated App Open
  const handleSimulateOpen = async (app: ProtectedApp, customTimestamp?: number) => {
    const result = await appUsageProvider.simulateAppOpen(app, customTimestamp);
    if (!result.evaluation.shouldIntervene) {
      refreshState();
    }
  };

  const handleSimulateClose = (appId: string) => {
    appUsageProvider.recordAppClose(appId);
  };

  // Pause / Resume protection
  const handlePauseProtection = (hours: number | null) => {
    const pausedUntil = hours ? Date.now() + hours * 3600 * 1000 : null;
    const newState: ProtectionState = { isPaused: true, pausedUntil };
    LocalEventStore.setProtectionState(newState);
    setProtectionState(newState);
  };

  const handleResumeProtection = () => {
    const newState: ProtectionState = { isPaused: false, pausedUntil: null };
    LocalEventStore.setProtectionState(newState);
    setProtectionState(newState);
  };

  // Validation Session actions
  const handleStartSession = (
    participantId: string,
    variant: InterventionVariant,
    notes: string
  ) => {
    const newSession = LocalEventStore.startValidationSession(participantId, variant, notes);
    setActiveSession(newSession);
    setIsDemoMode(false);
    refreshState();
  };

  const handleEndSession = () => {
    const session = LocalEventStore.getCurrentValidationSession();
    if (session && !session.regretRating) {
      // Trigger regret check before closing session
      setIsRegretSurveyOpen(true);
    }
    LocalEventStore.endValidationSession();
    setActiveSession(null);
    setIsDemoMode(true);
    refreshState();
  };

  const handleResetDemo = () => {
    LocalEventStore.resetDemoData();
    refreshState();
  };

  const handleFatigueSelect = (rating: FatigueRating) => {
    LocalEventStore.recordValidationFatigue(rating);
    setIsFatigueSurveyOpen(false);
    refreshState();
  };

  const handleRegretSelect = (rating: RegretRating) => {
    LocalEventStore.recordValidationRegret(rating);
    setIsRegretSurveyOpen(false);
    refreshState();
  };

  // Onboarding sequence handlers
  const handleCompleteWelcome = () => setCurrentScreen('goal');
  const handleGoalChosen = (goal: UserGoal) => {
    setUserGoal(goal);
    LocalEventStore.setGoal(goal);
    setCurrentScreen('protected_apps');
  };
  const handleAppsChosen = (apps: ProtectedApp[]) => {
    setProtectedApps(apps);
    LocalEventStore.setProtectedApps(apps);
    setCurrentScreen('privacy_permissions');
  };
  const handlePrivacyApproved = () => setCurrentScreen('rules_setup');
  const handleRulesFinished = (configuredRules: RuleConfiguration) => {
    setRules(configuredRules);
    LocalEventStore.setRules(configuredRules);
    LocalEventStore.setOnboardingCompleted(true);
    setCurrentScreen('dashboard');
  };

  // Reset entire data
  const handleDataReset = () => {
    refreshState();
    setProtectionState(LocalEventStore.getProtectionState());
  };

  // Today metrics (for consumer dashboard)
  const todayEvents = BehavioralAnalytics.filterEventsToday(events);
  const todayStats = BehavioralAnalytics.calculateSummary(todayEvents);

  // Active intervention variant
  const currentVariant: InterventionVariant = activeSession
    ? activeSession.variant
    : LocalEventStore.getActiveVariant();

  return (
    <DeviceFrame
      onOpenSimulator={() => setIsSimulatorOpen(true)}
      onOpenResearcher={() => setCurrentScreen('researcher')}
      isSimulatorOpen={isSimulatorOpen}
      activeInterventionCountToday={todayStats.interventions}
      activeSession={activeSession}
      isDemoMode={isDemoMode}
    >
      {/* ONBOARDING FLOW */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen onGetStarted={handleCompleteWelcome} />
      )}

      {currentScreen === 'goal' && (
        <GoalScreen
          onBack={() => setCurrentScreen('welcome')}
          onContinue={handleGoalChosen}
          initialGoal={userGoal}
        />
      )}

      {currentScreen === 'protected_apps' && (
        <ProtectedAppsScreen
          onBack={() => setCurrentScreen('goal')}
          onContinue={handleAppsChosen}
          initialSelected={protectedApps}
        />
      )}

      {currentScreen === 'privacy_permissions' && (
        <PrivacyPermissionsScreen
          onBack={() => setCurrentScreen('protected_apps')}
          onContinue={handlePrivacyApproved}
          onNotNow={() => setCurrentScreen('rules_setup')}
        />
      )}

      {currentScreen === 'rules_setup' && (
        <RulesSetupScreen
          onBack={() => setCurrentScreen('privacy_permissions')}
          onFinish={handleRulesFinished}
          initialRules={rules}
        />
      )}

      {/* MAIN APPLICATION SCREENS */}
      {currentScreen === 'dashboard' && (
        <DashboardScreen
          protectedApps={protectedApps}
          protectionState={protectionState}
          todayStats={todayStats}
          userGoal={userGoal}
          onPauseProtection={handlePauseProtection}
          onResumeProtection={handleResumeProtection}
          onNavigateToActivity={() => setCurrentScreen('activity')}
          onNavigateToReport={() => setCurrentScreen('report')}
          onNavigateToSettings={() => setCurrentScreen('settings')}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
      )}

      {currentScreen === 'activity' && (
        <ActivityScreen
          onBack={() => setCurrentScreen('dashboard')}
          events={events}
          protectedApps={protectedApps}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
        />
      )}

      {currentScreen === 'report' && (
        <WeeklyReportScreen
          onBack={() => setCurrentScreen('dashboard')}
          events={events}
          protectedApps={protectedApps}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('dashboard')}
          protectedApps={protectedApps}
          rules={rules}
          protectionState={protectionState}
          userGoal={userGoal}
          onUpdateProtectedApps={(newApps) => {
            setProtectedApps(newApps);
            refreshState();
          }}
          onUpdateRules={setRules}
          onPauseProtection={handlePauseProtection}
          onResumeProtection={handleResumeProtection}
          onDataReset={handleDataReset}
          onOpenResearcher={() => setCurrentScreen('researcher')}
        />
      )}

      {/* RESEARCHER CONSOLE & VALIDATION DASHBOARD */}
      {currentScreen === 'researcher' && (
        <ResearcherScreen
          onBack={() => setCurrentScreen('dashboard')}
          activeSession={activeSession}
          onStartSession={handleStartSession}
          onEndSession={handleEndSession}
          onResetDemo={handleResetDemo}
          onRefresh={refreshState}
        />
      )}

      {/* MICRO-PAUSE INTERVENTION MODAL */}
      {activeIntervention && (
        <MicroPauseScreen
          app={activeIntervention.app}
          evaluation={activeIntervention.evaluation}
          variant={currentVariant}
          onDecision={activeIntervention.onDecision}
        />
      )}

      {/* DEMO EVENT SIMULATOR PANEL */}
      <DemoSimulatorPanel
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        protectedApps={protectedApps}
        onTriggerSimulatedOpen={handleSimulateOpen}
        onSimulateCloseApp={handleSimulateClose}
        onOpenTestSuite={() => setIsTestSuiteOpen(true)}
        onOpenResearcher={() => {
          setIsSimulatorOpen(false);
          setCurrentScreen('researcher');
        }}
        onTriggerFatigueSurvey={() => setIsFatigueSurveyOpen(true)}
        onTriggerRegretSurvey={() => setIsRegretSurveyOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* AUTOMATED TEST RUNNER MODAL */}
      <RuleEngineTestSuiteModal
        isOpen={isTestSuiteOpen}
        onClose={() => setIsTestSuiteOpen(false)}
      />

      {/* VALIDATION SURVEY MODALS */}
      <FatigueSurveyModal
        isOpen={isFatigueSurveyOpen}
        onSelect={handleFatigueSelect}
        onDismiss={() => setIsFatigueSurveyOpen(false)}
      />

      <RegretSurveyModal
        isOpen={isRegretSurveyOpen}
        onSelect={handleRegretSelect}
        onDismiss={() => setIsRegretSurveyOpen(false)}
      />
    </DeviceFrame>
  );
}
