'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, setUser, UserProfile } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'name'>('email');

  useEffect(() => {
    if (getUser()) {
      router.replace('/');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleEmailSubmit = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9.]+@gmail\.com$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid Gmail address (@gmail.com)');
      return;
    }
    setError('');
    setName(trimmed.split('@')[0].charAt(0).toUpperCase() + trimmed.split('@')[0].slice(1));
    setStep('name');
  };

  const handleLogin = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const user: UserProfile = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      picture: '',
      initial: name.trim()[0].toUpperCase(),
      loggedInAt: new Date().toISOString(),
    };

    setUser(user);
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-[360px] text-center space-y-6">
        {/* Logo */}
        <div>
          <h1 className="text-[32px] font-extrabold gradient-text">Clarity360</h1>
          <p className="text-[14px] mt-2" style={{ color: 'var(--text-secondary)' }}>
            Your complete productivity system
          </p>
        </div>

        {/* Login Card */}
        <div className="fb-card p-6 space-y-5">
          {step === 'email' ? (
            <>
              <div>
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>Sign in</h2>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Enter your Gmail to continue
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-3 rounded-lg text-[14px] outline-none"
                  style={{ background: 'var(--border-light)', color: 'var(--text-primary)', border: error ? '1px solid var(--danger)' : '1px solid var(--border)' }}
                  autoFocus
                />
                {error && <p className="text-[12px] text-left" style={{ color: 'var(--danger)' }}>{error}</p>}
                <button
                  onClick={handleEmailSubmit}
                  className="w-full py-3 rounded-lg text-[14px] font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--text-primary)' }}>What should we call you?</h2>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {email}
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg text-[14px] outline-none"
                  style={{ background: 'var(--border-light)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  autoFocus
                />
                {error && <p className="text-[12px] text-left" style={{ color: 'var(--danger)' }}>{error}</p>}
                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-lg text-[14px] font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  Let&apos;s Go 🚀
                </button>
                <button
                  onClick={() => setStep('email')}
                  className="w-full py-2 text-[13px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          Only Gmail accounts supported · Data stored on your device
        </p>
      </div>
    </div>
  );
}
