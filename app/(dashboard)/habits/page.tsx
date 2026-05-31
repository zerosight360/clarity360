'use client';

import { useState } from 'react';
import { useProductivityStore } from '@/lib/store';
import Card from '@/components/Card';
import TemplateSelector from '@/components/TemplateSelector';
import UndoButton from '@/components/UndoButton';
import { useUndo } from '@/hooks/useUndo';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { getTemplate } from '@/lib/custom-templates';

const PRESET_HABITS = [
  { name: 'Gym', emoji: '🏋️' },
  { name: 'Meditate', emoji: '🧘' },
  { name: 'Read', emoji: '📖' },
  { name: 'No Sugar', emoji: '🚫' },
  { name: 'Wake Early', emoji: '⏰' },
  { name: 'Journal', emoji: '📝' },
  { name: 'Cold Shower', emoji: '🚿' },
  { name: 'Walk 10k', emoji: '🚶' },
];

const HABIT_TEMPLATES = [
  { id: 'warrior', name: 'Warrior Mode', emoji: '⚔️', description: '21-day: Gym, cold shower, no sugar, wake 5am' },
  { id: 'zen', name: 'Zen Master', emoji: '☯️', description: '21-day: Meditate, journal, read, gratitude' },
  { id: 'scholar', name: 'Scholar', emoji: '🎓', description: '90-day: Read, study, practice, review' },
  { id: 'athlete', name: 'Athlete', emoji: '🏅', description: '90-day: Gym, protein, sleep, stretch' },
  { id: 'monk', name: 'Digital Monk', emoji: '📵', description: '21-day: No social media, no news, present' },
  { id: 'health', name: 'Health Reset', emoji: '🥗', description: '21-day: Clean eating, water, sleep, walk' },
];

function getTemplateHabits(id: string): { name: string; emoji: string; duration: 21 | 90 }[] {
  switch (id) {
    case 'warrior': return [
      { name: 'Gym', emoji: '🏋️', duration: 21 },
      { name: 'Cold Shower', emoji: '🚿', duration: 21 },
      { name: 'No Sugar', emoji: '🚫', duration: 21 },
      { name: 'Wake 5 AM', emoji: '⏰', duration: 21 },
    ];
    case 'zen': return [
      { name: 'Meditate 20min', emoji: '🧘', duration: 21 },
      { name: 'Journal', emoji: '📝', duration: 21 },
      { name: 'Read 30min', emoji: '📖', duration: 21 },
      { name: 'Gratitude List', emoji: '🙏', duration: 21 },
    ];
    case 'scholar': return [
      { name: 'Read 1hr', emoji: '📖', duration: 90 },
      { name: 'Study/Course', emoji: '📚', duration: 90 },
      { name: 'Practice/Build', emoji: '💻', duration: 90 },
      { name: 'Review Notes', emoji: '🧠', duration: 90 },
    ];
    case 'athlete': return [
      { name: 'Gym', emoji: '🏋️', duration: 90 },
      { name: 'Hit Protein', emoji: '🥩', duration: 90 },
      { name: 'Sleep 8hrs', emoji: '😴', duration: 90 },
      { name: 'Stretch', emoji: '🤸', duration: 90 },
    ];
    case 'monk': return [
      { name: 'No Social Media', emoji: '📵', duration: 21 },
      { name: 'No News', emoji: '🚫', duration: 21 },
      { name: 'Be Present', emoji: '🧘', duration: 21 },
    ];
    case 'health': return [
      { name: 'Clean Eating', emoji: '🥗', duration: 21 },
      { name: 'Water 3L', emoji: '💧', duration: 21 },
      { name: 'Sleep by 10pm', emoji: '😴', duration: 21 },
      { name: 'Walk 30min', emoji: '🚶', duration: 21 },
    ];
    default: return [];
  }
}

export default function HabitsPage() {
  const { habitChallenges, addHabitChallenge, toggleChallengeDay, removeHabitChallenge } = useProductivityStore();
  const { canUndo, saveSnapshot, undo } = useUndo();
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('💪');
  const [duration, setDuration] = useState<21 | 90>(21);
  const [showAdd, setShowAdd] = useState(false);

  const handleAddPreset = (name: string, emoji: string) => {
    saveSnapshot();
    addHabitChallenge(name, emoji, duration);
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    saveSnapshot();
    addHabitChallenge(customName.trim(), customEmoji, duration);
    setCustomName('');
    setShowAdd(false);
  };

  const handleApplyTemplate = (templateId: string) => {
    saveSnapshot();
    const custom = getTemplate(templateId, 'habit');
    if (custom?.tasks?.length) {
      custom.tasks.forEach(name => addHabitChallenge(name, '💪', 21));
    } else {
      const habits = getTemplateHabits(templateId);
      habits.forEach(h => addHabitChallenge(h.name, h.emoji, h.duration));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Challenges</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">Build habits with 21-day or 90-day streaks</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
        >
          + New Challenge
        </button>
      </div>

      {/* Templates */}
      <Card>
        <TemplateSelector templates={HABIT_TEMPLATES} onSelect={handleApplyTemplate} title="Habit Templates — tap to start, hover to edit ✏️" type="habit" getTemplateItems={(id) => getTemplateHabits(id).map(h => `${h.emoji} ${h.name}`)} />
      </Card>

      {/* Add New Challenge */}
      {showAdd && (
        <Card className="border-indigo-200/50 dark:border-indigo-800/30">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setDuration(21)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-bold transition-all',
                  duration === 21
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                )}
              >
                🔥 21 Days
              </button>
              <button
                onClick={() => setDuration(90)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-bold transition-all',
                  duration === 90
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                )}
              >
                ⚡ 90 Days
              </button>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Quick Add</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_HABITS.map(h => (
                  <button
                    key={h.name}
                    onClick={() => handleAddPreset(h.name, h.emoji)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-sm"
                  >
                    <span>{h.emoji}</span>
                    <span className="text-gray-700 dark:text-gray-300">{h.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                className="w-14 px-2 py-2.5 text-center text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                maxLength={2}
              />
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                placeholder="Custom habit name..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customName.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Active Challenges */}
      {habitChallenges.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-500 dark:text-gray-400">No active challenges yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use a template above or create a custom challenge.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {habitChallenges.map(challenge => {
            const completedDays = Object.values(challenge.days).filter(Boolean).length;
            const progress = Math.round((completedDays / challenge.duration) * 100);
            const daysSinceStart = differenceInDays(new Date(), parseISO(challenge.startDate)) + 1;

            return (
              <Card key={challenge.id} className="overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{challenge.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{challenge.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {challenge.duration}-day • Day {Math.min(daysSinceStart, challenge.duration)} • {completedDays}/{challenge.duration} done
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                    <button
                      onClick={() => { saveSnapshot(); removeHabitChallenge(challenge.id); }}
                      className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                      aria-label="Remove challenge"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className={cn(
                  'grid gap-1.5',
                  challenge.duration === 21 ? 'grid-cols-7' : 'grid-cols-10 sm:grid-cols-15'
                )}>
                  {Array.from({ length: challenge.duration }, (_, i) => {
                    const dayNum = i + 1;
                    const isChecked = challenge.days[String(dayNum)];
                    return (
                      <button
                        key={dayNum}
                        onClick={() => { saveSnapshot(); toggleChallengeDay(challenge.id, dayNum); }}
                        className={cn(
                          'habit-check aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all select-none',
                          'min-w-[32px] min-h-[32px]',
                          isChecked
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-sm shadow-green-500/30 scale-95'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-90'
                        )}
                        aria-label={`Day ${dayNum} ${isChecked ? 'completed' : 'not completed'}`}
                      >
                        {isChecked ? '✓' : dayNum}
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </div>
  );
}
