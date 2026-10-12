import { BehavioralEvent, ProtectedApp, SummaryStats } from '../../types';

export interface AppActivitySummary {
  appId: string;
  appName: string;
  opens: number;
  interventions: number;
  cancelled: number;
  continued: number;
  primaryIntent?: string;
}

export interface WeeklyReportData {
  weekKey: string;
  startDate: string;
  endDate: string;
  totalProtectedOpens: number;
  interventionsShown: number;
  cancelledUnwantedOpens: number;
  continueRate: number;
  cancellationRate: number;
  mostCommonTriggerPeriod: string;
  mostFrequentlyTriggeredApp: string;
  appBreakdown: AppActivitySummary[];
  deterministicInsights: string[];
}

export class BehavioralAnalytics {
  /**
   * Filter events by timeframe (today, 7days, 30days)
   */
  static filterEventsByDays(
    events: BehavioralEvent[],
    days: number,
    referenceTime: number = Date.now()
  ): BehavioralEvent[] {
    const cutoff = referenceTime - days * 24 * 60 * 60 * 1000;
    return events.filter((e) => e.timestamp >= cutoff);
  }

  static filterEventsToday(
    events: BehavioralEvent[],
    referenceTime: number = Date.now()
  ): BehavioralEvent[] {
    const ref = new Date(referenceTime);
    const startOfDay = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();
    return events.filter((e) => e.timestamp >= startOfDay);
  }

  /**
   * Calculate summary metrics for a given event slice
   */
  static calculateSummary(events: BehavioralEvent[]): SummaryStats {
    const totalOpens = events.length;
    const interventions = events.filter((e) => e.promptShown).length;
    const cancelledOpens = events.filter((e) => e.cancelled).length;
    const continuedOpens = events.filter((e) => e.continued).length;

    const cancellationRate =
      interventions > 0 ? Math.round((cancelledOpens / interventions) * 100) : 0;
    const continueRate =
      interventions > 0 ? Math.round((continuedOpens / interventions) * 100) : 0;

    return {
      totalOpens,
      interventions,
      continuedOpens,
      cancelledOpens,
      cancellationRate,
      continueRate,
    };
  }

  /**
   * Aggregate activity breakdown per protected app
   */
  static aggregateByApp(
    events: BehavioralEvent[],
    protectedApps: ProtectedApp[]
  ): AppActivitySummary[] {
    const map = new Map<string, AppActivitySummary>();

    // Initialize map with protected apps
    protectedApps.forEach((app) => {
      map.set(app.id, {
        appId: app.id,
        appName: app.name,
        opens: 0,
        interventions: 0,
        cancelled: 0,
        continued: 0,
      });
    });

    events.forEach((e) => {
      let entry = map.get(e.protectedAppId);
      if (!entry) {
        entry = {
          appId: e.protectedAppId,
          appName: e.protectedAppName,
          opens: 0,
          interventions: 0,
          cancelled: 0,
          continued: 0,
        };
        map.set(e.protectedAppId, entry);
      }

      entry.opens += 1;
      if (e.promptShown) entry.interventions += 1;
      if (e.cancelled) entry.cancelled += 1;
      if (e.continued) entry.continued += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.opens - a.opens);
  }

  /**
   * Generate complete Weekly Report
   */
  static generateWeeklyReport(
    events: BehavioralEvent[],
    protectedApps: ProtectedApp[],
    referenceTime: number = Date.now()
  ): WeeklyReportData {
    const past7DaysEvents = this.filterEventsByDays(events, 7, referenceTime);
    const summary = this.calculateSummary(past7DaysEvents);
    const appBreakdown = this.aggregateByApp(past7DaysEvents, protectedApps);

    // Compute most common trigger period
    const hourBuckets: Record<string, number> = {
      'Morning (06:00 – 12:00)': 0,
      'Afternoon (12:00 – 18:00)': 0,
      'Evening (18:00 – 22:00)': 0,
      'Late Night (22:00 – 05:00)': 0,
    };

    past7DaysEvents
      .filter((e) => e.promptShown)
      .forEach((e) => {
        const hour = new Date(e.timestamp).getHours();
        if (hour >= 6 && hour < 12) hourBuckets['Morning (06:00 – 12:00)']++;
        else if (hour >= 12 && hour < 18) hourBuckets['Afternoon (12:00 – 18:00)']++;
        else if (hour >= 18 && hour < 22) hourBuckets['Evening (18:00 – 22:00)']++;
        else hourBuckets['Late Night (22:00 – 05:00)']++;
      });

    let maxBucket = 'Evening (18:00 – 22:00)';
    let maxBucketCount = -1;
    Object.entries(hourBuckets).forEach(([bucket, count]) => {
      if (count > maxBucketCount) {
        maxBucketCount = count;
        maxBucket = bucket;
      }
    });

    // Most frequently triggered app
    let mostTriggeredAppName = protectedApps[0]?.name || 'Protected Apps';
    let maxInterventions = -1;
    appBreakdown.forEach((item) => {
      if (item.interventions > maxInterventions) {
        maxInterventions = item.interventions;
        mostTriggeredAppName = item.appName;
      }
    });

    // Generate deterministic local insights
    const deterministicInsights: string[] = [];

    // 1. Cancellation rate insight
    if (summary.cancellationRate > 0) {
      deterministicInsights.push(
        `You cancelled ${summary.cancellationRate}% of triggered opens this week upon seeing the pause prompt.`
      );
    } else if (summary.interventions > 0) {
      deterministicInsights.push(
        `All ${summary.interventions} interventions this week proceeded with conscious continuation.`
      );
    } else {
      deterministicInsights.push(
        'Zero interventions required this week — app opens stayed below frequency thresholds.'
      );
    }

    // 2. Trigger pattern insight
    if (maxBucketCount > 0) {
      deterministicInsights.push(
        `Most interventions happened during ${maxBucket.toLowerCase()} window.`
      );
    }

    // 3. App specific pattern
    const quickReopenEvents = past7DaysEvents.filter(
      (e) => e.triggerType === 'quick_reopen'
    );
    if (quickReopenEvents.length >= 2) {
      const topQuickApp = quickReopenEvents[0].protectedAppName;
      deterministicInsights.push(
        `You tend to reopen ${topQuickApp} within a few minutes after closing it.`
      );
    } else if (mostTriggeredAppName && maxInterventions > 0) {
      deterministicInsights.push(
        `${mostTriggeredAppName} accounted for ${maxInterventions} of your ${summary.interventions} intervention moments.`
      );
    }

    const refDate = new Date(referenceTime);
    const startOfWeek = new Date(referenceTime - 6 * 24 * 3600 * 1000);
    const startStr = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = refDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      weekKey: `${startOfWeek.getFullYear()}-W${Math.ceil(startOfWeek.getDate() / 7)}`,
      startDate: startStr,
      endDate: endStr,
      totalProtectedOpens: summary.totalOpens,
      interventionsShown: summary.interventions,
      cancelledUnwantedOpens: summary.cancelledOpens,
      continueRate: summary.continueRate,
      cancellationRate: summary.cancellationRate,
      mostCommonTriggerPeriod: maxBucket,
      mostFrequentlyTriggeredApp: mostTriggeredAppName,
      appBreakdown,
      deterministicInsights,
    };
  }
}
