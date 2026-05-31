'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useProductivityStore } from '@/lib/store';
import { getWeekStart, getWeekEnd } from '@/lib/utils';
import Card from '@/components/Card';
import HabitGrid from '@/components/HabitGrid';
import ProgressBar from '@/components/ProgressBar';
import TemplateSelector from '@/components/TemplateSelector';
import UndoButton from '@/components/UndoButton';
import { useUndo } from '@/hooks/useUndo';
import { exportWeeklyToPDF } from '@/lib/export';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/lib/custom-templates';

const WEEKLY_TEMPLATES = [
  { id: 'athlete', name: 'Athlete Week', emoji: '🏆', description: '5 gym days, meal prep, sleep 8hrs' },
  { id: 'builder', name: 'Builder Week', emoji: '🛠️', description: 'Ship project, learn new skill, network' },
  { id: 'monk', name: 'Monk Mode', emoji: '🧘', description: 'No social media, meditate daily, deep focus' },
  { id: 'growth', name: 'Growth Week', emoji: '🌱', description: 'Read, course, journal, new habits' },
  { id: 'social', name: 'Social + Work', emoji: '🤝', description: 'Meetings, networking, team goals' },
  { id: 'reset', name: 'Reset Week', emoji: '🔄', description: 'Organize, plan, declutter, restart habits' },
];

function getTemplateGoals(id: string): string[] {
  switch (id) {
    case 'athlete': return ['Workout 5 days', 'Meal prep Sunday', 'Sleep 8hrs every night', 'Hit protein goals daily', 'No junk food'];
    case 'builder': return ['Ship MVP / feature', 'Learn 1 new technology', 'Write documentation', 'Network with 2 people'];
    case 'monk': return ['Zero social media', 'Meditate every day', '4hrs deep work daily', 'Read 1 book', 'Journal nightly'];
    case 'growth': return ['Complete course module', 'Read 3 chapters', 'Journal every morning', 'Try 1 new habit'];
    case 'social': return ['Attend 2 networking events', 'Help 1 teammate', 'Complete team deliverable', 'Follow up on connections'];
    case 'reset': return ['Organize workspace', 'Plan next month', 'Declutter digital life', 'Restart morning routine', 'Set new goals'];
    default: return [];
  }
}

function getTemplateHabits(id: string): string[] {
  switch (id) {
    case 'athlete': return ['🏋️ Gym', '🥩 Protein goal', '😴 Sleep 8hrs', '💧 Water 4L'];
    case 'builder': return ['💻 Deep work 4hrs', '📵 No distractions', '📝 Daily standup', '📖 Learn 30min'];
    case 'monk': return ['🧘 Meditate 20min', '📵 No social media', '📖 Read 1hr', '📝 Journal', '🚶 Walk'];
    case 'growth': return ['📚 Study 1hr', '📝 Journal', '📖 Read 30min', '🧠 Review notes'];
    case 'social': return ['🤝 Reach out to 1 person', '💼 Team check-in', '📧 Clear inbox', '🗣️ Practice speaking'];
    case 'reset': return ['🧹 Clean 15min', '📋 Plan tomorrow', '🧘 Meditate', '📵 Screen-free evening'];
    default: return [];
  }
}

export default function WeeklyPage() {
  const weekStart = getWeekStart(new Date());
  const weekEnd = getWeekEnd(new Date());
  const { canUndo, saveSnapshot, undo } = useUndo();

  const {
    weeklyEntries,
    createWeeklyEntry,
    addWeeklyGoal,
    toggleWeeklyGoal,
    removeWeeklyGoal,
    addHabit,
    toggleHabitDay,
    removeHabit,
    updateWeeklyReflection,
  } = useProductivityStore();

  useEffect(() => {
    createWeeklyEntry(weekStart);
  }, [weekStart, createWeeklyEntry]);

  const entry = useMemo(
    () => weeklyEntries.find(e => e.weekStart === weekStart),
    [weeklyEntries, weekStart]
  );

  const [newGoal, setNewGoal] = useState('');

  const handleApplyTemplate = (templateId: string) => {
    if (!entry) return;
    saveSnapshot();
    const custom = getTemplate(templateId, 'weekly');
    const goals = custom?.tasks?.length ? custom.tasks : getTemplateGoals(templateId);
    const habits = getTemplateHabits(templateId);
    goals.forEach(g => addWeeklyGoal(entry.id, g));
    habits.forEach(h => addHabit(entry.id, h));
  };

  if (!entry) return null;

  const goalsCompleted = entry.goals.filter(g => g.completed).length;
  const goalsProgress = entry.goals.length > 0 ? Math.round((goalsCompleted / entry.goals.length) * 100) : 0;

  const handleAddGoal = () => {
    if (!newGoal.trim() || entry.goals.length >= 5) return;
    saveSnapshot();
    addWeeklyGoal(entry.id, newGoal.trim());
    setNewGoal('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {format(parseISO(weekStart), 'MMM d')} – {format(parseISO(weekEnd), 'MMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => exportWeeklyToPDF(entry)}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Templates */}
      <Card>
        <TemplateSelector templates={WEEKLY_TEMPLATES} onSelect={handleApplyTemplate} title="Weekly Templates — tap to load, hover to edit ✏️" type="weekly" getTemplateItems={getTemplateGoals} />
      </Card>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {goalsCompleted}/{entry.goals.length} goals completed
          </span>
        </div>
        <ProgressBar value={goalsProgress} color="purple" />
      </Card>

      {/* Goals */}
      <Card title="Weekly Goals" subtitle="Set up to 5 goals for this week">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              placeholder={entry.goals.length >= 5 ? 'Maximum 5 goals reached' : 'Add a weekly goal...'}
              disabled={entry.goals.length >= 5}
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleAddGoal}
              disabled={!newGoal.trim() || entry.goals.length >= 5}
              className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>

          <ul className="space-y-2">
            {entry.goals.map(goal => (
              <li key={goal.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 group transition-colors">
                <button
                  onClick={() => { saveSnapshot(); toggleWeeklyGoal(entry.id, goal.id); }}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    goal.completed
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                  )}
                  aria-label={goal.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {goal.completed && <span className="text-xs">✓</span>}
                </button>
                <span className={cn(
                  'flex-1 text-sm',
                  goal.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                )}>
                  {goal.title}
                </span>
                <button
                  onClick={() => { saveSnapshot(); removeWeeklyGoal(entry.id, goal.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
                  aria-label="Remove goal"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {entry.goals.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
              No goals set. Use a template above or add manually.
            </p>
          )}
        </div>
      </Card>

      {/* Habit Tracking */}
      <Card title="Habit Tracking" subtitle="Track your daily habits">
        <HabitGrid
          habits={entry.habits}
          onToggleDay={(habitId, day) => { saveSnapshot(); toggleHabitDay(entry.id, habitId, day); }}
          onAdd={name => { saveSnapshot(); addHabit(entry.id, name); }}
          onRemove={habitId => { saveSnapshot(); removeHabit(entry.id, habitId); }}
        />
      </Card>

      {/* Weekly Reflection */}
      <Card title="Weekly Reflection" subtitle="How did this week go?">
        <textarea
          value={entry.reflection}
          onChange={e => updateWeeklyReflection(entry.id, e.target.value)}
          placeholder="Reflect on your week... What did you learn? What would you do differently?"
          rows={5}
          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
        />
      </Card>

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </div>
  );
}
