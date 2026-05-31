// Custom templates storage - users can edit built-in templates or create their own

export interface CustomTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'habit';
  tasks?: string[];
  priorities?: string[];
  goals?: { title: string; category?: string }[];
  habits?: { name: string; emoji: string; duration?: 21 | 90 }[];
  weeklyHabits?: string[];
}

const STORAGE_KEY = 'productivity_custom_templates';

export function loadCustomTemplates(): CustomTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function saveCustomTemplates(templates: CustomTemplate[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getTemplate(id: string, type: string): CustomTemplate | undefined {
  const templates = loadCustomTemplates();
  return templates.find(t => t.id === id && t.type === type);
}

export function saveTemplate(template: CustomTemplate) {
  const templates = loadCustomTemplates();
  const idx = templates.findIndex(t => t.id === template.id && t.type === template.type);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push(template);
  }
  saveCustomTemplates(templates);
}

export function deleteTemplate(id: string, type: string) {
  const templates = loadCustomTemplates().filter(t => !(t.id === id && t.type === type));
  saveCustomTemplates(templates);
}
