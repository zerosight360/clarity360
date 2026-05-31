'use client';

import { format } from 'date-fns';
import { useProductivityStore } from '@/lib/store';
import { getDailyTasksCompleted, getWeeklyProgress, getMonthlyProgress, getStreak } from '@/lib/utils';
import { StatCard } from '@/components/Card';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { FocusChart } from '@/components/AnalyticsChart';

export default function DashboardPage() {
  const dailyEntries = useProductivityStore(s => s.dailyEntries);
  const monthlyEntries = useProductivityStore(s => s.monthlyEntries);
  const habitChallenges = useProductivityStore(s => s.habitChallenges);

  const tasksCompleted = getDailyTasksCompleted(dailyEntries);
  const weeklyProgress = getWeeklyProgress(dailyEntries);
  const monthlyProgress = getMonthlyProgress(monthlyEntries);
  const streak = getStreak(dailyEntries);

  return (
    <div className="max-w-[600px] mx-auto space-y-4">
      {/* Welcome - like a story highlight */}
      <div className="fb-card p-5">
        <h1 className="text-[20px] font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {getGreeting()} 👋
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats - like story circles */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Tasks" value={tasksCompleted} icon="✓" color="blue" />
        <StatCard label="Streak" value={`${streak} days`} icon="🔥" color="orange" />
        <StatCard label="Weekly" value={`${weeklyProgress}%`} icon="📅" color="green" />
        <StatCard label="Monthly" value={`${monthlyProgress}%`} icon="🎯" color="purple" />
      </div>

      {/* Focus Chart - like a post */}
      <Card title="Focus Score" subtitle="Last 14 days">
        <FocusChart />
      </Card>

      {/* Progress Section */}
      <Card title="This Week">
        <div className="space-y-4">
          <ProgressBar value={weeklyProgress} color="blue" />
          <ProgressBar value={monthlyProgress} color="purple" />
        </div>
      </Card>

      {/* Recent - like a feed */}
      <Card title="Activity" subtitle="Recent entries">
        <div className="space-y-0 -mx-5">
          {dailyEntries.length === 0 ? (
            <p className="text-center text-[13px] py-10 px-5" style={{ color: 'var(--text-secondary)' }}>
              No entries yet. Start with Daily Log.
            </p>
          ) : (
            [...dailyEntries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 6)
              .map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  {/* Avatar-like circle */}
                  <div className="story-ring">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      {entry.completionPercentage}%
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {format(new Date(entry.date), 'EEEE, MMM d')}
                    </p>
                    <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {entry.tasks.filter(t => t.completed).length}/{entry.tasks.length} tasks · Focus {entry.focusScore}/10
                    </p>
                  </div>
                  <ProgressBar value={entry.completionPercentage} showLabel={false} size="sm" className="w-16" />
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
