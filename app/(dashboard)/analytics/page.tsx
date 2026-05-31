'use client';

import Card from '@/components/Card';
import { FocusChart, CompletionChart } from '@/components/AnalyticsChart';
import { useProductivityStore } from '@/lib/store';
import { getStreak } from '@/lib/utils';

export default function AnalyticsPage() {
  const dailyEntries = useProductivityStore(s => s.dailyEntries);

  const streak = getStreak(dailyEntries);
  const totalTasks = dailyEntries.reduce((sum, e) => sum + e.tasks.length, 0);
  const completedTasks = dailyEntries.reduce((sum, e) => sum + e.tasks.filter(t => t.completed).length, 0);
  const avgFocus = dailyEntries.length > 0
    ? (dailyEntries.reduce((sum, e) => sum + e.focusScore, 0) / dailyEntries.length).toFixed(1)
    : '0';
  const avgCompletion = dailyEntries.length > 0
    ? Math.round(dailyEntries.reduce((sum, e) => sum + e.completionPercentage, 0) / dailyEntries.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
          Your productivity insights
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <p className="text-3xl font-bold text-orange-500">{streak}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <p className="text-3xl font-bold text-blue-500">{avgFocus}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg Focus</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <p className="text-3xl font-bold text-green-500">{completedTasks}/{totalTasks}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tasks Done</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 text-center">
          <p className="text-3xl font-bold text-purple-500">{avgCompletion}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg Completion</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Focus Score Trend" subtitle="Last 14 days">
          <FocusChart />
        </Card>
        <Card title="Daily Completion" subtitle="Last 14 days">
          <CompletionChart />
        </Card>
      </div>

      {/* Insights */}
      <Card title="Insights">
        <div className="space-y-3">
          {dailyEntries.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-4">
              Start tracking daily entries to see insights here.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-lg">📊</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You&apos;ve logged <strong>{dailyEntries.length}</strong> daily entries total.
                </p>
              </div>
              {streak >= 3 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                  <span className="text-lg">🔥</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Amazing! You&apos;re on a <strong>{streak}-day streak</strong>. Keep it going!
                  </p>
                </div>
              )}
              {Number(avgFocus) >= 7 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                  <span className="text-lg">🎯</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your average focus score is <strong>{avgFocus}/10</strong>. Great concentration!
                  </p>
                </div>
              )}
              {avgCompletion >= 80 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                  <span className="text-lg">✅</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You complete <strong>{avgCompletion}%</strong> of your tasks on average. Excellent!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
