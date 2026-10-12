/**
 * Impulse Firewall - Core Type Definitions
 * Strict Android-first behavioral intervention data models
 */

export interface ProtectedApp {
  id: string;
  name: string;
  packageName: string;
  category: 'social' | 'video' | 'gaming' | 'shopping' | 'browsing' | 'other';
  iconColor: string;
  iconBg: string;
}

export type TriggerRuleType =
  | 'repeated_open'
  | 'quick_reopen'
  | 'focus_period'
  | 'late_night'
  | 'manual_simulation';

export type UserIntent =
  | 'task'
  | 'reply'
  | 'search'
  | 'habit'
  | 'undecided';

export type InterventionVariant = 'variant_a_fixed' | 'variant_b_context';

export interface BehavioralEvent {
  id: string;
  timestamp: number; // Unix epoch ms
  protectedAppId: string;
  protectedAppName: string;
  triggerType: TriggerRuleType | null; // null if normal open without trigger
  promptShown: boolean;
  userIntent?: UserIntent;
  continued: boolean;
  cancelled: boolean;
  intendedDurationMinutes?: number;
  origin?: 'seed_demo' | 'user_test_session';
  variant?: InterventionVariant;
  durationMs?: number;
}

export interface AppOpenRecord {
  id: string;
  appId: string;
  timestamp: number;
  closedAt?: number;
}

export interface RuleConfiguration {
  repeatedOpens: {
    enabled: boolean;
    maxOpens: number; // default: 3
    windowMinutes: number; // default: 15
  };
  quickReopen: {
    enabled: boolean;
    windowMinutes: number; // default: 2
  };
  focusPeriod: {
    enabled: boolean;
    startTime: string; // "09:00"
    endTime: string; // "17:00"
    daysOfWeek: number[]; // 1=Mon .. 7=Sun
  };
  lateNight: {
    enabled: boolean;
    startTime: string; // "23:00"
    endTime: string; // "05:00"
  };
  cooldownMinutes: number; // default: 20 min between prompts for same app
}

export interface ProtectionState {
  isPaused: boolean;
  pausedUntil: number | null; // null = indefinite, or epoch ms
  pauseReason?: string;
}

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  isCustom?: boolean;
}

export interface WeeklyFeedbackResponse {
  weekKey: string;
  helpful: 'yes' | 'sometimes' | 'no';
  updatedAt: number;
}

export interface RuleEvaluationResult {
  shouldIntervene: boolean;
  triggerType: TriggerRuleType | null;
  reason: string;
  cooldownActive: boolean;
  remainingCooldownSeconds?: number;
}

export interface SummaryStats {
  totalOpens: number;
  interventions: number;
  continuedOpens: number;
  cancelledOpens: number;
  cancellationRate: number;
  continueRate: number;
}

export type FatigueRating = 'helpful' | 'neutral' | 'slightly_annoying' | 'very_annoying';
export type RegretRating = 'yes' | 'some' | 'no';

export interface ValidationSessionEvent {
  id: string;
  timestamp: number;
  appId: string;
  appName: string;
  triggerType: TriggerRuleType | null;
  promptShown: boolean;
  variant: InterventionVariant;
  userIntent?: UserIntent;
  continued: boolean;
  cancelled: boolean;
  durationMs: number;
  bypassed: boolean;
}

export interface ValidationSession {
  id: string;
  participantId: string;
  variant: InterventionVariant;
  startedAt: number;
  endedAt: number | null;
  notes?: string;
  appOpensCount: number;
  interventionsShown: number;
  continueCount: number;
  cancelCount: number;
  cooldownSuppressions: number;
  consecutiveContinues: number;
  consecutiveCancellations: number;
  fatigueRating?: FatigueRating;
  regretRating?: RegretRating;
  events: ValidationSessionEvent[];
}

export interface InterviewResponse {
  id: string;
  participantId: string;
  createdAt: number;
  q1UnintendedApps: string;
  q2WhenUsually: string;
  q3WhatTriggers: string;
  q4PauseOrBlock: 'pause' | 'hard_block' | 'other';
  q5DailyTolerance: string;
  q6HelpfulOrAnnoying: 'helpful' | 'neutral' | 'annoying';
  q7KeepOneWeek: 'yes' | 'maybe' | 'no';
  q8DisableReason: string;
}

