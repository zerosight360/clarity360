'use client';

import { cn } from '@/lib/utils';

interface FocusSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function FocusSlider({ value, onChange }: FocusSliderProps) {
  const getColor = (v: number) => {
    if (v <= 3) return 'text-red-500';
    if (v <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Focus Score</span>
        <span className={cn('text-2xl font-bold', getColor(value))}>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        aria-label="Focus score"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Distracted</span>
        <span>Focused</span>
      </div>
    </div>
  );
}
