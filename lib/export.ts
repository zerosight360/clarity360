import { jsPDF } from 'jspdf';
import { DailyEntry, WeeklyEntry, MonthlyEntry } from '@/types';
import { format, parseISO } from 'date-fns';

export function exportDailyToPDF(entry: DailyEntry): void {
  const doc = new jsPDF();
  const date = format(parseISO(entry.date), 'MMMM d, yyyy');

  doc.setFontSize(20);
  doc.text(`Daily Entry - ${date}`, 20, 20);

  doc.setFontSize(12);
  let y = 40;

  // Priorities
  doc.setFontSize(14);
  doc.text('Top Priorities', 20, y);
  y += 10;
  doc.setFontSize(11);
  entry.priorities.filter(p => p).forEach((p, i) => {
    doc.text(`${i + 1}. ${p}`, 25, y);
    y += 7;
  });

  // Tasks
  y += 5;
  doc.setFontSize(14);
  doc.text('Tasks', 20, y);
  y += 10;
  doc.setFontSize(11);
  entry.tasks.forEach(t => {
    doc.text(`${t.completed ? '✓' : '○'} ${t.title}`, 25, y);
    y += 7;
  });

  // Focus Score
  y += 5;
  doc.setFontSize(14);
  doc.text(`Focus Score: ${entry.focusScore}/10`, 20, y);

  // Notes
  y += 15;
  doc.setFontSize(14);
  doc.text('What went well:', 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.text(entry.notes.wentWell || 'N/A', 25, y);

  y += 15;
  doc.setFontSize(14);
  doc.text('Improvements:', 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.text(entry.notes.improvements || 'N/A', 25, y);

  // Completion
  y += 15;
  doc.setFontSize(14);
  doc.text(`Completion: ${entry.completionPercentage}%`, 20, y);

  doc.save(`daily-entry-${entry.date}.pdf`);
}

export function exportWeeklyToPDF(entry: WeeklyEntry): void {
  const doc = new jsPDF();
  const weekStart = format(parseISO(entry.weekStart), 'MMM d, yyyy');

  doc.setFontSize(20);
  doc.text(`Weekly Goals - Week of ${weekStart}`, 20, 20);

  let y = 40;

  // Goals
  doc.setFontSize(14);
  doc.text('Goals', 20, y);
  y += 10;
  doc.setFontSize(11);
  entry.goals.forEach(g => {
    doc.text(`${g.completed ? '✓' : '○'} ${g.title}`, 25, y);
    y += 7;
  });

  // Habits
  y += 10;
  doc.setFontSize(14);
  doc.text('Habits', 20, y);
  y += 10;
  doc.setFontSize(11);
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  entry.habits.forEach(h => {
    const completed = days.filter(d => h.days[d]).length;
    doc.text(`${h.name}: ${completed}/7 days`, 25, y);
    y += 7;
  });

  // Reflection
  if (entry.reflection) {
    y += 10;
    doc.setFontSize(14);
    doc.text('Reflection', 20, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(entry.reflection, 165);
    doc.text(lines, 25, y);
  }

  doc.save(`weekly-entry-${entry.weekStart}.pdf`);
}

export function exportMonthlyToPDF(entry: MonthlyEntry): void {
  const doc = new jsPDF();
  const month = format(parseISO(entry.month + '-01'), 'MMMM yyyy');

  doc.setFontSize(20);
  doc.text(`Monthly Goals - ${month}`, 20, 20);

  let y = 40;

  // Goals by category
  const categories = ['work', 'personal', 'learning'] as const;
  categories.forEach(cat => {
    const goals = entry.goals.filter(g => g.category === cat);
    if (goals.length === 0) return;

    doc.setFontSize(14);
    doc.text(`${cat.charAt(0).toUpperCase() + cat.slice(1)}`, 20, y);
    y += 10;
    doc.setFontSize(11);
    goals.forEach(g => {
      doc.text(`${g.completed ? '✓' : '○'} ${g.title}`, 25, y);
      y += 7;
    });
    y += 5;
  });

  // Metrics
  y += 10;
  doc.setFontSize(14);
  doc.text('Metrics', 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`Completed Tasks: ${entry.metrics.completedTasks}`, 25, y);
  y += 7;
  doc.text(`Habit Success Rate: ${entry.metrics.habitSuccessRate}%`, 25, y);
  y += 7;
  doc.text(`Goals Completed: ${entry.metrics.goalsCompleted}`, 25, y);

  // Review
  if (entry.review) {
    y += 15;
    doc.setFontSize(14);
    doc.text('Monthly Review', 20, y);
    y += 8;
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(entry.review, 165);
    doc.text(lines, 25, y);
  }

  doc.save(`monthly-entry-${entry.month}.pdf`);
}
