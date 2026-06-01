'use client';

import { useState, useRef } from 'react';
import Card from '@/components/Card';
import { cn } from '@/lib/utils';
import { format, differenceInDays, parseISO } from 'date-fns';

interface StreakChallenge {
  id: string;
  name: string;
  emoji: string;
  target: number; // 21, 30, 50, 75, 100, 365
  startDate: string;
  days: { [key: string]: boolean };
  createdAt: string;
}

const STREAK_PRESETS = [
  { name: '14 Day Kickstart', emoji: '⚡', target: 14 },
  { name: '21 Day Discipline', emoji: '🔥', target: 21 },
  { name: '30 Day Transform', emoji: '💪', target: 30 },
  { name: '50 Day Warrior', emoji: '⚔️', target: 50 },
  { name: '75 Hard', emoji: '💎', target: 75 },
  { name: '100 Day Challenge', emoji: '🏆', target: 100 },
  { name: '365 Day Legend', emoji: '👑', target: 365 },
];

const STORAGE_KEY = 'productivity_streak_challenges';

function load(): StreakChallenge[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function save(data: StreakChallenge[]) { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function genId() { return Math.random().toString(36).substring(2) + Date.now().toString(36); }

export default function StreaksPage() {
  const [challenges, setChallenges] = useState<StreakChallenge[]>(load);
  const [showAdd, setShowAdd] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customTarget, setCustomTarget] = useState(100);
  const [customEmoji, setCustomEmoji] = useState('🎯');
  const [shareCard, setShareCard] = useState<StreakChallenge | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const persist = (data: StreakChallenge[]) => { setChallenges(data); save(data); };

  const addChallenge = (name: string, emoji: string, target: number) => {
    const challenge: StreakChallenge = { id: genId(), name, emoji, target, startDate: format(new Date(), 'yyyy-MM-dd'), days: {}, createdAt: new Date().toISOString() };
    persist([...challenges, challenge]);
    setShowAdd(false);
    setCustomName('');
  };

  const toggleDay = (id: string, day: number) => {
    persist(challenges.map(c => {
      if (c.id !== id) return c;
      const key = String(day);
      return { ...c, days: { ...c.days, [key]: !c.days[key] } };
    }));
  };

  const removeChallenge = (id: string) => {
    persist(challenges.filter(c => c.id !== id));
  };

  const getStreakCount = (c: StreakChallenge): number => {
    // Count consecutive days from the end
    const completed = Object.keys(c.days).filter(k => c.days[k]).map(Number).sort((a, b) => b - a);
    if (completed.length === 0) return 0;
    let streak = 0;
    const today = differenceInDays(new Date(), parseISO(c.startDate)) + 1;
    for (let d = today; d >= 1; d--) {
      if (c.days[String(d)]) streak++;
      else break;
    }
    return streak;
  };

  const isCompleted = (c: StreakChallenge): boolean => {
    const done = Object.values(c.days).filter(Boolean).length;
    return done >= c.target;
  };

  const shareToSocial = async (c: StreakChallenge, platform: 'whatsapp' | 'instagram' | 'copy') => {
    const done = Object.values(c.days).filter(Boolean).length;
    const pct = Math.round((done / c.target) * 100);
    const completed = isCompleted(c);

    const text = completed
      ? `🏆 I completed the ${c.emoji} ${c.name}! ${c.target} days done! 💪\n\n#Clarity360 #${c.target}DayChallenge #NeverMissADay`
      : `${c.emoji} Day ${done}/${c.target} of my ${c.name}! ${pct}% done 🔥\n\nCurrent streak: ${getStreakCount(c)} days 💪\n\n#Clarity360 #${c.target}DayChallenge`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'instagram') {
      // Instagram doesn't support direct text sharing via URL, copy to clipboard
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard! Open Instagram and paste in your story or post.');
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
    setShareCard(null);
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold" style={{ color: 'var(--text-primary)' }}>Streaks 🔥</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Never break the chain</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
          + New
        </button>
      </div>

      {/* Add Challenge */}
      {showAdd && (
        <Card>
          <div className="space-y-4">
            <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Quick Start</p>
            <div className="grid grid-cols-2 gap-2">
              {STREAK_PRESETS.map(p => (
                <button key={p.target} onClick={() => addChallenge(p.name, p.emoji, p.target)}
                  className="flex items-center gap-2 p-3 rounded-lg text-left transition-all hover:bg-[var(--border-light)]" style={{ border: '1px solid var(--border)' }}>
                  <span className="text-[20px]">{p.emoji}</span>
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{p.target} days</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[12px] font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Custom Challenge</p>
              <div className="flex gap-2">
                <input type="text" value={customEmoji} onChange={e => setCustomEmoji(e.target.value)}
                  className="w-12 px-2 py-2 text-center text-[18px] rounded-lg outline-none" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }} maxLength={2} />
                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
                  placeholder="Challenge name" className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }} />
                <input type="number" value={customTarget} onChange={e => setCustomTarget(Number(e.target.value))}
                  className="w-16 px-2 py-2 text-center rounded-lg text-[13px] outline-none" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }} min={7} max={999} />
              </div>
              <button onClick={() => customName && addChallenge(customName, customEmoji, customTarget)}
                disabled={!customName.trim()}
                className="w-full mt-2 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                Start Challenge
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Active Challenges */}
      {challenges.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-[40px] mb-2">🔥</p>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>No active streaks</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>Start a challenge and never break the chain!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {challenges.map(c => {
            const done = Object.values(c.days).filter(Boolean).length;
            const pct = Math.round((done / c.target) * 100);
            const streak = getStreakCount(c);
            const completed = isCompleted(c);
            const daysSinceStart = differenceInDays(new Date(), parseISO(c.startDate)) + 1;

            return (
              <div key={c.id} className="fb-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center gap-3">
                    <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-[20px]', completed ? 'story-ring' : '')}
                      style={!completed ? { background: 'var(--border-light)' } : {}}>
                      {completed ? <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>{c.emoji}</span> : c.emoji}
                    </div>
                    <div>
                      <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        Day {Math.min(daysSinceStart, c.target)} · {done}/{c.target} done · 🔥 {streak} streak
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShareCard(c)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
                      Share
                    </button>
                    <button onClick={() => removeChallenge(c.id)} className="text-[16px] px-1" style={{ color: 'var(--text-secondary)' }}>✕</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{pct}% complete</span>
                    <span className="text-[11px] font-bold" style={{ color: completed ? 'var(--success)' : 'var(--accent)' }}>
                      {completed ? '🏆 COMPLETED!' : `${c.target - done} days left`}
                    </span>
                  </div>
                  <div className="w-full h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--border-light)' }}>
                    <div className={cn('h-full rounded-full transition-all duration-500', completed ? 'bg-[var(--success)]' : 'bg-[var(--accent)]')}
                      style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>

                {/* Day grid */}
                <div className="p-4">
                  <div className={cn('grid gap-[3px]', c.target <= 30 ? 'grid-cols-7' : c.target <= 75 ? 'grid-cols-10' : 'grid-cols-10 sm:grid-cols-14')}>
                    {Array.from({ length: c.target }, (_, i) => {
                      const dayNum = i + 1;
                      const checked = c.days[String(dayNum)];
                      return (
                        <button key={dayNum} onClick={() => toggleDay(c.id, dayNum)}
                          className={cn('habit-check aspect-square rounded-md flex items-center justify-center text-[9px] font-bold select-none',
                            checked ? 'text-white' : ''
                          )}
                          style={checked ? { background: 'var(--accent)' } : { background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                          {checked ? '✓' : dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {shareCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShareCard(null)} />
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
            {/* Share Card Preview */}
            <div ref={shareRef} className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <p className="text-[40px] mb-2">{shareCard.emoji}</p>
              <p className="text-[18px] font-extrabold text-white">{shareCard.name}</p>
              <p className="text-[32px] font-black text-white mt-2">
                {Object.values(shareCard.days).filter(Boolean).length}/{shareCard.target}
              </p>
              <p className="text-[13px] text-white/80 mt-1">
                {isCompleted(shareCard) ? '🏆 Challenge Completed!' : `🔥 ${getStreakCount(shareCard)} day streak`}
              </p>
              <p className="text-[11px] text-white/60 mt-3 font-medium">Clarity360</p>
            </div>

            {/* Share Options */}
            <div className="p-4 space-y-2">
              <p className="text-[12px] font-bold text-center mb-3" style={{ color: 'var(--text-secondary)' }}>Share your progress</p>

              <button onClick={() => shareToSocial(shareCard, 'whatsapp')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--border-light)] transition-all">
                <span className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white text-[18px]">💬</span>
                <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>WhatsApp Status</span>
              </button>

              <button onClick={() => shareToSocial(shareCard, 'instagram')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--border-light)] transition-all">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[18px]" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>📷</span>
                <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Instagram Story</span>
              </button>

              <button onClick={() => shareToSocial(shareCard, 'copy')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--border-light)] transition-all">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ background: 'var(--border-light)' }}>📋</span>
                <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Copy Text</span>
              </button>

              <button onClick={() => setShareCard(null)}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold mt-2" style={{ color: 'var(--text-secondary)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
