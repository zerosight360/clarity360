'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  onClearAll?: () => void;
}

export default function TaskList({ tasks, onAdd, onToggle, onRemove, onClearAll }: TaskListProps) {
  const [newTask, setNewTask] = useState('');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAdd(newTask.trim());
    setNewTask('');
  };

  const toggleReminder = (taskId: string) => {
    const updated = { ...reminders, [taskId]: !reminders[taskId] };
    setReminders(updated);
    if (!reminders[taskId]) {
      // Request notification permission and schedule
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        // Show confirmation
        new Notification('Clarity360 Reminder Set', {
          body: `You'll be reminded about this task`,
          icon: '/icons/icon-192.svg',
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Input at TOP - always visible */}
      <div className="sticky top-0 z-10 pb-2" style={{ background: 'var(--bg-elevated)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="+ Add a task..."
            className="flex-1 px-4 py-3 rounded-lg text-[14px] outline-none"
            style={{ background: 'var(--border-light)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
          <button
            onClick={handleAdd}
            disabled={!newTask.trim()}
            className="px-4 py-3 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <ul className="space-y-1">
        {tasks.map(task => (
          <li key={task.id}
            className="flex items-center gap-3 px-3 py-3 rounded-lg group"
            style={{ background: task.completed ? 'var(--border-light)' : 'transparent' }}>
            {/* Checkbox */}
            <button
              onClick={() => onToggle(task.id)}
              className={cn('habit-check w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[11px]',
                task.completed ? 'border-[var(--success)] bg-[var(--success)] text-white' : 'border-[var(--border)]'
              )}>
              {task.completed && '✓'}
            </button>

            {/* Title */}
            <span className={cn('flex-1 text-[14px]',
              task.completed ? 'line-through' : ''
            )} style={{ color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
              {task.title}
            </span>

            {/* Reminder Bell */}
            <button
              onClick={() => toggleReminder(task.id)}
              className={cn('text-[16px] transition-all', reminders[task.id] ? 'opacity-100' : 'opacity-30 hover:opacity-70')}
              aria-label="Set reminder"
              title={reminders[task.id] ? 'Reminder on' : 'Set reminder'}
            >
              {reminders[task.id] ? '🔔' : '🔕'}
            </button>

            {/* Remove */}
            <button
              onClick={() => onRemove(task.id)}
              className="opacity-0 group-hover:opacity-100 text-[14px] transition-all"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Remove task"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="text-center text-[13px] py-6" style={{ color: 'var(--text-secondary)' }}>
          No tasks yet. Add one above.
        </p>
      )}

      {tasks.length > 0 && onClearAll && (
        <button onClick={onClearAll}
          className="w-full py-2.5 mt-2 rounded-lg text-[12px] font-semibold border border-dashed transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}>
          🗑️ Clear All Tasks
        </button>
      )}
    </div>
  );
}
