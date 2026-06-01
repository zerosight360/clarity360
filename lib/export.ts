import { jsPDF } from 'jspdf';
import { DailyEntry, WeeklyEntry, MonthlyEntry } from '@/types';
import { format, parseISO } from 'date-fns';

// Helper to clean text for PDF (remove emojis that cause encoding issues)
function clean(text: string): string {
  return text.replace(/[\u{1F600}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '').trim();
}

export function exportDailyToPDF(entry: DailyEntry): void {
  const doc = new jsPDF();
  const date = format(parseISO(entry.date), 'MMMM d, yyyy');
  const completedTasks = entry.tasks.filter(t => t.completed).length;

  // Header
  doc.setFontSize(22);
  doc.text('Clarity360 - Daily Report', 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(date, 20, 28);
  doc.setTextColor(0);

  // Summary box
  doc.setFontSize(11);
  let y = 40;
  doc.text(`SUMMARY`, 20, y);
  y += 8;
  doc.text(`Tasks Completed: ${completedTasks}/${entry.tasks.length}`, 25, y);
  y += 6;
  doc.text(`Completion: ${entry.completionPercentage}%`, 25, y);
  y += 6;
  doc.text(`Focus Score: ${entry.focusScore}/10`, 25, y);

  // Priorities
  y += 14;
  doc.setFontSize(13);
  doc.text('TOP PRIORITIES', 20, y);
  y += 8;
  doc.setFontSize(11);
  entry.priorities.filter(p => p).forEach((p, i) => {
    doc.text(`${i + 1}. ${clean(p)}`, 25, y);
    y += 7;
  });

  // Tasks
  y += 8;
  doc.setFontSize(13);
  doc.text('TASKS', 20, y);
  y += 8;
  doc.setFontSize(11);
  entry.tasks.forEach(t => {
    const status = t.completed ? '[DONE]' : '[    ]';
    doc.text(`${status} ${clean(t.title)}`, 25, y);
    y += 7;
  });

  // Notes
  if (entry.notes.wentWell) {
    y += 10;
    doc.setFontSize(13);
    doc.text('WHAT WENT WELL', 20, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(entry.notes.wentWell, 165);
    doc.text(lines, 25, y);
    y += lines.length * 6;
  }

  if (entry.notes.improvements) {
    y += 8;
    doc.setFontSize(13);
    doc.text('IMPROVEMENTS', 20, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(entry.notes.improvements, 165);
    doc.text(lines, 25, y);
  }

  doc.save(`clarity360-daily-${entry.date}.pdf`);
}

export function exportWeeklyToPDF(entry: WeeklyEntry): void {
  const doc = new jsPDF();
  const weekStart = format(parseISO(entry.weekStart), 'MMM d, yyyy');
  const goalsCompleted = entry.goals.filter(g => g.completed).length;

  doc.setFontSize(22);
  doc.text('Clarity360 - Weekly Report', 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Week of ${weekStart}`, 20, 28);
  doc.setTextColor(0);

  let y = 40;
  doc.setFontSize(11);
  doc.text(`SUMMARY: ${goalsCompleted}/${entry.goals.length} goals completed`, 20, y);

  // Goals
  y += 12;
  doc.setFontSize(13);
  doc.text('GOALS', 20, y);
  y += 8;
  doc.setFontSize(11);
  entry.goals.forEach(g => {
    doc.text(`${g.completed ? '[DONE]' : '[    ]'} ${clean(g.title)}`, 25, y);
    y += 7;
  });

  // Habits
  y += 10;
  doc.setFontSize(13);
  doc.text('HABITS', 20, y);
  y += 8;
  doc.setFontSize(11);
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  entry.habits.forEach(h => {
    const completed = days.filter(d => h.days[d]).length;
    doc.text(`${clean(h.name)}: ${completed}/7 days`, 25, y);
    y += 7;
  });

  // Reflection
  if (entry.reflection) {
    y += 10;
    doc.setFontSize(13);
    doc.text('REFLECTION', 20, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(entry.reflection, 165);
    doc.text(lines, 25, y);
  }

  doc.save(`clarity360-weekly-${entry.weekStart}.pdf`);
}

export function exportMonthlyToPDF(entry: MonthlyEntry): void {
  const doc = new jsPDF();
  const month = format(parseISO(entry.month + '-01'), 'MMMM yyyy');
  const goalsCompleted = entry.goals.filter(g => g.completed).length;

  doc.setFontSize(22);
  doc.text('Clarity360 - Monthly Report', 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(month, 20, 28);
  doc.setTextColor(0);

  let y = 40;
  doc.setFontSize(11);
  doc.text(`SUMMARY`, 20, y);
  y += 8;
  doc.text(`Goals Completed: ${goalsCompleted}/${entry.goals.length}`, 25, y);
  y += 6;
  doc.text(`Tasks Done: ${entry.metrics.completedTasks}`, 25, y);
  y += 6;
  doc.text(`Habit Success: ${entry.metrics.habitSuccessRate}%`, 25, y);

  // Goals by category
  y += 14;
  const categories = ['health', 'work', 'personal', 'learning'] as const;
  categories.forEach(cat => {
    const goals = entry.goals.filter(g => g.category === cat);
    if (goals.length === 0) return;

    doc.setFontSize(13);
    doc.text(cat.toUpperCase(), 20, y);
    y += 8;
    doc.setFontSize(11);
    goals.forEach(g => {
      doc.text(`${g.completed ? '[DONE]' : '[    ]'} ${clean(g.title)}`, 25, y);
      y += 7;
    });
    y += 4;
  });

  // Review
  if (entry.review) {
    y += 6;
    doc.setFontSize(13);
    doc.text('MONTHLY REVIEW', 20, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(entry.review, 165);
    doc.text(lines, 25, y);
  }

  doc.save(`clarity360-monthly-${entry.month}.pdf`);
}

// Export summary for a date range
export function exportSummaryPDF(entries: DailyEntry[], startDate: string, endDate: string): void {
  const doc = new jsPDF();
  const filtered = entries.filter(e => e.date >= startDate && e.date <= endDate);

  const totalTasks = filtered.reduce((s, e) => s + e.tasks.length, 0);
  const completedTasks = filtered.reduce((s, e) => s + e.tasks.filter(t => t.completed).length, 0);
  const avgCompletion = filtered.length > 0 ? Math.round(filtered.reduce((s, e) => s + e.completionPercentage, 0) / filtered.length) : 0;
  const avgFocus = filtered.length > 0 ? (filtered.reduce((s, e) => s + e.focusScore, 0) / filtered.length).toFixed(1) : '0';

  doc.setFontSize(22);
  doc.text('Clarity360 - Summary Report', 20, 20);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`${format(parseISO(startDate), 'MMM d, yyyy')} - ${format(parseISO(endDate), 'MMM d, yyyy')}`, 20, 28);
  doc.setTextColor(0);

  let y = 44;
  doc.setFontSize(14);
  doc.text('OVERVIEW', 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`Days Tracked: ${filtered.length}`, 25, y); y += 7;
  doc.text(`Total Tasks: ${totalTasks}`, 25, y); y += 7;
  doc.text(`Tasks Completed: ${completedTasks}`, 25, y); y += 7;
  doc.text(`Average Completion: ${avgCompletion}%`, 25, y); y += 7;
  doc.text(`Average Focus: ${avgFocus}/10`, 25, y); y += 14;

  // Daily breakdown
  doc.setFontSize(14);
  doc.text('DAILY BREAKDOWN', 20, y);
  y += 10;
  doc.setFontSize(10);
  filtered.forEach(e => {
    if (y > 270) { doc.addPage(); y = 20; }
    const done = e.tasks.filter(t => t.completed).length;
    doc.text(`${e.date}  |  ${done}/${e.tasks.length} tasks  |  ${e.completionPercentage}%  |  Focus: ${e.focusScore}/10`, 25, y);
    y += 6;
  });

  doc.save(`clarity360-summary-${startDate}-to-${endDate}.pdf`);
}
