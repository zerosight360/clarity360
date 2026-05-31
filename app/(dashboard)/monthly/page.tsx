'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useProductivityStore } from '@/lib/store';
import { formatMonth } from '@/lib/utils';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import TemplateSelector from '@/components/TemplateSelector';
import UndoButton from '@/components/UndoButton';
import { useUndo } from '@/hooks/useUndo';
import { exportMonthlyToPDF } from '@/lib/export';
import { GoalCategory } from '@/types';
import { cn } from '@/lib/utils';
import { getTemplate } from '@/lib/custom-templates';

const CATEGORIES: { value: GoalCategory; label: string; color: string }[] = [
  { value: 'health', label: 'Health', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { value: 'work', label: 'Work', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'personal', label: 'Personal', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'learning', label: 'Learning', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
];

const MONTHLY_TEMPLATES = [
  { id: 'transform', name: 'Body Transformation', emoji: '💪', description: 'Gym 25 days, diet, sleep, no alcohol' },
  { id: 'career', name: 'Career Push', emoji: '🚀', description: 'Ship project, upskill, network, get promoted' },
  { id: 'mindful', name: 'Mindful Month', emoji: '🧠', description: 'Meditate daily, journal, read 4 books' },
  { id: 'allround', name: 'All-Rounder', emoji: '⭐', description: 'Balance fitness, work, learning, relationships' },
  { id: 'detox', name: 'Digital Detox', emoji: '📵', description: 'Limit screen time, no social media, be present' },
  { id: 'financial', name: 'Financial Focus', emoji: '💰', description: 'Budget, save 30%, invest, side income' },
];

function getTemplateGoals(id: string): { title: string; category: GoalCategory }[] {
  switch (id) {
    case 'transform': return [
      { title: 'Workout 25+ days', category: 'health' },
      { title: 'Follow meal plan strictly', category: 'health' },
      { title: 'Sleep 7-8hrs every night', category: 'health' },
      { title: 'Zero alcohol this month', category: 'health' },
      { title: 'Track body measurements weekly', category: 'personal' },
    ];
    case 'career': return [
      { title: 'Ship major project/feature', category: 'work' },
      { title: 'Complete certification/course', category: 'learning' },
      { title: 'Network with 5 professionals', category: 'work' },
      { title: 'Update resume & portfolio', category: 'work' },
      { title: 'Read 2 industry books', category: 'learning' },
    ];
    case 'mindful': return [
      { title: 'Meditate every single day', category: 'personal' },
      { title: 'Journal morning & night', category: 'personal' },
      { title: 'Read 4 books', category: 'learning' },
      { title: 'Digital sunset at 9pm', category: 'personal' },
      { title: 'Weekly nature walk', category: 'health' },
    ];
    case 'allround': return [
      { title: 'Gym 20+ days', category: 'health' },
      { title: 'Complete work milestone', category: 'work' },
      { title: 'Read 2 books', category: 'learning' },
      { title: 'Quality time with loved ones weekly', category: 'personal' },
      { title: 'Learn 1 new skill', category: 'learning' },
    ];
    case 'detox': return [
      { title: 'Max 1hr screen time (non-work)', category: 'personal' },
      { title: 'Delete social media apps', category: 'personal' },
      { title: 'Replace scrolling with reading', category: 'learning' },
      { title: 'Be fully present in conversations', category: 'personal' },
      { title: 'Outdoor activity 3x/week', category: 'health' },
    ];
    case 'financial': return [
      { title: 'Create monthly budget', category: 'work' },
      { title: 'Save 30% of income', category: 'personal' },
      { title: 'Start/grow side income', category: 'work' },
      { title: 'Read 1 finance book', category: 'learning' },
      { title: 'Review & cut subscriptions', category: 'personal' },
    ];
    default: return [];
  }
}

export default function MonthlyPage() {
  const currentMonth = formatMonth(new Date());
  const { canUndo, saveSnapshot, undo } = useUndo();

  const {
    monthlyEntries,
    createMonthlyEntry,
    addMonthlyGoal,
    toggleMonthlyGoal,
    removeMonthlyGoal,
    updateMonthlyReview,
  } = useProductivityStore();

  useEffect(() => {
    createMonthlyEntry(currentMonth);
  }, [currentMonth, createMonthlyEntry]);

  const entry = useMemo(
    () => monthlyEntries.find(e => e.month === currentMonth),
    [monthlyEntries, currentMonth]
  );

  const [newGoal, setNewGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('health');

  const handleApplyTemplate = (templateId: string) => {
    if (!entry) return;
    saveSnapshot();
    const custom = getTemplate(templateId, 'monthly');
    if (custom?.tasks?.length) {
      // Custom override - add as 'health' category by default
      custom.tasks.forEach(t => addMonthlyGoal(entry.id, t, 'health'));
    } else {
      const goals = getTemplateGoals(templateId);
      goals.forEach(g => addMonthlyGoal(entry.id, g.title, g.category));
    }
  };

  if (!entry) return null;

  const goalsCompleted = entry.goals.filter(g => g.completed).length;
  const goalsProgress = entry.goals.length > 0 ? Math.round((goalsCompleted / entry.goals.length) * 100) : 0;

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    saveSnapshot();
    addMonthlyGoal(entry.id, newGoal.trim(), selectedCategory);
    setNewGoal('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            {format(parseISO(currentMonth + '-01'), 'MMMM yyyy')}
          </p>
        </div>
        <button
          onClick={() => exportMonthlyToPDF(entry)}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Templates */}
      <Card>
        <TemplateSelector templates={MONTHLY_TEMPLATES} onSelect={handleApplyTemplate} title="Monthly Templates — tap to load, hover to edit ✏️" type="monthly" getTemplateItems={(id) => getTemplateGoals(id).map(g => g.title)} />
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{entry.metrics.completedTasks}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tasks Done</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200/30 dark:border-green-800/30 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{entry.metrics.habitSuccessRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Habit Rate</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border border-purple-200/30 dark:border-purple-800/30 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{goalsCompleted}/{entry.goals.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Goals</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <ProgressBar value={goalsProgress} color="purple" />
      </Card>

      {/* Add Goal */}
      <Card title="Monthly Objectives" subtitle="Categorize and track your goals">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
              placeholder="Add a monthly goal..."
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as GoalCategory)}
                className="px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Goals by Category */}
          {CATEGORIES.map(cat => {
            const categoryGoals = entry.goals.filter(g => g.category === cat.value);
            if (categoryGoals.length === 0) return null;
            return (
              <div key={cat.value} className="space-y-2">
                <span className={cn('inline-block px-2.5 py-1 rounded-lg text-xs font-semibold', cat.color)}>
                  {cat.label}
                </span>
                <ul className="space-y-1.5">
                  {categoryGoals.map(goal => (
                    <li key={goal.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 group transition-colors">
                      <button
                        onClick={() => { saveSnapshot(); toggleMonthlyGoal(entry.id, goal.id); }}
                        className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                          goal.completed
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                        )}
                      >
                        {goal.completed && <span className="text-xs">✓</span>}
                      </button>
                      <span className={cn('flex-1 text-sm', goal.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300')}>
                        {goal.title}
                      </span>
                      <button
                        onClick={() => { saveSnapshot(); removeMonthlyGoal(entry.id, goal.id); }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {entry.goals.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
              No goals set. Use a template above or add manually.
            </p>
          )}
        </div>
      </Card>

      {/* Monthly Review */}
      <Card title="Monthly Review" subtitle="Reflect on your month">
        <textarea
          value={entry.review}
          onChange={e => updateMonthlyReview(entry.id, e.target.value)}
          placeholder="How did this month go? Biggest wins and lessons?"
          rows={5}
          className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
        />
      </Card>

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </div>
  );
}
