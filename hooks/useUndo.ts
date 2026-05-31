'use client';

import { useCallback, useRef, useState } from 'react';
import { useProductivityStore } from '@/lib/store';
import { storage } from '@/lib/storage';

interface Snapshot {
  dailyEntries: string;
  weeklyEntries: string;
  monthlyEntries: string;
  habitChallenges: string;
  quotes: string;
  photos: string;
}

export function useUndo() {
  const [canUndo, setCanUndo] = useState(false);
  const historyRef = useRef<Snapshot[]>([]);
  const store = useProductivityStore;

  const saveSnapshot = useCallback(() => {
    const state = store.getState();
    const snapshot: Snapshot = {
      dailyEntries: JSON.stringify(state.dailyEntries),
      weeklyEntries: JSON.stringify(state.weeklyEntries),
      monthlyEntries: JSON.stringify(state.monthlyEntries),
      habitChallenges: JSON.stringify(state.habitChallenges),
      quotes: JSON.stringify(state.quotes),
      photos: JSON.stringify(state.photos),
    };
    historyRef.current.push(snapshot);
    // Keep max 20 snapshots
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
    setCanUndo(true);
  }, [store]);

  const undo = useCallback(() => {
    const snapshot = historyRef.current.pop();
    if (!snapshot) {
      setCanUndo(false);
      return;
    }

    const dailyEntries = JSON.parse(snapshot.dailyEntries);
    const weeklyEntries = JSON.parse(snapshot.weeklyEntries);
    const monthlyEntries = JSON.parse(snapshot.monthlyEntries);
    const habitChallenges = JSON.parse(snapshot.habitChallenges);
    const quotes = JSON.parse(snapshot.quotes);
    const photos = JSON.parse(snapshot.photos);

    store.setState({ dailyEntries, weeklyEntries, monthlyEntries, habitChallenges, quotes, photos });

    // Persist
    storage.saveDailyEntries(dailyEntries);
    storage.saveWeeklyEntries(weeklyEntries);
    storage.saveMonthlyEntries(monthlyEntries);
    storage.saveHabitChallenges(habitChallenges);
    storage.saveQuotes(quotes);
    storage.savePhotos(photos);

    setCanUndo(historyRef.current.length > 0);
  }, [store]);

  return { canUndo, saveSnapshot, undo };
}
