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

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAdd(newTask.trim());
    setNewTask('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      <ul className="space-y-1.5">
        {tasks.map(task => (
          <li
            key={task.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors"
          >
            <button
              onClick={() => onToggle(task.id)}
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                task.completed
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              )}
              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.completed && <span className="text-xs">✓</span>}
            </button>
            <span className={cn(
              'flex-1 text-sm transition-all',
              task.completed
                ? 'text-gray-400 dark:text-gray-500 line-through'
                : 'text-gray-700 dark:text-gray-300'
            )}>
              {task.title}
            </span>
            <button
              onClick={() => onRemove(task.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
              aria-label="Remove task"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
          No tasks yet. Add one above.
        </p>
      )}

      {tasks.length > 0 && onClearAll && (
        <button
          onClick={onClearAll}
          className="w-full py-2.5 mt-2 rounded-lg text-[12px] font-semibold border border-dashed transition-all hover:bg-red-50 dark:hover:bg-red-950/10 hover:border-red-300 dark:hover:border-red-800"
          style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
        >
          🗑️ Clear All Tasks
        </button>
      )}
    </div>
  );
}
