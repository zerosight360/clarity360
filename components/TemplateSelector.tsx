'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CustomTemplate, loadCustomTemplates, saveTemplate, deleteTemplate } from '@/lib/custom-templates';

export interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelect: (templateId: string) => void;
  title?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'habit';
  getTemplateItems?: (id: string) => string[]; // returns the items for a template (tasks, goals, etc.)
}

export default function TemplateSelector({ templates, onSelect, title = 'Quick Templates', type, getTemplateItems }: TemplateSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItems, setEditItems] = useState<string[]>([]);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [customOverrides, setCustomOverrides] = useState<CustomTemplate[]>([]);

  useEffect(() => {
    setCustomOverrides(loadCustomTemplates().filter(t => t.type === type));
  }, [type]);

  const handleEdit = (template: Template) => {
    // Check if there's a custom override
    const custom = customOverrides.find(c => c.id === template.id);
    setEditingId(template.id);
    setEditName(custom?.name || template.name);
    setEditEmoji(custom?.emoji || template.emoji);
    setEditDesc(custom?.description || template.description);

    if (custom?.tasks) {
      setEditItems(custom.tasks);
    } else if (getTemplateItems) {
      setEditItems(getTemplateItems(template.id));
    } else {
      setEditItems([]);
    }
  };

  const handleSave = () => {
    if (!editingId) return;
    const custom: CustomTemplate = {
      id: editingId,
      name: editName,
      emoji: editEmoji,
      description: editDesc,
      type,
      tasks: editItems.filter(i => i.trim()),
    };
    saveTemplate(custom);
    setCustomOverrides(loadCustomTemplates().filter(t => t.type === type));
    setEditingId(null);
  };

  const handleReset = (id: string) => {
    deleteTemplate(id, type);
    setCustomOverrides(loadCustomTemplates().filter(t => t.type === type));
    setEditingId(null);
  };

  const handleAddItem = () => {
    setEditItems([...editItems, '']);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, value: string) => {
    const updated = [...editItems];
    updated[index] = value;
    setEditItems(updated);
  };

  const getDisplayTemplate = (t: Template) => {
    const custom = customOverrides.find(c => c.id === t.id);
    return {
      ...t,
      name: custom?.name || t.name,
      emoji: custom?.emoji || t.emoji,
      description: custom?.description || t.description,
    };
  };

  // When selecting, use custom tasks if available
  const handleSelect = (id: string) => {
    onSelect(id);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        {editingId && (
          <button
            onClick={() => setEditingId(null)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Edit Mode */}
      {editingId && (
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={editEmoji}
              onChange={e => setEditEmoji(e.target.value)}
              className="w-12 px-2 py-2 text-center text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
              maxLength={2}
            />
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Template name"
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
            />
          </div>
          <input
            type="text"
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            placeholder="Short description"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />

          {/* Editable Items */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Items (tasks / goals / habits)</p>
            {editItems.map((item, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  type="text"
                  value={item}
                  onChange={e => handleItemChange(i, e.target.value)}
                  placeholder={`Item ${i + 1}`}
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                />
                <button
                  onClick={() => handleRemoveItem(i)}
                  className="px-2 text-gray-400 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={handleAddItem}
              className="w-full py-1.5 text-xs text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
            >
              + Add item
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => handleReset(editingId)}
              className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Reset Default
            </button>
          </div>
        </div>
      )}

      {/* Template Grid */}
      {!editingId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {templates.map(t => {
            const display = getDisplayTemplate(t);
            const isCustomized = customOverrides.some(c => c.id === t.id);
            return (
              <div
                key={t.id}
                className={cn(
                  'relative flex items-start gap-3 p-3.5 rounded-xl text-left transition-all group',
                  'bg-gray-50/80 dark:bg-gray-800/30 border border-gray-200/60 dark:border-gray-700/40',
                  'hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-700',
                )}
              >
                {/* Use button */}
                <button
                  onClick={() => handleSelect(t.id)}
                  className="absolute inset-0 rounded-xl z-0"
                  aria-label={`Use ${display.name} template`}
                />

                <span className="text-xl flex-shrink-0 mt-0.5 relative z-10 pointer-events-none">{display.emoji}</span>
                <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{display.name}</p>
                    {isCustomized && (
                      <span className="text-[8px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                        EDITED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{display.description}</p>
                </div>

                {/* Edit button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(t); }}
                  className="relative z-20 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-xs flex-shrink-0"
                  aria-label={`Edit ${display.name} template`}
                >
                  ✏️
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
