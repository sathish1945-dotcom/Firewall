import {
  AppOpenRecord,
  BehavioralEvent,
  ProtectedApp,
  RuleEvaluationResult,
  TriggerRuleType,
  UserIntent,
  ValidationSessionEvent,
} from '../../types';
import { LocalEventStore } from '../storage/localEventStore';
import { RuleEngine } from '../rules/ruleEngine';

export interface AppLaunchListener {
  (params: {
    app: ProtectedApp;
    evaluation: RuleEvaluationResult;
    onUserDecision: (decision: {
      continued: boolean;
      cancelled: boolean;
      userIntent?: UserIntent;
      durationMinutes?: number;
      durationMs?: number;
      bypassed?: boolean;
    }) => void;
  }): void;
}

/**
 * Interface that can be implemented by Web/Demo provider or Native Android Kotlin Bridge
 */
export interface IAppUsageProvider {
  platformName: 'web_simulator' | 'android_native';
  isMonitoringActive(): boolean;
  simulateAppOpen(
    app: ProtectedApp,
    customTimestamp?: number
  ): Promise<{
    evaluation: RuleEvaluationResult;
    event?: BehavioralEvent;
  }>;
  recordAppClose(appId: string, timestamp?: number): void;
  registerLaunchListener(listener: AppLaunchListener): () => void;
}

/**
 * Web Demo Implementation of AppUsageProvider with Validation Session isolation
 */
export class WebAppUsageProvider implements IAppUsageProvider {
  platformName: 'web_simulator' = 'web_simulator';
  private listeners: Set<AppLaunchListener> = new Set();

  isMonitoringActive(): boolean {
    const protectionState = LocalEventStore.getProtectionState();
    return !protectionState.isPaused;
  }

  registerLaunchListener(listener: AppLaunchListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  recordAppClose(appId: string, timestamp: number = Date.now()): void {
    LocalEventStore.recordAppClose(appId, timestamp);
  }

  async simulateAppOpen(
    app: ProtectedApp,
    customTimestamp: number = Date.now()
  ): Promise<{
    evaluation: RuleEvaluationResult;
    event?: BehavioralEvent;
  }> {
    const protectedApps = LocalEventStore.getProtectedApps();
    const isProtected = protectedApps.some((p) => p.id === app.id);
    const protectionState = LocalEventStore.getProtectionState();
    const rulesConfig = LocalEventStore.getRules();
    const cooldowns = LocalEventStore.getAppCooldowns();
    const lastPromptTimestamp = cooldowns[app.id];
    const isDemo = LocalEventStore.isDemoModeActive();
    const activeVariant = LocalEventStore.getActiveVariant();

    // Record open record into recent buffer
    const openRecord: AppOpenRecord = {
      id: `open_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      appId: app.id,
      timestamp: customTimestamp,
    };
    LocalEventStore.addAppOpen(openRecord);

    const recentOpens = LocalEventStore.getRecentOpens();

    // Evaluate against Rule Engine
    const evaluation = RuleEngine.evaluateOpen({
      appId: app.id,
      isProtected,
      isPaused: protectionState.isPaused,
      rulesConfig,
      recentOpens,
      lastPromptTimestamp,
      currentTime: customTimestamp,
    });

    const currentSession = LocalEventStore.getCurrentValidationSession();

    if (evaluation.shouldIntervene) {
      // Cooldown will be set once prompt is dispatched
      LocalEventStore.setAppCooldown(app.id, customTimestamp);

      // Notify UI listeners
      this.notifyListeners({
        app,
        evaluation,
        onUserDecision: (decision) => {
          const durationMs = decision.durationMs || 3000;
          const bypassed = Boolean(decision.bypassed || (decision.continued && durationMs < 1200));

          const behavioralEvent: BehavioralEvent = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: customTimestamp,
            protectedAppId: app.id,
            protectedAppName: app.name,
            triggerType: evaluation.triggerType,
            promptShown: true,
            userIntent: decision.userIntent,
            continued: decision.continued,
            cancelled: decision.cancelled,
            intendedDurationMinutes: decision.durationMinutes,
            origin: isDemo ? 'seed_demo' : 'user_test_session',
            variant: activeVariant,
            durationMs,
          };
          LocalEventStore.addEvent(behavioralEvent);

          // If active validation session, log cleanly into isolated session
          if (currentSession) {
            const valEvent: ValidationSessionEvent = {
              id: behavioralEvent.id,
              timestamp: customTimestamp,
              appId: app.id,
              appName: app.name,
              triggerType: evaluation.triggerType,
              promptShown: true,
              variant: activeVariant,
              userIntent: decision.userIntent,
              continued: decision.continued,
              cancelled: decision.cancelled,
              durationMs,
              bypassed,
            };
            LocalEventStore.recordValidationEvent(valEvent, false);
          }
        },
      });

      return { evaluation };
    } else {
      // Normal open or suppressed by cooldown
      const behavioralEvent: BehavioralEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: customTimestamp,
        protectedAppId: app.id,
        protectedAppName: app.name,
        triggerType: evaluation.triggerType,
        promptShown: false,
        continued: true,
        cancelled: false,
        origin: isDemo ? 'seed_demo' : 'user_test_session',
        variant: activeVariant,
        durationMs: 0,
      };
      LocalEventStore.addEvent(behavioralEvent);

      // If active validation session, log app open count and cooldown suppression
      if (currentSession) {
        const valEvent: ValidationSessionEvent = {
          id: behavioralEvent.id,
          timestamp: customTimestamp,
          appId: app.id,
          appName: app.name,
          triggerType: evaluation.triggerType,
          promptShown: false,
          variant: activeVariant,
          continued: true,
          cancelled: false,
          durationMs: 0,
          bypassed: false,
        };
        LocalEventStore.recordValidationEvent(valEvent, evaluation.cooldownActive);
      }

      return { evaluation, event: behavioralEvent };
    }
  }

  private notifyListeners(params: {
    app: ProtectedApp;
    evaluation: RuleEvaluationResult;
    onUserDecision: (decision: {
      continued: boolean;
      cancelled: boolean;
      userIntent?: UserIntent;
      durationMinutes?: number;
      durationMs?: number;
      bypassed?: boolean;
    }) => void;
  }): void {
    this.listeners.forEach((l) => l(params));
  }
}

export const appUsageProvider: IAppUsageProvider = new WebAppUsageProvider();
