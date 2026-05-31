'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import UndoButton from '@/components/UndoButton';
import { useUndo } from '@/hooks/useUndo';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  done: boolean;
}

type Level = 'beginner' | 'intermediate' | 'advanced' | 'pro';

interface WorkoutTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  level: Level;
  exercises: Omit<Exercise, 'id' | 'done'>[];
}

const LEVELS: { value: Level; label: string; emoji: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱', color: '#58c322' },
  { value: 'intermediate', label: 'Intermediate', emoji: '💪', color: '#0095f6' },
  { value: 'advanced', label: 'Advanced', emoji: '🔥', color: '#fd1d1d' },
  { value: 'pro', label: 'Pro', emoji: '👑', color: '#833ab4' },
];

const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  // BEGINNER
  { id: 'b-fullbody1', name: 'Full Body A', emoji: '🌱', level: 'beginner', description: 'Basic compound movements',
    exercises: [
      { name: 'Goblet Squats', sets: 3, reps: '12', weight: '' },
      { name: 'Dumbbell Bench Press', sets: 3, reps: '10', weight: '' },
      { name: 'Lat Pulldown', sets: 3, reps: '10', weight: '' },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', weight: '' },
      { name: 'Plank Hold', sets: 3, reps: '30 sec', weight: '' },
    ] },
  { id: 'b-fullbody2', name: 'Full Body B', emoji: '🌱', level: 'beginner', description: 'Alternate day routine',
    exercises: [
      { name: 'Leg Press', sets: 3, reps: '12', weight: '' },
      { name: 'Incline DB Press', sets: 3, reps: '10', weight: '' },
      { name: 'Seated Row', sets: 3, reps: '10', weight: '' },
      { name: 'Lateral Raises', sets: 3, reps: '12', weight: '' },
      { name: 'Bicep Curls', sets: 2, reps: '12', weight: '' },
      { name: 'Tricep Pushdowns', sets: 2, reps: '12', weight: '' },
    ] },
  { id: 'b-cardio', name: 'Cardio + Core', emoji: '🏃', level: 'beginner', description: 'Heart health & abs',
    exercises: [
      { name: 'Treadmill Walk (incline)', sets: 1, reps: '15 min', weight: '' },
      { name: 'Cycling', sets: 1, reps: '10 min', weight: '' },
      { name: 'Crunches', sets: 3, reps: '15', weight: '' },
      { name: 'Leg Raises', sets: 3, reps: '12', weight: '' },
      { name: 'Mountain Climbers', sets: 3, reps: '20', weight: '' },
    ] },
  // INTERMEDIATE
  { id: 'i-push', name: 'Push Day', emoji: '🫸', level: 'intermediate', description: 'Chest, Shoulders, Triceps',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: '8-10', weight: '' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: '' },
      { name: 'Overhead Press', sets: 4, reps: '8-10', weight: '' },
      { name: 'Lateral Raises', sets: 3, reps: '12-15', weight: '' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', weight: '' },
      { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', weight: '' },
    ] },
  { id: 'i-pull', name: 'Pull Day', emoji: '🫷', level: 'intermediate', description: 'Back, Biceps, Rear Delts',
    exercises: [
      { name: 'Barbell Row', sets: 4, reps: '8-10', weight: '' },
      { name: 'Lat Pulldown', sets: 4, reps: '10-12', weight: '' },
      { name: 'Seated Cable Row', sets: 3, reps: '10-12', weight: '' },
      { name: 'Face Pulls', sets: 3, reps: '15-20', weight: '' },
      { name: 'Barbell Curls', sets: 3, reps: '10-12', weight: '' },
      { name: 'Hammer Curls', sets: 3, reps: '10-12', weight: '' },
    ] },
  { id: 'i-legs', name: 'Leg Day', emoji: '🦵', level: 'intermediate', description: 'Quads, Hams, Glutes',
    exercises: [
      { name: 'Barbell Squats', sets: 4, reps: '8-10', weight: '' },
      { name: 'Romanian Deadlift', sets: 4, reps: '10-12', weight: '' },
      { name: 'Leg Press', sets: 3, reps: '12', weight: '' },
      { name: 'Walking Lunges', sets: 3, reps: '12 each', weight: '' },
      { name: 'Leg Curls', sets: 3, reps: '12-15', weight: '' },
      { name: 'Calf Raises', sets: 4, reps: '15-20', weight: '' },
    ] },

  // ADVANCED
  { id: 'a-push', name: 'Heavy Push', emoji: '🔥', level: 'advanced', description: 'Strength-focused pressing',
    exercises: [
      { name: 'Flat Barbell Bench (Heavy)', sets: 5, reps: '5', weight: '' },
      { name: 'Incline Barbell Press', sets: 4, reps: '6-8', weight: '' },
      { name: 'Weighted Dips', sets: 4, reps: '8-10', weight: '' },
      { name: 'Standing OHP', sets: 4, reps: '6-8', weight: '' },
      { name: 'Cable Flyes', sets: 3, reps: '12-15', weight: '' },
      { name: 'Lateral Raise (Drop Set)', sets: 3, reps: '12+8+6', weight: '' },
      { name: 'Close Grip Bench', sets: 3, reps: '8-10', weight: '' },
    ] },
  { id: 'a-pull', name: 'Heavy Pull', emoji: '🔥', level: 'advanced', description: 'Back thickness & width',
    exercises: [
      { name: 'Deadlift', sets: 5, reps: '5', weight: '' },
      { name: 'Weighted Pull-Ups', sets: 4, reps: '6-8', weight: '' },
      { name: 'Pendlay Row', sets: 4, reps: '6-8', weight: '' },
      { name: 'T-Bar Row', sets: 3, reps: '8-10', weight: '' },
      { name: 'Straight Arm Pulldown', sets: 3, reps: '12-15', weight: '' },
      { name: 'Barbell Curl (Heavy)', sets: 4, reps: '6-8', weight: '' },
      { name: 'Incline DB Curl', sets: 3, reps: '10-12', weight: '' },
    ] },
  { id: 'a-legs', name: 'Heavy Legs', emoji: '🔥', level: 'advanced', description: 'Squat & deadlift focused',
    exercises: [
      { name: 'Back Squat (Heavy)', sets: 5, reps: '5', weight: '' },
      { name: 'Front Squat', sets: 4, reps: '6-8', weight: '' },
      { name: 'Stiff Leg Deadlift', sets: 4, reps: '8-10', weight: '' },
      { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', weight: '' },
      { name: 'Hack Squat', sets: 3, reps: '10-12', weight: '' },
      { name: 'Seated Calf Raise', sets: 4, reps: '12-15', weight: '' },
      { name: 'Hanging Leg Raises', sets: 3, reps: '12-15', weight: '' },
    ] },
  // PRO
  { id: 'p-chest', name: 'Pro Chest Day', emoji: '👑', level: 'pro', description: 'Volume + intensity techniques',
    exercises: [
      { name: 'Flat Bench (Pause Reps)', sets: 5, reps: '3-5', weight: '' },
      { name: 'Incline DB Press (Slow Neg)', sets: 4, reps: '8-10', weight: '' },
      { name: 'Weighted Dips (Heavy)', sets: 4, reps: '6-8', weight: '' },
      { name: 'Cable Crossover (Peak)', sets: 4, reps: '12-15', weight: '' },
      { name: 'Machine Fly (Drop Set)', sets: 3, reps: '10+8+6', weight: '' },
      { name: 'Push-Up Burnout', sets: 2, reps: 'Failure', weight: '' },
    ] },
  { id: 'p-back', name: 'Pro Back Day', emoji: '👑', level: 'pro', description: 'Deadlift + high volume',
    exercises: [
      { name: 'Deadlift (Max Effort)', sets: 5, reps: '3', weight: '' },
      { name: 'Weighted Pull-Ups', sets: 5, reps: '5-8', weight: '' },
      { name: 'Barbell Row (Overhand)', sets: 4, reps: '6-8', weight: '' },
      { name: 'Chest Supported Row', sets: 4, reps: '10-12', weight: '' },
      { name: 'Meadows Row', sets: 3, reps: '10-12', weight: '' },
      { name: 'Rack Pulls', sets: 3, reps: '5-6', weight: '' },
      { name: 'Reverse Fly (Superset)', sets: 3, reps: '15', weight: '' },
    ] },
  { id: 'p-legs', name: 'Pro Leg Day', emoji: '👑', level: 'pro', description: 'Squat heavy + accessories',
    exercises: [
      { name: 'Back Squat (Max Effort)', sets: 5, reps: '3', weight: '' },
      { name: 'Pause Squat', sets: 3, reps: '5', weight: '' },
      { name: 'Leg Press (High Volume)', sets: 4, reps: '15-20', weight: '' },
      { name: 'Walking Lunges (Heavy)', sets: 4, reps: '12 each', weight: '' },
      { name: 'Nordic Hamstring Curl', sets: 3, reps: '6-8', weight: '' },
      { name: 'Leg Extension (Drop Set)', sets: 3, reps: '12+10+8', weight: '' },
      { name: 'Standing Calf (Heavy)', sets: 5, reps: '10-12', weight: '' },
    ] },
  { id: 'p-arms', name: 'Pro Arms', emoji: '👑', level: 'pro', description: 'Supersets & drop sets',
    exercises: [
      { name: 'Close Grip Bench', sets: 4, reps: '6-8', weight: '' },
      { name: 'Barbell Curl (Cheat)', sets: 4, reps: '6-8', weight: '' },
      { name: 'Skull Crushers SS Curl', sets: 4, reps: '10+10', weight: '' },
      { name: 'Preacher Curl (Slow)', sets: 3, reps: '10-12', weight: '' },
      { name: 'Overhead Ext (Rope)', sets: 3, reps: '12-15', weight: '' },
      { name: 'Hammer Curl (Drop Set)', sets: 3, reps: '10+8+6', weight: '' },
      { name: '21s Bicep Curl', sets: 2, reps: '21', weight: '' },
    ] },
];

const GYM_STORAGE_KEY = 'productivity_gym_workouts';
const GYM_TEMPLATES_KEY = 'productivity_gym_custom_templates';

interface GymWorkout { id: string; date: string; templateName: string; emoji: string; exercises: Exercise[]; }

function loadWorkouts(): GymWorkout[] { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem(GYM_STORAGE_KEY) || '[]'); } catch { return []; } }
function saveWorkouts(w: GymWorkout[]) { if (typeof window !== 'undefined') localStorage.setItem(GYM_STORAGE_KEY, JSON.stringify(w)); }
function loadCustomTemplates(): WorkoutTemplate[] { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem(GYM_TEMPLATES_KEY) || '[]'); } catch { return []; } }
function saveCustomTemplates(t: WorkoutTemplate[]) { if (typeof window !== 'undefined') localStorage.setItem(GYM_TEMPLATES_KEY, JSON.stringify(t)); }
function genId() { return Math.random().toString(36).substring(2) + Date.now().toString(36); }

export default function GymPage() {
  const [workouts, setWorkouts] = useState<GymWorkout[]>(loadWorkouts);
  const [customTemplates, setCustomTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<GymWorkout | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const { canUndo, saveSnapshot, undo } = useUndo();

  useEffect(() => { setCustomTemplates(loadCustomTemplates()); }, []);

  const allTemplates: WorkoutTemplate[] = (() => {
    const merged = DEFAULT_TEMPLATES.map(dt => customTemplates.find(c => c.id === dt.id) || dt);
    const extra = customTemplates.filter(c => !DEFAULT_TEMPLATES.some(d => d.id === c.id));
    return [...merged, ...extra];
  })();

  const filteredTemplates = selectedLevel === 'all' ? allTemplates : allTemplates.filter(t => t.level === selectedLevel);

  const persistTemplates = (t: WorkoutTemplate[]) => { setCustomTemplates(t); saveCustomTemplates(t); };

  const startWorkout = (t: WorkoutTemplate) => {
    setActiveWorkout({ id: genId(), date: format(new Date(), 'yyyy-MM-dd'), templateName: t.name, emoji: t.emoji, exercises: t.exercises.map(ex => ({ ...ex, id: genId(), done: false })) });
  };
  const toggleExercise = (id: string) => { if (!activeWorkout) return; setActiveWorkout({ ...activeWorkout, exercises: activeWorkout.exercises.map(ex => ex.id === id ? { ...ex, done: !ex.done } : ex) }); };
  const updateWeight = (id: string, w: string) => { if (!activeWorkout) return; setActiveWorkout({ ...activeWorkout, exercises: activeWorkout.exercises.map(ex => ex.id === id ? { ...ex, weight: w } : ex) }); };
  const finishWorkout = () => { if (!activeWorkout) return; saveSnapshot(); const u = [...workouts, activeWorkout]; setWorkouts(u); saveWorkouts(u); setActiveWorkout(null); };
  const deleteWorkout = (id: string) => { saveSnapshot(); const u = workouts.filter(w => w.id !== id); setWorkouts(u); saveWorkouts(u); };

  // Template editing
  const startEditTemplate = (t: WorkoutTemplate) => setEditingTemplate(JSON.parse(JSON.stringify(t)));
  const saveEditTemplate = () => { if (!editingTemplate) return; const u = customTemplates.some(c => c.id === editingTemplate.id) ? customTemplates.map(c => c.id === editingTemplate.id ? editingTemplate : c) : [...customTemplates, editingTemplate]; persistTemplates(u); setEditingTemplate(null); };
  const resetTemplate = (id: string) => { persistTemplates(customTemplates.filter(c => c.id !== id)); setEditingTemplate(null); };
  const createNewTemplate = () => setEditingTemplate({ id: genId(), name: 'My Workout', emoji: '💪', description: 'Custom', level: 'intermediate', exercises: [] });
  const addExerciseToEdit = () => { if (!editingTemplate) return; setEditingTemplate({ ...editingTemplate, exercises: [...editingTemplate.exercises, { name: '', sets: 3, reps: '10', weight: '' }] }); };
  const updateEditExercise = (i: number, f: string, v: string | number) => { if (!editingTemplate) return; const ex = [...editingTemplate.exercises]; ex[i] = { ...ex[i], [f]: v }; setEditingTemplate({ ...editingTemplate, exercises: ex }); };
  const removeEditExercise = (i: number) => { if (!editingTemplate) return; setEditingTemplate({ ...editingTemplate, exercises: editingTemplate.exercises.filter((_, idx) => idx !== i) }); };
  const deleteCustomTemplate = (id: string) => persistTemplates(customTemplates.filter(c => c.id !== id));

  const completedEx = activeWorkout?.exercises.filter(e => e.done).length || 0;
  const totalEx = activeWorkout?.exercises.length || 0;
  const progress = totalEx > 0 ? Math.round((completedEx / totalEx) * 100) : 0;

  // Active workout view
  if (activeWorkout) {
    return (
      <div className="max-w-[600px] mx-auto space-y-4">
        <div className="fb-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[28px]">{activeWorkout.emoji}</span>
              <div>
                <p className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{activeWorkout.templateName}</p>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{completedEx}/{totalEx} exercises</p>
              </div>
            </div>
            <button onClick={finishWorkout} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: 'var(--success)' }}>✓ Finish</button>
          </div>
          <div className="w-full h-[5px] rounded-full mt-3 overflow-hidden" style={{ background: 'var(--border-light)' }}>
            <div className="h-full rounded-full bg-[var(--success)] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="space-y-2">
          {activeWorkout.exercises.map((ex, i) => (
            <div key={ex.id} className={cn('fb-card flex items-center gap-3 p-4', ex.done && 'opacity-60')}>
              <button onClick={() => toggleExercise(ex.id)}
                className={cn('habit-check w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0',
                  ex.done ? 'text-white' : '')}
                style={ex.done ? { background: 'var(--success)' } : { background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                {ex.done ? '✓' : i + 1}
              </button>
              <div className="flex-1">
                <p className={cn('text-[14px] font-semibold', ex.done && 'line-through')} style={{ color: 'var(--text-primary)' }}>{ex.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{ex.sets} × {ex.reps}</p>
              </div>
              <input type="text" value={ex.weight} onChange={e => updateWeight(ex.id, e.target.value)} placeholder="kg"
                className="w-14 px-2 py-1.5 text-center text-[12px] rounded-lg outline-none" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }} />
            </div>
          ))}
        </div>
        <button onClick={() => setActiveWorkout(null)} className="w-full py-2 text-[13px]" style={{ color: 'var(--danger)' }}>Cancel Workout</button>
      </div>
    );
  }

  // Template editor
  if (editingTemplate) {
    return (
      <div className="max-w-[600px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Edit Workout</p>
          <button onClick={() => setEditingTemplate(null)} className="text-[13px] font-semibold" style={{ color: 'var(--accent)' }}>Cancel</button>
        </div>
        <Card>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" value={editingTemplate.emoji} onChange={e => setEditingTemplate({ ...editingTemplate, emoji: e.target.value })}
                className="w-12 py-2 text-center text-[18px] rounded-lg outline-none" style={{ background: 'var(--border-light)' }} maxLength={2} />
              <input type="text" value={editingTemplate.name} onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg text-[14px] outline-none" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }} />
            </div>
            <input type="text" value={editingTemplate.description} onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }} placeholder="Description" />
            <div className="flex gap-1.5">
              {LEVELS.map(l => (
                <button key={l.value} onClick={() => setEditingTemplate({ ...editingTemplate, level: l.value })}
                  className={cn('flex-1 py-2 rounded-lg text-[11px] font-bold', editingTemplate.level === l.value ? 'text-white' : '')}
                  style={editingTemplate.level === l.value ? { background: l.color } : { background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                  {l.emoji} {l.label}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 pt-2">
              {editingTemplate.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: 'var(--border-light)' }}>
                  <span className="text-[11px] font-bold w-5 text-center" style={{ color: 'var(--text-secondary)' }}>{i+1}</span>
                  <input type="text" value={ex.name} onChange={e => updateEditExercise(i, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 rounded text-[12px] outline-none" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} placeholder="Exercise" />
                  <input type="number" value={ex.sets} onChange={e => updateEditExercise(i, 'sets', parseInt(e.target.value)||0)}
                    className="w-10 px-1 py-1 text-center rounded text-[11px] outline-none" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>×</span>
                  <input type="text" value={ex.reps} onChange={e => updateEditExercise(i, 'reps', e.target.value)}
                    className="w-14 px-1 py-1 text-center rounded text-[11px] outline-none" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
                  <button onClick={() => removeEditExercise(i)} className="text-[12px] px-1" style={{ color: 'var(--danger)' }}>✕</button>
                </div>
              ))}
              <button onClick={addExerciseToEdit} className="w-full py-2 rounded-lg text-[12px] font-semibold border border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}>+ Add Exercise</button>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveEditTemplate} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: 'var(--accent)' }}>Save</button>
              {DEFAULT_TEMPLATES.some(d => d.id === editingTemplate.id) && (
                <button onClick={() => resetTemplate(editingTemplate.id)} className="px-4 py-2.5 rounded-lg text-[12px] font-semibold" style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}>Reset</button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main view
  return (
    <div className="max-w-[600px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold" style={{ color: 'var(--text-primary)' }}>Gym 💪</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Choose your level & workout</p>
        </div>
        <button onClick={createNewTemplate} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: 'var(--accent)' }}>+ Create</button>
      </div>

      {/* Level Filter - like Instagram story tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setSelectedLevel('all')}
          className={cn('px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap border', selectedLevel === 'all' ? 'text-white' : '')}
          style={selectedLevel === 'all' ? { background: 'var(--text-primary)', borderColor: 'var(--text-primary)' } : { borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          All
        </button>
        {LEVELS.map(l => (
          <button key={l.value} onClick={() => setSelectedLevel(l.value)}
            className={cn('px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap', selectedLevel === l.value ? 'text-white' : '')}
            style={selectedLevel === l.value ? { background: l.color } : { background: 'var(--border-light)', color: 'var(--text-primary)' }}>
            {l.emoji} {l.label}
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-3">
        {filteredTemplates.map(t => {
          const isCustom = customTemplates.some(c => c.id === t.id);
          const isUserCreated = !DEFAULT_TEMPLATES.some(d => d.id === t.id);
          const levelInfo = LEVELS.find(l => l.value === t.level);
          return (
            <div key={t.id} className="fb-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[22px]" style={{ background: 'var(--border-light)' }}>
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    {isCustom && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--border-light)', color: 'var(--accent)' }}>EDITED</span>}
                    {isUserCreated && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--border-light)', color: 'var(--success)' }}>CUSTOM</span>}
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{t.description} · {t.exercises.length} exercises</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: levelInfo?.color }}>{levelInfo?.emoji} {levelInfo?.label}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => startWorkout(t)} className="flex-1 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: 'var(--success)' }}>▶ Start</button>
                <button onClick={() => startEditTemplate(t)} className="flex-1 py-2 rounded-lg text-[12px] font-bold" style={{ background: 'var(--border-light)', color: 'var(--accent)' }}>✏️ Edit</button>
                {isUserCreated && <button onClick={() => deleteCustomTemplate(t.id)} className="px-3 py-2 rounded-lg text-[12px] font-bold" style={{ background: 'var(--border-light)', color: 'var(--danger)' }}>✕</button>}
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      <Card title="Recent Workouts" subtitle="Training log">
        {workouts.length === 0 ? (
          <p className="text-center py-8 text-[13px]" style={{ color: 'var(--text-secondary)' }}>No workouts yet. Start one above!</p>
        ) : (
          <div className="space-y-0 -mx-5">
            {[...workouts].reverse().slice(0, 8).map(w => {
              const d = w.exercises.filter(e => e.done).length;
              const t = w.exercises.length;
              return (
                <div key={w.id} className="flex items-center gap-3 px-5 py-3 border-t group" style={{ borderColor: 'var(--border-light)' }}>
                  <span className="text-[20px]">{w.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{w.templateName}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{format(new Date(w.date), 'MMM d')} · {d}/{t}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                    style={d === t ? { background: '#58c32220', color: 'var(--success)' } : { background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                    {d === t ? '✓' : `${Math.round((d/t)*100)}%`}
                  </span>
                  <button onClick={() => deleteWorkout(w.id)} className="opacity-0 group-hover:opacity-100 text-[14px]" style={{ color: 'var(--text-secondary)' }}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <UndoButton canUndo={canUndo} onUndo={undo} />
    </div>
  );
}
