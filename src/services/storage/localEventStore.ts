import {
  BehavioralEvent,
  ProtectedApp,
  RuleConfiguration,
  ProtectionState,
  UserGoal,
  WeeklyFeedbackResponse,
  AppOpenRecord,
  ValidationSession,
  ValidationSessionEvent,
  InterviewResponse,
  InterventionVariant,
  FatigueRating,
  RegretRating,
} from '../../types';
import { AVAILABLE_APPS, DEFAULT_RULES, PRESET_GOALS } from '../data/defaultApps';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: 'impulse_firewall_onboarded',
  SELECTED_GOAL: 'impulse_firewall_goal',
  PROTECTED_APPS: 'impulse_firewall_protected_apps',
  RULES_CONFIG: 'impulse_firewall_rules',
  PROTECTION_STATE: 'impulse_firewall_protection_state',
  EVENTS_HISTORY: 'impulse_firewall_events',
  APP_OPENS_BUFFER: 'impulse_firewall_recent_opens',
  WEEKLY_FEEDBACK: 'impulse_firewall_weekly_feedback',
  COOLDOWNS: 'impulse_firewall_prompt_cooldowns',
  // Validation / Interview Isolation Keys
  TEST_SESSIONS: 'impulse_firewall_test_sessions',
  CURRENT_SESSION: 'impulse_firewall_current_session',
  INTERVIEW_RESPONSES: 'impulse_firewall_interviews',
  IS_DEMO_MODE: 'impulse_firewall_demo_mode_active',
  ACTIVE_VARIANT: 'impulse_firewall_experiment_variant',
};

// Seed sample historical events clearly tagged as origin: 'seed_demo'
function generateSeedEvents(): BehavioralEvent[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const events: BehavioralEvent[] = [];

  const apps = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'reddit', name: 'Reddit' },
  ];

  // Distribute over past 6 days
  for (let dayOffset = 6; dayOffset >= 1; dayOffset--) {
    const dayBase = now - dayOffset * dayMs;
    // Morning (around 8:30)
    events.push({
      id: `seed_${dayOffset}_1`,
      timestamp: dayBase + (8 * 3600 + 30 * 60) * 1000,
      protectedAppId: apps[0].id,
      protectedAppName: apps[0].name,
      triggerType: 'repeated_open',
      promptShown: true,
      userIntent: 'habit',
      continued: false,
      cancelled: true,
      origin: 'seed_demo',
      variant: 'variant_b_context',
      durationMs: 3800,
    });

    // Afternoon focus period (around 14:15)
    events.push({
      id: `seed_${dayOffset}_2`,
      timestamp: dayBase + (14 * 3600 + 15 * 60) * 1000,
      protectedAppId: apps[1].id,
      protectedAppName: apps[1].name,
      triggerType: 'focus_period',
      promptShown: true,
      userIntent: 'search',
      continued: true,
      cancelled: false,
      intendedDurationMinutes: 10,
      origin: 'seed_demo',
      variant: 'variant_b_context',
      durationMs: 4200,
    });

    // Evening quick reopen (around 20:45)
    events.push({
      id: `seed_${dayOffset}_3`,
      timestamp: dayBase + (20 * 3600 + 45 * 60) * 1000,
      protectedAppId: apps[0].id,
      protectedAppName: apps[0].name,
      triggerType: 'quick_reopen',
      promptShown: true,
      userIntent: 'habit',
      continued: false,
      cancelled: true,
      origin: 'seed_demo',
      variant: 'variant_b_context',
      durationMs: 3100,
    });

    // Late night on some days
    if (dayOffset % 2 === 0) {
      events.push({
        id: `seed_${dayOffset}_4`,
        timestamp: dayBase + (23 * 3600 + 40 * 60) * 1000,
        protectedAppId: apps[2].id,
        protectedAppName: apps[2].name,
        triggerType: 'late_night',
        promptShown: true,
        userIntent: 'habit',
        continued: false,
        cancelled: true,
        origin: 'seed_demo',
        variant: 'variant_b_context',
        durationMs: 2900,
      });
    }

    // A few normal opens without triggers
    events.push({
      id: `seed_${dayOffset}_norm1`,
      timestamp: dayBase + (11 * 3600 + 10 * 60) * 1000,
      protectedAppId: apps[0].id,
      protectedAppName: apps[0].name,
      triggerType: null,
      promptShown: false,
      continued: true,
      cancelled: false,
      origin: 'seed_demo',
    });
    events.push({
      id: `seed_${dayOffset}_norm2`,
      timestamp: dayBase + (17 * 3600 + 20 * 60) * 1000,
      protectedAppId: apps[1].id,
      protectedAppName: apps[1].name,
      triggerType: null,
      promptShown: false,
      continued: true,
      cancelled: false,
      origin: 'seed_demo',
    });
  }

  return events;
}

export class LocalEventStore {
  // Onboarding
  static isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  }

  static setOnboardingCompleted(completed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(completed));
  }

  // Selected Goal
  static getGoal(): UserGoal {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_GOAL);
    if (!raw) return PRESET_GOALS[0];
    try {
      return JSON.parse(raw);
    } catch {
      return PRESET_GOALS[0];
    }
  }

  static setGoal(goal: UserGoal): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_GOAL, JSON.stringify(goal));
  }

  // Protected Apps (Max 3)
  static getProtectedApps(): ProtectedApp[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROTECTED_APPS);
    if (!raw) {
      return AVAILABLE_APPS.slice(0, 3);
    }
    try {
      const parsed = JSON.parse(raw) as ProtectedApp[];
      return parsed.slice(0, 3);
    } catch {
      return AVAILABLE_APPS.slice(0, 3);
    }
  }

  static setProtectedApps(apps: ProtectedApp[]): boolean {
    if (apps.length > 3) {
      console.warn('Impulse Firewall strictly restricts protected apps to a maximum of 3');
      apps = apps.slice(0, 3);
    }
    localStorage.setItem(STORAGE_KEYS.PROTECTED_APPS, JSON.stringify(apps));
    return true;
  }

  // Rules Configuration
  static getRules(): RuleConfiguration {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES_CONFIG);
    if (!raw) return DEFAULT_RULES;
    try {
      return { ...DEFAULT_RULES, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_RULES;
    }
  }

  static setRules(rules: RuleConfiguration): void {
    localStorage.setItem(STORAGE_KEYS.RULES_CONFIG, JSON.stringify(rules));
  }

  // Protection State
  static getProtectionState(): ProtectionState {
    const raw = localStorage.getItem(STORAGE_KEYS.PROTECTION_STATE);
    if (!raw) return { isPaused: false, pausedUntil: null };
    try {
      const parsed = JSON.parse(raw) as ProtectionState;
      if (parsed.isPaused && parsed.pausedUntil && Date.now() >= parsed.pausedUntil) {
        const resumedState: ProtectionState = { isPaused: false, pausedUntil: null };
        this.setProtectionState(resumedState);
        return resumedState;
      }
      return parsed;
    } catch {
      return { isPaused: false, pausedUntil: null };
    }
  }

  static setProtectionState(state: ProtectionState): void {
    localStorage.setItem(STORAGE_KEYS.PROTECTION_STATE, JSON.stringify(state));
  }

  // Cooldowns per app
  static getAppCooldowns(): Record<string, number> {
    const raw = localStorage.getItem(STORAGE_KEYS.COOLDOWNS);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  static setAppCooldown(appId: string, timestamp: number): void {
    const cooldowns = this.getAppCooldowns();
    cooldowns[appId] = timestamp;
    localStorage.setItem(STORAGE_KEYS.COOLDOWNS, JSON.stringify(cooldowns));
  }

  static clearCooldowns(): void {
    localStorage.removeItem(STORAGE_KEYS.COOLDOWNS);
  }

  // Behavioral Events History
  static getEvents(): BehavioralEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS_HISTORY);
    if (!raw) {
      const seeded = generateSeedEvents();
      this.setEvents(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static setEvents(events: BehavioralEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS_HISTORY, JSON.stringify(events));
  }

  static addEvent(event: BehavioralEvent): void {
    const current = this.getEvents();
    current.unshift(event);
    const trimmed = current.slice(0, 500);
    this.setEvents(trimmed);
  }

  // App Opens Buffer
  static getRecentOpens(): AppOpenRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_OPENS_BUFFER);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static addAppOpen(record: AppOpenRecord): void {
    const current = this.getRecentOpens();
    current.push(record);
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const filtered = current.filter((r) => r.timestamp >= twoHoursAgo);
    localStorage.setItem(STORAGE_KEYS.APP_OPENS_BUFFER, JSON.stringify(filtered));
  }

  static recordAppClose(appId: string, closedAt: number = Date.now()): void {
    const current = this.getRecentOpens();
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i].appId === appId && !current[i].closedAt) {
        current[i].closedAt = closedAt;
        break;
      }
    }
    localStorage.setItem(STORAGE_KEYS.APP_OPENS_BUFFER, JSON.stringify(current));
  }

  // Weekly Feedback
  static getWeeklyFeedback(): Record<string, WeeklyFeedbackResponse> {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_FEEDBACK);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  static saveWeeklyFeedback(weekKey: string, helpful: 'yes' | 'sometimes' | 'no'): void {
    const map = this.getWeeklyFeedback();
    map[weekKey] = {
      weekKey,
      helpful,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.WEEKLY_FEEDBACK, JSON.stringify(map));
  }

  // ==========================================
  // VALIDATION / TEST SESSION ISOLATION ENGINE
  // ==========================================

  static isDemoModeActive(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.IS_DEMO_MODE);
    return val === null ? true : val === 'true';
  }

  static setDemoModeActive(active: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO_MODE, String(active));
  }

  static getActiveVariant(): InterventionVariant {
    const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_VARIANT);
    return (val as InterventionVariant) || 'variant_b_context';
  }

  static setActiveVariant(variant: InterventionVariant): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VARIANT, variant);
  }

  static getCurrentValidationSession(): ValidationSession | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static startValidationSession(
    participantId: string = 'P-01',
    variant: InterventionVariant = 'variant_b_context',
    notes: string = ''
  ): ValidationSession {
    const session: ValidationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      participantId,
      variant,
      startedAt: Date.now(),
      endedAt: null,
      notes,
      appOpensCount: 0,
      interventionsShown: 0,
      continueCount: 0,
      cancelCount: 0,
      cooldownSuppressions: 0,
      consecutiveContinues: 0,
      consecutiveCancellations: 0,
      events: [],
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    this.setActiveVariant(variant);
    this.setDemoModeActive(false); // Switch out of demo into clean validation mode!
    return session;
  }

  static recordValidationEvent(
    event: ValidationSessionEvent,
    wasCooldownSuppressed: boolean = false
  ): void {
    const session = this.getCurrentValidationSession();
    if (!session) return;

    session.appOpensCount += 1;
    if (wasCooldownSuppressed) {
      session.cooldownSuppressions += 1;
    }

    if (event.promptShown) {
      session.interventionsShown += 1;
      if (event.cancelled) {
        session.cancelCount += 1;
        session.consecutiveCancellations += 1;
        session.consecutiveContinues = 0;
      } else if (event.continued) {
        session.continueCount += 1;
        session.consecutiveContinues += 1;
        session.consecutiveCancellations = 0;
      }
    }

    session.events.push(event);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }

  static recordValidationFatigue(rating: FatigueRating): void {
    const session = this.getCurrentValidationSession();
    if (!session) return;
    session.fatigueRating = rating;
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }

  static recordValidationRegret(rating: RegretRating): void {
    const session = this.getCurrentValidationSession();
    if (!session) return;
    session.regretRating = rating;
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  }

  static endValidationSession(): ValidationSession | null {
    const session = this.getCurrentValidationSession();
    if (!session) return null;

    session.endedAt = Date.now();
    const sessions = this.getValidationSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.TEST_SESSIONS, JSON.stringify(sessions));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    this.setDemoModeActive(true); // Return to default preview mode
    return session;
  }

  static getValidationSessions(): ValidationSession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEST_SESSIONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Interview Responses
  static getInterviewResponses(): InterviewResponse[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEW_RESPONSES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveInterviewResponse(resp: InterviewResponse): void {
    const current = this.getInterviewResponses();
    current.unshift(resp);
    localStorage.setItem(STORAGE_KEYS.INTERVIEW_RESPONSES, JSON.stringify(current));
  }

  // Reset Demo only (does NOT wipe real interview or test session data)
  static resetDemoData(): void {
    const seeded = generateSeedEvents();
    localStorage.setItem(STORAGE_KEYS.EVENTS_HISTORY, JSON.stringify(seeded));
    localStorage.removeItem(STORAGE_KEYS.APP_OPENS_BUFFER);
    localStorage.removeItem(STORAGE_KEYS.COOLDOWNS);
    this.setDemoModeActive(true);
  }

  // Clear Validation data only
  static resetValidationData(): void {
    localStorage.removeItem(STORAGE_KEYS.TEST_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    localStorage.removeItem(STORAGE_KEYS.INTERVIEW_RESPONSES);
  }

  // Compute strictly validation metrics (never poisoned by seeded demo events)
  static getValidationMetricsSummary() {
    const sessions = this.getValidationSessions();
    const current = this.getCurrentValidationSession();
    const allSessions = current ? [current, ...sessions] : sessions;

    const totalSessions = allSessions.length;
    const totalOpens = allSessions.reduce((acc, s) => acc + s.appOpensCount, 0);
    const totalInterventions = allSessions.reduce((acc, s) => acc + s.interventionsShown, 0);
    const totalCancels = allSessions.reduce((acc, s) => acc + s.cancelCount, 0);
    const totalContinues = allSessions.reduce((acc, s) => acc + s.continueCount, 0);
    const totalCooldownSuppressions = allSessions.reduce(
      (acc, s) => acc + s.cooldownSuppressions,
      0
    );

    // Duration calculation across all validation intervention events
    let totalDurationMs = 0;
    let durationEventCount = 0;
    allSessions.forEach((s) => {
      s.events.forEach((e) => {
        if (e.promptShown && e.durationMs > 0) {
          totalDurationMs += e.durationMs;
          durationEventCount += 1;
        }
      });
    });

    const avgDurationSeconds =
      durationEventCount > 0
        ? Number((totalDurationMs / durationEventCount / 1000).toFixed(1))
        : 0;

    const cancellationRate =
      totalInterventions > 0 ? Math.round((totalCancels / totalInterventions) * 100) : 0;
    const continueRate =
      totalInterventions > 0 ? Math.round((totalContinues / totalInterventions) * 100) : 0;
    const promptsPerSession =
      totalSessions > 0 ? Number((totalInterventions / totalSessions).toFixed(1)) : 0;

    // Fatigue counts
    const fatigueCounts: Record<FatigueRating, number> = {
      helpful: 0,
      neutral: 0,
      slightly_annoying: 0,
      very_annoying: 0,
    };
    allSessions.forEach((s) => {
      if (s.fatigueRating) {
        fatigueCounts[s.fatigueRating] = (fatigueCounts[s.fatigueRating] || 0) + 1;
      }
    });

    // Regret counts
    const regretCounts: Record<RegretRating, number> = {
      yes: 0,
      some: 0,
      no: 0,
    };
    allSessions.forEach((s) => {
      if (s.regretRating) {
        regretCounts[s.regretRating] = (regretCounts[s.regretRating] || 0) + 1;
      }
    });

    // Variant A vs Variant B breakdown
    const variantAEvents = allSessions.flatMap((s) =>
      s.events.filter((e) => e.variant === 'variant_a_fixed')
    );
    const variantBEvents = allSessions.flatMap((s) =>
      s.events.filter((e) => e.variant === 'variant_b_context')
    );

    const variantACancels = variantAEvents.filter((e) => e.cancelled).length;
    const variantAInterventions = variantAEvents.filter((e) => e.promptShown).length;
    const variantARate =
      variantAInterventions > 0
        ? Math.round((variantACancels / variantAInterventions) * 100)
        : 0;

    const variantBCancels = variantBEvents.filter((e) => e.cancelled).length;
    const variantBInterventions = variantBEvents.filter((e) => e.promptShown).length;
    const variantBRate =
      variantBInterventions > 0
        ? Math.round((variantBCancels / variantBInterventions) * 100)
        : 0;

    // Interview summary
    const interviews = this.getInterviewResponses();
    const wouldKeepCount = interviews.filter((i) => i.q7KeepOneWeek === 'yes').length;
    const wouldKeepPct =
      interviews.length > 0 ? Math.round((wouldKeepCount / interviews.length) * 100) : 0;

    return {
      totalSessions,
      totalOpens,
      totalInterventions,
      totalCancels,
      totalContinues,
      totalCooldownSuppressions,
      cancellationRate,
      continueRate,
      promptsPerSession,
      avgDurationSeconds,
      fatigueCounts,
      regretCounts,
      variantARate,
      variantAInterventions,
      variantBRate,
      variantBInterventions,
      interviewCount: interviews.length,
      wouldKeepPct,
    };
  }

  // Export Validation Dataset (Sessions + Interviews)
  static exportValidationDatasetJSON(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      validationSessions: this.getValidationSessions(),
      activeSession: this.getCurrentValidationSession(),
      interviewResponses: this.getInterviewResponses(),
      summaryMetrics: this.getValidationMetricsSummary(),
    };
    return JSON.stringify(payload, null, 2);
  }

  // Export Interviews as CSV
  static exportInterviewsCSV(): string {
    const interviews = this.getInterviewResponses();
    if (interviews.length === 0) return 'No interview records to export';

    const headers = [
      'ParticipantID',
      'Timestamp',
      'UnintendedApps',
      'WhenUsually',
      'WhatTriggers',
      'PauseOrBlock',
      'DailyTolerance',
      'HelpfulOrAnnoying',
      'KeepOneWeek',
      'DisableReason',
    ];

    const rows = interviews.map((i) => [
      `"${i.participantId}"`,
      `"${new Date(i.createdAt).toISOString()}"`,
      `"${(i.q1UnintendedApps || '').replace(/"/g, '""')}"`,
      `"${(i.q2WhenUsually || '').replace(/"/g, '""')}"`,
      `"${(i.q3WhatTriggers || '').replace(/"/g, '""')}"`,
      `"${i.q4PauseOrBlock}"`,
      `"${(i.q5DailyTolerance || '').replace(/"/g, '""')}"`,
      `"${i.q6HelpfulOrAnnoying}"`,
      `"${i.q7KeepOneWeek}"`,
      `"${(i.q8DisableReason || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // Legacy full prototype export/delete
  static exportDataAsJSON(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      isDemoMode: this.isDemoModeActive(),
      protectedApps: this.getProtectedApps(),
      goal: this.getGoal(),
      rules: this.getRules(),
      eventsCount: this.getEvents().length,
      events: this.getEvents(),
      weeklyFeedback: this.getWeeklyFeedback(),
      validationSessions: this.getValidationSessions(),
      interviewResponses: this.getInterviewResponses(),
    };
    return JSON.stringify(payload, null, 2);
  }

  static deleteLocalData(): void {
    localStorage.removeItem(STORAGE_KEYS.EVENTS_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.APP_OPENS_BUFFER);
    localStorage.removeItem(STORAGE_KEYS.COOLDOWNS);
    localStorage.removeItem(STORAGE_KEYS.WEEKLY_FEEDBACK);
    localStorage.setItem(STORAGE_KEYS.EVENTS_HISTORY, JSON.stringify([]));
  }

  static resetEntirePrototype(): void {
    localStorage.clear();
  }
}
