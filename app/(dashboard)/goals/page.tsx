'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import UndoButton from '@/components/UndoButton';
import { useUndo } from '@/hooks/useUndo';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  category: string;
  timeframe: string; // now free-text: "1 month", "6 months", "2 years", "10 years" etc.
  deadline?: string; // optional target date
  achieved: boolean;
  createdAt: string;
  achievedAt?: string;
}

const GOAL_CATEGORIES = [
  { value: 'fitness', label: 'Fitness', emoji: '🏋️', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { value: 'career', label: 'Career', emoji: '💼', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { value: 'personal', label: 'Personal', emoji: '🧘', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { value: 'financial', label: 'Financial', emoji: '💰', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { value: 'learning', label: 'Learning', emoji: '📚', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { value: 'health', label: 'Health', emoji: '❤️', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
] as const;

const TIMEFRAME_PRESETS = [
  { label: '1 Month', value: '1 month', emoji: '⚡' },
  { label: '3 Months', value: '3 months', emoji: '🎯' },
  { label: '6 Months', value: '6 months', emoji: '📈' },
  { label: '1 Year', value: '1 year', emoji: '🗓️' },
  { label: '2 Years', value: '2 years', emoji: '🚀' },
  { label: '5 Years', value: '5 years', emoji: '🏆' },
  { label: '10 Years', value: '10 years', emoji: '👑' },
  { label: 'Lifetime', value: 'lifetime', emoji: '♾️' },
];

const GOALS_STORAGE_KEY = 'productivity_life_goals_v2';

function loadGoals(): Goal[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(GOALS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveGoalsToStorage(goals: Goal[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getTimeframeOrder(tf: string): number {
  const order: Record<string, number> = {
    '1 month': 1, '3 months': 2, '6 months': 3,
    '1 year': 4, '2 years': 5, '5 years': 6,
    '10 years': 7, 'lifetime': 8,
  };
  return order[tf.toLowerCase()] || 9;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [newGoal, setNewGoal] = useState('');
  const [category, setCategory] = useState('fitness');
  const [timeframe, setTimeframe] = useState('1 year');
  const [customTimeframe, setCustomTimeframe] = useState('');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'achieved'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('fitness');
  const [editTimeframe, setEditTimeframe] = useState('');
  const [editCustomTimeframe, setEditCustomTimeframe] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const { canUndo, saveSnapshot, undo } = useUndo();

  const persist = (updated: Goal[]) => {
    setGoals(updated);
    saveGoalsToStorage(updated);
  };

  const getEffectiveTimeframe = () => customTimeframe.trim() || timeframe;
  const getEditEffectiveTimeframe = () => editCustomTimeframe.trim() || editTimeframe;

  const handleAdd = () => {
    if (!newGoal.trim()) return;
    saveSnapshot();
    const goal: Goal = {
      id: generateId(),
      title: newGoal.trim(),
      category,
      timeframe: getEffectiveTimeframe(),
      deadline: deadline || undefined,
      achieved: false,
      createdAt: new Date().toISOString(),
    };
    persist([...goals, goal]);
    setNewGoal('');
    setCustomTimeframe('');
    setDeadline('');
  };

  const toggleAchieved = (id: string) => {
    saveSnapshot();
    persist(goals.map(g => {
      if (g.id !== id) return g;
      return { ...g, achieved: !g.achieved, achievedAt: !g.achieved ? new Date().toISOString() : undefined };
    }));
  };

  const removeGoal = (id: string) => {
    saveSnapshot();
    persist(goals.filter(g => g.id !== id));
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
    setEditCategory(goal.category);
    const isPreset = TIMEFRAME_PRESETS.some(p => p.value === goal.timeframe);
    setEditTimeframe(isPreset ? goal.timeframe : '');
    setEditCustomTimeframe(isPreset ? '' : goal.timeframe);
    setEditDeadline(goal.deadline || '');
  };

  const saveEdit = () => {
    if (!editingId || !editTitle.trim()) return;
    saveSnapshot();
    persist(goals.map(g => {
      if (g.id !== editingId) return g;
      return { ...g, title: editTitle.trim(), category: editCategory, timeframe: getEditEffectiveTimeframe(), deadline: editDeadline || undefined };
    }));
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return !g.achieved;
    if (filter === 'achieved') return g.achieved;
    return true;
  });

  const totalGoals = goals.length;
  const achievedGoals = goals.filter(g => g.achieved).length;
  const achievedPct = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

  // Group by timeframe
  const uniqueTimeframes = [...new Set(filteredGoals.map(g => g.timeframe))].sort((a, b) => getTimeframeOrder(a) - getTimeframeOrder(b));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Life Goals 🎯</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">1 month to 10 years — plan your life timeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl border border-indigo-200/30 dark:border-indigo-800/30 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Goals</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200/30 dark:border-green-800/30 p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{achievedGoals}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Achieved ✓</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl border border-orange-200/30 dark:border-orange-800/30 p-4 text-center">
          <p className={cn('text-2xl font-bold', achievedPct >= 70 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400')}>{achievedPct}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Success Rate</p>
        </div>
      </div>

      {/* Add Goal */}
      <Card title="Add New Goal">
        <div className="space-y-3">
          <input
            type="text"
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="What do you want to achieve?"
            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                  className={cn('flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    category === cat.value ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}>
                  <span>{cat.emoji}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Timeline</p>
            <div className="flex flex-wrap gap-1.5">
              {TIMEFRAME_PRESETS.map(tf => (
                <button key={tf.value} onClick={() => { setTimeframe(tf.value); setCustomTimeframe(''); }}
                  className={cn('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    timeframe === tf.value && !customTimeframe ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}>
                  {tf.emoji} {tf.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" value={customTimeframe} onChange={e => setCustomTimeframe(e.target.value)}
                placeholder="Or type custom: e.g. '7 years', 'by age 30'"
                className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              />
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
          <button onClick={handleAdd} disabled={!newGoal.trim()}
            className="w-full py-3 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-indigo-500/20">
            + Add Goal
          </button>
        </div>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit">
        {(['all', 'active', 'achieved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize',
              filter === f ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            )}>
            {f === 'all' ? `All (${goals.length})` : f === 'active' ? `Active (${goals.filter(g => !g.achieved).length})` : `Achieved (${achievedGoals})`}
          </button>
        ))}
      </div>

      {/* Goals grouped by timeline */}
      {filteredGoals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-500 dark:text-gray-400">No goals yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first goal above.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {uniqueTimeframes.map(tf => {
            const tfGoals = filteredGoals.filter(g => g.timeframe === tf);
            const tfAchieved = tfGoals.filter(g => g.achieved).length;
            const tfPct = Math.round((tfAchieved / tfGoals.length) * 100);
            const preset = TIMEFRAME_PRESETS.find(p => p.value === tf);

            return (
              <div key={tf} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{preset?.emoji || '📌'}</span>{tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </h3>
                  <span className={cn('text-xs font-bold px-2 py-1 rounded-lg',
                    tfPct === 100 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}>{tfAchieved}/{tfGoals.length} • {tfPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${tfPct}%` }} />
                </div>

                <div className="space-y-1.5">
                  {tfGoals.map(goal => {
                    const catInfo = GOAL_CATEGORIES.find(c => c.value === goal.category);
                    const isEditing = editingId === goal.id;

                    if (isEditing) {
                      return (
                        <div key={goal.id} className="p-4 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
                          <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                            autoFocus />
                          <div className="flex flex-wrap gap-1.5">
                            {GOAL_CATEGORIES.map(cat => (
                              <button key={cat.value} onClick={() => setEditCategory(cat.value)}
                                className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all',
                                  editCategory === cat.value ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 ring-1 ring-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                )}>{cat.emoji} {cat.label}</button>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-gray-500 mb-1">Timeline</p>
                            <div className="flex flex-wrap gap-1">
                              {TIMEFRAME_PRESETS.map(p => (
                                <button key={p.value} onClick={() => { setEditTimeframe(p.value); setEditCustomTimeframe(''); }}
                                  className={cn('px-2 py-1 rounded-lg text-[10px] font-medium transition-all',
                                    editTimeframe === p.value && !editCustomTimeframe ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                  )}>{p.emoji} {p.label}</button>
                              ))}
                            </div>
                            <div className="flex gap-2 mt-1.5">
                              <input type="text" value={editCustomTimeframe} onChange={e => setEditCustomTimeframe(e.target.value)}
                                placeholder="Custom timeline..."
                                className="flex-1 px-2 py-1.5 text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
                              <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                                className="px-2 py-1.5 text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="flex-1 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
                            <button onClick={cancelEdit} className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg">Cancel</button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={goal.id}
                        className={cn('flex items-center gap-3 p-3.5 rounded-xl border transition-all group',
                          goal.achieved ? 'bg-green-50/80 dark:bg-green-950/10 border-green-200/50 dark:border-green-800/30' : 'bg-white/80 dark:bg-gray-900/60 border-gray-200/60 dark:border-gray-800/60'
                        )}>
                        <button onClick={() => toggleAchieved(goal.id)}
                          className={cn('habit-check w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all flex-shrink-0',
                            goal.achieved ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md shadow-green-500/30 scale-95' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-90'
                          )}>
                          {goal.achieved ? '✓' : '○'}
                        </button>
                        <button onClick={() => startEdit(goal)} className="flex-1 min-w-0 text-left">
                          <p className={cn('text-sm font-semibold', goal.achieved ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-white')}>
                            {goal.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', catInfo?.color || 'bg-gray-100 text-gray-600')}>
                              {catInfo?.emoji || '📌'} {catInfo?.label || goal.category}
                            </span>
                            {goal.deadline && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                📅 {format(new Date(goal.deadline), 'MMM d, yyyy')}
                              </span>
                            )}
                            {goal.achieved && goal.achievedAt && (
                              <span className="text-[10px] text-green-600 dark:text-green-400">✓ {format(new Date(goal.achievedAt), 'MMM d, yyyy')}</span>
                            )}
                            <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100">tap to edit</span>
                          </div>
                        </button>
                        <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0',
                          goal.achieved ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        )}>{goal.achieved ? 'Achieved ✓' : 'In Progress'}</span>
                        <button onClick={() => removeGoal(goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm flex-shrink-0">✕</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overall Summary */}
      {goals.length > 0 && (
        <Card>
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Overall Progress</h4>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700',
                achievedPct === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              )} style={{ width: `${achievedPct}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">{achievedGoals} achieved</span>
              <span className="font-bold text-gray-900 dark:text-white">{achievedPct}%</span>
              <span className="text-gray-500 dark:text-gray-400">{totalGoals - achievedGoals} remaining</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              {GOAL_CATEGORIES.map(cat => {
                const catGoals = goals.filter(g => g.category === cat.value);
                if (catGoals.length === 0) return null;
                const catAchieved = catGoals.filter(g => g.achieved).length;
                const catPct = Math.round((catAchieved / catGoals.length) * 100);
                return (
                  <div key={cat.value} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                    <span className="text-sm">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-700 dark:text-gray-300 truncate">{cat.label}</p>
                      <p className="text-[10px] text-gray-500">{catAchieved}/{catGoals.length} • {catPct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </div>
  );
}
