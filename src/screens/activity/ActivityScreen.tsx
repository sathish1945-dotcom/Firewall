import React, { useState } from 'react';
import { BehavioralEvent, ProtectedApp } from '../../types';
import { BehavioralAnalytics } from '../../services/analytics/behavioralAnalytics';
import { ArrowLeft, Clock, Filter, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

interface ActivityScreenProps {
  onBack: () => void;
  events: BehavioralEvent[];
  protectedApps: ProtectedApp[];
  onOpenSimulator?: () => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  onBack,
  events,
  protectedApps,
  onOpenSimulator,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7days' | '30days'>('today');

  // Filter events based on active tab
  const getFilteredEvents = () => {
    if (filterPeriod === 'today') {
      return BehavioralAnalytics.filterEventsToday(events);
    }
    if (filterPeriod === '7days') {
      return BehavioralAnalytics.filterEventsByDays(events, 7);
    }
    return BehavioralAnalytics.filterEventsByDays(events, 30);
  };

  const filteredEvents = getFilteredEvents();
  const summary = BehavioralAnalytics.calculateSummary(filteredEvents);
  const appSummaries = BehavioralAnalytics.aggregateByApp(filteredEvents, protectedApps);

  return (
    <div className="flex-1 flex flex-col p-5 bg-slate-50 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200/60 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Activity</h2>
            <p className="text-xs text-slate-500">Behavioral patterns over time</p>
          </div>
        </div>

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full"
          >
            Test Open
          </button>
        )}
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl">
        <button
          onClick={() => setFilterPeriod('today')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterPeriod === 'today'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setFilterPeriod('7days')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterPeriod === '7days'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setFilterPeriod('30days')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterPeriod === '30days'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          30 Days
        </button>
      </div>

      {/* Top High-Level Metrics Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-around text-center">
        <div>
          <span className="text-[11px] text-slate-500 block">Total Opens</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {summary.totalOpens}
          </span>
        </div>
        <div className="w-px h-8 bg-slate-100" />
        <div>
          <span className="text-[11px] text-slate-500 block">Interventions</span>
          <span className="text-lg font-bold text-teal-700 tabular-nums">
            {summary.interventions}
          </span>
        </div>
        <div className="w-px h-8 bg-slate-100" />
        <div>
          <span className="text-[11px] text-slate-500 block">Autopilot Stopped</span>
          <span className="text-lg font-bold text-slate-900 tabular-nums">
            {summary.cancelledOpens}
          </span>
        </div>
      </div>

      {/* Per-App Behavioral Breakdown */}
      <div>
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2.5 px-1">
          Patterns by Protected App
        </h3>

        <div className="space-y-2.5">
          {appSummaries.map((item) => (
            <div
              key={item.appId}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-900">{item.appName}</span>
                <span className="text-xs text-slate-500 tabular-nums">{item.opens} opens</span>
              </div>

              {/* Progress bars showing interventions & cancellations */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">Micro-Pauses</div>
                  <div className="text-base font-bold text-teal-700 tabular-nums">
                    {item.interventions}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">Cancelled Opens</div>
                  <div className="text-base font-bold text-slate-900 tabular-nums">
                    {item.cancelled}
                  </div>
                </div>
              </div>

              {item.interventions > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Conscious choice rate:</span>
                  <span className="font-semibold text-slate-700">
                    {item.interventions > 0
                      ? `${Math.round((item.cancelled / item.interventions) * 100)}% autopilot caught`
                      : 'N/A'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent behavioral event list */}
      <div className="pt-2">
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2.5 px-1">
          Recent Intervention Moments
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filteredEvents.filter((e) => e.promptShown).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              No interventions triggered during this timeframe.
            </div>
          ) : (
            filteredEvents
              .filter((e) => e.promptShown)
              .slice(0, 15)
              .map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {evt.cancelled ? (
                      <XCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-slate-900">{evt.protectedAppName}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {evt.userIntent ? `Intent: ${evt.userIntent}` : 'Reflective prompt'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      evt.cancelled
                        ? 'bg-teal-50 text-teal-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {evt.cancelled ? 'Cancelled' : 'Continued'}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
