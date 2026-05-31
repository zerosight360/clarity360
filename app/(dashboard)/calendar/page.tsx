'use client';

import Card from '@/components/Card';
import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
          View your productivity at a glance
        </p>
      </div>

      <Card>
        <CalendarView />
      </Card>
    </div>
  );
}
