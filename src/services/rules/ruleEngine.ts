import {
  AppOpenRecord,
  RuleConfiguration,
  RuleEvaluationResult,
  TriggerRuleType,
} from '../../types';

export class RuleEngine {
  /**
   * Helper: check if currentTime falls within start/end "HH:MM"
   * Handles overnight intervals like 23:00 -> 05:00
   */
  static isTimeInWindow(currentTime: Date, startTimeStr: string, endTimeStr: string): boolean {
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      // Normal range within same day (e.g., 09:00 to 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight range (e.g., 23:00 to 05:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  /**
   * Rule A: Repeated opens within window (default 3 opens in 15 mins)
   */
  static evaluateRepeatedOpen(
    appId: string,
    history: AppOpenRecord[],
    config: RuleConfiguration['repeatedOpens'],
    currentTime: number
  ): { matches: boolean; count: number } {
    if (!config.enabled) return { matches: false, count: 0 };

    const windowStart = currentTime - config.windowMinutes * 60 * 1000;
    // Count opens for this app within the window up to and including current
    const opensInWindow = history.filter(
      (h) => h.appId === appId && h.timestamp >= windowStart && h.timestamp <= currentTime
    );

    // Including this current open attempt
    const count = opensInWindow.length;
    return {
      matches: count >= config.maxOpens,
      count,
    };
  }

  /**
   * Rule B: Quick reopen (reopening within X minutes of closing)
   */
  static evaluateQuickReopen(
    appId: string,
    history: AppOpenRecord[],
    config: RuleConfiguration['quickReopen'],
    currentTime: number
  ): { matches: boolean; diffSeconds: number } {
    if (!config.enabled) return { matches: false, diffSeconds: Infinity };

    // Find the most recent closed record for this app before currentTime
    const closedRecords = history
      .filter((h) => h.appId === appId && h.closedAt && h.closedAt < currentTime)
      .sort((a, b) => (b.closedAt || 0) - (a.closedAt || 0));

    if (closedRecords.length === 0) {
      return { matches: false, diffSeconds: Infinity };
    }

    const lastClosedAt = closedRecords[0].closedAt!;
    const diffMs = currentTime - lastClosedAt;
    const windowMs = config.windowMinutes * 60 * 1000;

    if (diffMs > 0 && diffMs <= windowMs) {
      return {
        matches: true,
        diffSeconds: Math.round(diffMs / 1000),
      };
    }

    return { matches: false, diffSeconds: Math.round(diffMs / 1000) };
  }

  /**
   * Rule C: Focus period
   */
  static evaluateFocusPeriod(
    config: RuleConfiguration['focusPeriod'],
    currentTimeDate: Date
  ): boolean {
    if (!config.enabled) return false;

    // JavaScript getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    // Convert to ISO 1=Mon .. 7=Sun
    const jsDay = currentTimeDate.getDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;

    if (!config.daysOfWeek.includes(isoDay)) {
      return false;
    }

    return this.isTimeInWindow(currentTimeDate, config.startTime, config.endTime);
  }

  /**
   * Rule D: Late night protection
   */
  static evaluateLateNight(
    config: RuleConfiguration['lateNight'],
    currentTimeDate: Date
  ): boolean {
    if (!config.enabled) return false;
    return this.isTimeInWindow(currentTimeDate, config.startTime, config.endTime);
  }

  /**
   * Cooldown check: Prevents prompt fatigue
   */
  static checkCooldown(
    lastPromptTimestamp: number | undefined,
    cooldownMinutes: number,
    currentTime: number
  ): { inCooldown: boolean; remainingSeconds: number } {
    if (!lastPromptTimestamp) {
      return { inCooldown: false, remainingSeconds: 0 };
    }

    const cooldownMs = cooldownMinutes * 60 * 1000;
    const elapsed = currentTime - lastPromptTimestamp;

    if (elapsed < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return { inCooldown: true, remainingSeconds };
    }

    return { inCooldown: false, remainingSeconds: 0 };
  }

  /**
   * Master evaluation function
   */
  static evaluateOpen({
    appId,
    isProtected,
    isPaused,
    rulesConfig,
    recentOpens,
    lastPromptTimestamp,
    currentTime = Date.now(),
  }: {
    appId: string;
    isProtected: boolean;
    isPaused: boolean;
    rulesConfig: RuleConfiguration;
    recentOpens: AppOpenRecord[];
    lastPromptTimestamp?: number;
    currentTime?: number;
  }): RuleEvaluationResult {
    // 1. If protection is paused, do not intervene
    if (isPaused) {
      return {
        shouldIntervene: false,
        triggerType: null,
        reason: 'Protection is currently paused by user.',
        cooldownActive: false,
      };
    }

    // 2. If app is not in protected list, ignore
    if (!isProtected) {
      return {
        shouldIntervene: false,
        triggerType: null,
        reason: 'App is not in the protected list.',
        cooldownActive: false,
      };
    }

    // 3. Check cooldown
    const cooldownCheck = this.checkCooldown(
      lastPromptTimestamp,
      rulesConfig.cooldownMinutes,
      currentTime
    );

    const currentDate = new Date(currentTime);

    // 4. Evaluate individual trigger conditions in priority order
    let triggeredType: TriggerRuleType | null = null;
    let triggerReason = '';

    // A. Quick reopen (High intent indicator)
    const quickReopenResult = this.evaluateQuickReopen(
      appId,
      recentOpens,
      rulesConfig.quickReopen,
      currentTime
    );
    if (quickReopenResult.matches) {
      triggeredType = 'quick_reopen';
      triggerReason = `Reopened ${quickReopenResult.diffSeconds}s after closing.`;
    }

    // B. Repeated opens (Frequency indicator)
    if (!triggeredType) {
      const repeatedResult = this.evaluateRepeatedOpen(
        appId,
        recentOpens,
        rulesConfig.repeatedOpens,
        currentTime
      );
      if (repeatedResult.matches) {
        triggeredType = 'repeated_open';
        triggerReason = `Opened ${repeatedResult.count} times within ${rulesConfig.repeatedOpens.windowMinutes} minutes.`;
      }
    }

    // C. Late night protection
    if (!triggeredType && this.evaluateLateNight(rulesConfig.lateNight, currentDate)) {
      triggeredType = 'late_night';
      triggerReason = `Opened during late-night hours (${rulesConfig.lateNight.startTime}–${rulesConfig.lateNight.endTime}).`;
    }

    // D. Focus period
    if (!triggeredType && this.evaluateFocusPeriod(rulesConfig.focusPeriod, currentDate)) {
      triggeredType = 'focus_period';
      triggerReason = `Opened during designated focus hours (${rulesConfig.focusPeriod.startTime}–${rulesConfig.focusPeriod.endTime}).`;
    }

    // If a rule fired, but cooldown is active:
    if (triggeredType && cooldownCheck.inCooldown) {
      return {
        shouldIntervene: false,
        triggerType: triggeredType,
        reason: `Trigger fired (${triggerReason}) but skipped to prevent prompt fatigue (${Math.ceil(cooldownCheck.remainingSeconds / 60)}m cooldown remaining).`,
        cooldownActive: true,
        remainingCooldownSeconds: cooldownCheck.remainingSeconds,
      };
    }

    // Rule fired and not in cooldown
    if (triggeredType) {
      return {
        shouldIntervene: true,
        triggerType: triggeredType,
        reason: triggerReason,
        cooldownActive: false,
      };
    }

    // Normal opening
    return {
      shouldIntervene: false,
      triggerType: null,
      reason: 'Normal open (within healthy usage parameters).',
      cooldownActive: false,
    };
  }
}
