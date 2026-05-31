'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, parseISO, subDays } from 'date-fns';
import { useProductivityStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import Card from '@/components/Card';
import TaskList from '@/components/TaskList';
import FocusSlider from '@/components/FocusSlider';
import ProgressBar from '@/components/ProgressBar';
import TemplateSelector from '@/components/TemplateSelector';
import UndoButton from '@/components/UndoButton';
import { useUndo } from '@/hooks/useUndo';
import { exportDailyToPDF } from '@/lib/export';
import { getTemplate } from '@/lib/custom-templates';
import { cn } from '@/lib/utils';

const DAILY_TEMPLATES = [
  { id: 'fitness', name: 'Fitness Day', emoji: '🏋️', description: 'Gym, protein, stretching, sleep early' },
  { id: 'deep-work', name: 'Deep Work', emoji: '💻', description: 'Focus blocks, no social media, ship code' },
  { id: 'balanced', name: 'Balanced Day', emoji: '⚖️', description: 'Gym, work, read, meditate, family time' },
  { id: 'recovery', name: 'Recovery Day', emoji: '🧘', description: 'Light walk, meditate, journal, rest' },
  { id: 'learning', name: 'Learning Day', emoji: '📚', description: 'Course, read, practice, take notes' },
  { id: 'hustle', name: 'Hustle Mode', emoji: '🔥', description: 'Wake 5am, gym, work 10hrs, no excuses' },
];

function getTemplateTasks(templateId: string): string[] {
  switch (templateId) {
    case 'fitness':
      return ['🏋️ Gym - Push day', '🥩 Hit protein goal (150g)', '🧘 Stretch 15 min', '💧 Drink 4L water', '😴 Sleep by 10pm'];
    case 'deep-work':
      return ['💻 Deep work block 1 (2hrs)', '💻 Deep work block 2 (2hrs)', '📵 No social media', '📧 Process emails (30min)', '✅ Ship one feature'];
    case 'balanced':
      return ['🏋️ Gym / Exercise', '💼 Focused work (4hrs)', '📖 Read 30 minutes', '🧘 Meditate 10 min', '👨‍👩‍👧 Family / Social time'];
    case 'recovery':
      return ['🚶 Light walk 30 min', '🧘 Meditate 20 min', '📝 Journal reflections', '📖 Read for pleasure', '🛁 Self-care routine'];
    case 'learning':
      return ['📚 Online course (1hr)', '📖 Read technical book', '💻 Practice / Build project', '📝 Take notes & summarize', '🧠 Review flashcards'];
    case 'hustle':
      return ['⏰ Wake up at 5:00 AM', '🏋️ Gym before 7 AM', '💻 Work block 1 (3hrs)', '💻 Work block 2 (3hrs)', '💻 Work block 3 (3hrs)', '📵 Zero distractions'];
    default:
      return [];
  }
}

function getTemplatePriorities(templateId: string): string[] {
  switch (templateId) {
    case 'fitness': return ['Complete full workout', 'Hit macros', 'Recovery & sleep'];
    case 'deep-work': return ['Ship feature/deliverable', 'Zero distractions', 'Clear inbox'];
    case 'balanced': return ['Exercise done', 'Meaningful work', 'Personal growth'];
    case 'recovery': return ['Rest & recharge', 'Mental clarity', 'Gratitude practice'];
    case 'learning': return ['Complete 1 module', 'Practice hands-on', 'Retain knowledge'];
    case 'hustle': return ['Maximum output', 'No excuses', 'Outwork yesterday'];
    default: return ['', '', ''];
  }
}

export default function DailyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dateParam = searchParams.get('date');
  const currentDate = dateParam || formatDate(new Date());
  const { canUndo, saveSnapshot, undo } = useUndo();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCopyPicker, setShowCopyPicker] = useState(false);

  const {
    dailyEntries,
    createDailyEntry,
    addTask,
    toggleTask,
    removeTask,
    updatePriorities,
    updateFocusScore,
    updateNotes,
  } = useProductivityStore();

  useEffect(() => {
    createDailyEntry(currentDate);
  }, [currentDate, createDailyEntry]);

  const entry = useMemo(
    () => dailyEntries.find(e => e.date === currentDate),
    [dailyEntries, currentDate]
  );

  const handleApplyTemplate = (templateId: string) => {
    if (!entry) return;
    saveSnapshot();
    const custom = getTemplate(templateId, 'daily');
    const tasks = custom?.tasks?.length ? custom.tasks : getTemplateTasks(templateId);
    const priorities = getTemplatePriorities(templateId);
    tasks.forEach(title => addTask(entry.id, title));
    updatePriorities(entry.id, priorities);
  };

  // All previous entries sorted by date (newest first)
  const previousEntries = useMemo(() => {
    return [...dailyEntries]
      .filter(e => e.date !== currentDate && e.tasks.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyEntries, currentDate]);

  const handleCopyFrom = (sourceDate: string) => {
    if (!entry) return;
    const source = dailyEntries.find(e => e.date === sourceDate);
    if (!source) return;
    saveSnapshot();
    source.tasks.forEach(task => addTask(entry.id, task.title));
    updatePriorities(entry.id, [...source.priorities]);
    setShowCopyPicker(false);
  };

  const handleDateChange = (newDate: string) => {
    router.push(`/daily?date=${newDate}`);
    setShowDatePicker(false);
  };

  if (!entry) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Entry</h1>
          {/* Clickable date */}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <span>📅</span>
            {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
            <span className="text-xs text-gray-400">▼</span>
          </button>
        </div>
        <button
          onClick={() => exportDailyToPDF(entry)}
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Export PDF
        </button>
      </div>

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Jump to date</p>
          <input
            type="date"
            value={currentDate}
            onChange={e => handleDateChange(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex gap-2">
            <button onClick={() => handleDateChange(formatDate(new Date()))}
              className="flex-1 py-2 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
              Today
            </button>
            <button onClick={() => handleDateChange(formatDate(subDays(new Date(), 1)))}
              className="flex-1 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-lg">
              Yesterday
            </button>
            <button onClick={() => setShowDatePicker(false)}
              className="flex-1 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Copy from any date */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCopyPicker(!showCopyPicker)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-all active:scale-[0.98]',
            showCopyPicker
              ? 'border-indigo-400 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
          )}
        >
          <span>📋</span>
          Copy tasks from another day
        </button>
      </div>

      {/* Copy Date Picker */}
      {showCopyPicker && (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Choose a day to copy from</p>
          {previousEntries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No previous entries to copy from.</p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {previousEntries.slice(0, 15).map(prev => (
                <button
                  key={prev.id}
                  onClick={() => handleCopyFrom(prev.date)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {format(parseISO(prev.date), 'EEE, MMM d')}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]">
                      {prev.tasks.map(t => t.title).join(' • ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">{prev.tasks.length} tasks</span>
                    <span className="text-indigo-500 text-sm">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setShowCopyPicker(false)}
            className="w-full py-2 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-lg">
            Cancel
          </button>
        </div>
      )}


      {/* Templates */}
      <Card>
        <TemplateSelector templates={DAILY_TEMPLATES} onSelect={handleApplyTemplate} title="Daily Templates — tap to load, hover to edit ✏️" type="daily" getTemplateItems={getTemplateTasks} />
      </Card>

      {/* Completion */}
      <Card>
        <ProgressBar value={entry.completionPercentage} color="green" />
      </Card>

      {/* Top 3 Priorities */}
      <Card title="Top 3 Priorities" subtitle="What matters most today">
        <div className="space-y-3">
          {entry.priorities.map((priority, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={priority}
                onChange={e => {
                  saveSnapshot();
                  const newPriorities = [...entry.priorities];
                  newPriorities[index] = e.target.value;
                  updatePriorities(entry.id, newPriorities);
                }}
                placeholder={`Priority ${index + 1}`}
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Tasks */}
      <Card title="Tasks" subtitle="Your checklist for today">
        <TaskList
          tasks={entry.tasks}
          onAdd={title => { saveSnapshot(); addTask(entry.id, title); }}
          onToggle={taskId => { saveSnapshot(); toggleTask(entry.id, taskId); }}
          onRemove={taskId => { saveSnapshot(); removeTask(entry.id, taskId); }}
          onClearAll={() => { saveSnapshot(); entry.tasks.forEach(t => removeTask(entry.id, t.id)); }}
        />
      </Card>

      {/* Focus Score */}
      <Card title="Focus Score">
        <FocusSlider
          value={entry.focusScore}
          onChange={score => updateFocusScore(entry.id, score)}
        />
      </Card>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="What went well ✅">
          <textarea
            value={entry.notes.wentWell}
            onChange={e => updateNotes(entry.id, { wentWell: e.target.value })}
            placeholder="Reflect on what went well today..."
            rows={4}
            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </Card>

        <Card title="Improvements 📈">
          <textarea
            value={entry.notes.improvements}
            onChange={e => updateNotes(entry.id, { improvements: e.target.value })}
            placeholder="What could be improved..."
            rows={4}
            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </Card>
      </div>

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </div>
  );
}
