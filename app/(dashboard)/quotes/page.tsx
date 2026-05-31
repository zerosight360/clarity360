'use client';

import { useState, useRef } from 'react';
import { useProductivityStore } from '@/lib/store';
import Card from '@/components/Card';

const DEFAULT_QUOTES = [
  // Virat Kohli
  { text: 'Self-belief and hard work will always earn you success.', author: 'Virat Kohli' },
  { text: 'I don\'t need to prove anything to anyone. I only need to follow my heart and concentrate on what I want to do.', author: 'Virat Kohli' },
  { text: 'If you don\'t back yourself, no one else will. You have to be your own biggest believer.', author: 'Virat Kohli' },
  { text: 'I let my bat do the talking. Silence is the best answer to all the critics.', author: 'Virat Kohli' },
  // Bruce Lee
  { text: 'Do not pray for an easy life, pray for the strength to endure a difficult one.', author: 'Bruce Lee' },
  { text: 'I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.', author: 'Bruce Lee' },
  { text: 'Be water, my friend. Empty your mind. Be formless, shapeless — like water.', author: 'Bruce Lee' },
  { text: 'Defeat is a state of mind; no one is ever defeated until defeat has been accepted as a reality.', author: 'Bruce Lee' },
  { text: 'The successful warrior is the average man, with laser-like focus.', author: 'Bruce Lee' },
  // AB de Villiers
  { text: 'If you want to be the best, you have to do things that other people aren\'t willing to do.', author: 'AB de Villiers' },
  { text: 'I believe in playing with freedom. When you free your mind, your body follows.', author: 'AB de Villiers' },
  { text: 'Pressure is a privilege. It means you\'re doing something that matters.', author: 'AB de Villiers' },
  { text: 'The moment you start thinking about what people expect, you lose your natural game.', author: 'AB de Villiers' },
  // Classics
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'We are what we repeatedly do. Excellence is not an act, but a habit.', author: 'Aristotle' },
];

export default function QuotesPage() {
  const { quotes, photos, addQuote, removeQuote, addPhoto, removePhoto } = useProductivityStore();
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [tab, setTab] = useState<'quotes' | 'photos'>('quotes');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddQuote = () => {
    if (!newQuote.trim()) return;
    addQuote(newQuote.trim(), newAuthor.trim() || 'Me');
    setNewQuote('');
    setNewAuthor('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max file size is 2MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Only image files allowed'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (!url.startsWith('data:image/')) return; // extra safety
      addPhoto(url, caption || 'My motivation');
      setCaption('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const allQuotes = [...DEFAULT_QUOTES.map((q, i) => ({ ...q, id: `default-${i}`, createdAt: '' })), ...quotes];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Motivation Wall</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">Your quotes and vision board</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit">
        <button
          onClick={() => setTab('quotes')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'quotes'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          ✨ Quotes
        </button>
        <button
          onClick={() => setTab('photos')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'photos'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          📸 Vision Board
        </button>
      </div>

      {tab === 'quotes' && (
        <div className="space-y-6">
          {/* Add Quote */}
          <Card>
            <div className="space-y-3">
              <textarea
                value={newQuote}
                onChange={e => setNewQuote(e.target.value)}
                placeholder="Write a motivational quote..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  placeholder="Author (optional)"
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  onClick={handleAddQuote}
                  disabled={!newQuote.trim()}
                  className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Save Quote
                </button>
              </div>
            </div>
          </Card>

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allQuotes.map((quote) => (
              <div
                key={quote.id}
                className="relative group p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/30"
              >
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed italic">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
                  — {quote.author}
                </p>
                {!quote.id.startsWith('default-') && (
                  <button
                    onClick={() => removeQuote(quote.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
                    aria-label="Remove quote"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'photos' && (
        <div className="space-y-6">
          {/* Upload Photo */}
          <Card>
            <div className="space-y-3">
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Caption for your photo..."
                className="w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors text-sm font-medium"
              >
                📸 Tap to upload a photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </Card>

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🖼️</p>
                <p className="text-gray-500 dark:text-gray-400">No photos yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload motivational images for your vision board.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-xs font-medium">{photo.caption}</p>
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-opacity"
                    aria-label="Remove photo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
