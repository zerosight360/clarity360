'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/Card';
import { getBackupEmail, setBackupEmail, getLastBackup, sendBackupToEmail, downloadBackup, restoreData, shouldAutoBackup } from '@/lib/backup';
import { useTheme } from '@/hooks/useStore';
import { getUser, logout, setUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [lastBackup, setLastBackupState] = useState('');
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [user, setUserState] = useState(getUser());
  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [restored, setRestored] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmail(getBackupEmail());
    setLastBackupState(getLastBackup());
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto backup when coming online
      if (shouldAutoBackup()) {
        const e = getBackupEmail();
        if (e) sendBackupToEmail(e);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveEmail = () => {
    setBackupEmail(email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBackupNow = () => {
    if (!email) return;
    sendBackupToEmail(email);
    setLastBackupState(new Date().toISOString());
  };

  const handleDownload = () => {
    downloadBackup();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        restoreData(data);
        setRestored(true);
        setTimeout(() => {
          setRestored(false);
          window.location.reload();
        }, 1500);
      } catch {
        alert('Invalid backup file. Please use a Clarity360 JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-4">
      {/* Profile Header */}
      <div className="fb-card p-5">
        <div className="flex items-center gap-4">
          {user?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-[24px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
              {user?.initial || 'U'}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-[18px] font-extrabold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</h1>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{user?.email || ''}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <button onClick={() => { setEditingProfile(true); setNewName(user?.name || ''); setNewEmail(user?.email || ''); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ border: '1px solid var(--border)', color: 'var(--accent)' }}>
              Edit
            </button>
            <button onClick={() => { logout(); router.replace('/login'); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ border: '1px solid var(--border)', color: 'var(--danger)' }}>
              Logout
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {editingProfile && (
          <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-[14px] outline-none"
                style={{ background: 'var(--border-light)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Gmail</label>
              <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); setProfileError(''); }}
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-[14px] outline-none"
                style={{ background: 'var(--border-light)', color: 'var(--text-primary)', border: profileError ? '1px solid var(--danger)' : '1px solid var(--border)' }} />
              {profileError && <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{profileError}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                if (!newName.trim()) { setProfileError('Name is required'); return; }
                if (!newEmail.trim().endsWith('@gmail.com')) { setProfileError('Must be a Gmail address'); return; }
                const updated = { ...user!, name: newName.trim(), email: newEmail.trim().toLowerCase(), initial: newName.trim()[0].toUpperCase() };
                setUser(updated);
                setUserState(updated);
                setEditingProfile(false);
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 2000);
              }}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
                {profileSaved ? '✓ Saved!' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingProfile(false)}
                className="px-4 py-2.5 rounded-lg text-[13px] font-semibold" style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {profileSaved && !editingProfile && (
          <p className="mt-3 text-[12px] text-center font-semibold" style={{ color: 'var(--success)' }}>✓ Profile updated!</p>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="fb-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[20px]">{theme === 'dark' ? '🌙' : '☀️'}</span>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{theme === 'dark' ? 'On' : 'Off'}</p>
            </div>
          </div>
          <button onClick={toggleTheme}
            className="w-12 h-7 rounded-full relative transition-all"
            style={{ background: theme === 'dark' ? 'var(--accent)' : 'var(--border)' }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all"
              style={{ left: theme === 'dark' ? '26px' : '4px' }} />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="fb-card p-4 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
        <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isOnline ? 'Online' : 'Offline'}
        </p>
        <p className="text-[12px] ml-auto" style={{ color: 'var(--text-secondary)' }}>
          {isOnline ? 'Data will sync to email' : 'Saved locally, syncs when online'}
        </p>
      </div>

      {/* Email Setup */}
      <Card title="Backup Email" subtitle="Your data will be sent here when you're online">
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg text-[14px] outline-none"
            style={{ background: 'var(--border-light)', color: 'var(--text-primary)' }}
          />
          <button onClick={handleSaveEmail}
            className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white"
            style={{ background: 'var(--accent)' }}>
            {saved ? '✓ Saved!' : 'Save Email'}
          </button>
          {lastBackup && (
            <p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>
              Last backup: {format(new Date(lastBackup), 'MMM d, yyyy h:mm a')}
            </p>
          )}
        </div>
      </Card>

      {/* Backup Actions */}
      <Card title="Backup & Restore">
        <div className="space-y-3">
          <button onClick={handleBackupNow} disabled={!email}
            className="w-full flex items-center gap-3 p-3.5 rounded-lg hover:bg-[var(--border-light)] transition-all disabled:opacity-40"
            style={{ border: '1px solid var(--border)' }}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ background: 'var(--border-light)' }}>📧</span>
            <div className="text-left">
              <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Send to Email</p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Download backup + open email to send</p>
            </div>
          </button>

          <button onClick={handleDownload}
            className="w-full flex items-center gap-3 p-3.5 rounded-lg hover:bg-[var(--border-light)] transition-all"
            style={{ border: '1px solid var(--border)' }}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ background: 'var(--border-light)' }}>💾</span>
            <div className="text-left">
              <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Download Backup</p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Save JSON file to your device</p>
            </div>
          </button>

          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center gap-3 p-3.5 rounded-lg hover:bg-[var(--border-light)] transition-all"
            style={{ border: '1px solid var(--border)' }}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-[18px]" style={{ background: 'var(--border-light)' }}>📂</span>
            <div className="text-left">
              <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Import Backup</p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Restore from a JSON backup file</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

          {restored && (
            <p className="text-center text-[13px] font-semibold" style={{ color: 'var(--success)' }}>
              ✓ Data restored! Reloading...
            </p>
          )}
        </div>
      </Card>

      {/* How it works */}
      <Card title="How Backup Works">
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-2">
            <span className="text-[16px]">1️⃣</span>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>All your data is stored locally on this device</p>
          </div>
          <div className="flex items-start gap-3 p-2">
            <span className="text-[16px]">2️⃣</span>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>When you go online, backup is sent to your email (every 24hrs)</p>
          </div>
          <div className="flex items-start gap-3 p-2">
            <span className="text-[16px]">3️⃣</span>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>To restore on a new device: open the JSON file from your email and import it here</p>
          </div>
          <div className="flex items-start gap-3 p-2">
            <span className="text-[16px]">💡</span>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Tip: You can also manually download backups anytime as a safety net</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
