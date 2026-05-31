'use client';

interface UndoButtonProps {
  canUndo: boolean;
  onUndo: () => void;
}

export default function UndoButton({ canUndo, onUndo }: UndoButtonProps) {
  if (!canUndo) return null;

  return (
    <button
      onClick={onUndo}
      className="fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
      style={{ background: 'var(--accent)' }}
      aria-label="Undo"
    >
      ↩ Undo
    </button>
  );
}
