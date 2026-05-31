'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useInitializeStore } from '@/hooks/useStore';
import { shouldAutoBackup, sendBackupToEmail, getBackupEmail } from '@/lib/backup';
import { getUser } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialized = useInitializeStore();
  const router = useRouter();

  // Auth check
  useEffect(() => {
    if (!getUser()) {
      router.replace('/login');
    }
  }, [router]);

  // Auto-backup when online
  useEffect(() => {
    const tryBackup = () => {
      if (shouldAutoBackup()) {
        const email = getBackupEmail();
        if (email) sendBackupToEmail(email);
      }
    };

    if (navigator.onLine) tryBackup();
    window.addEventListener('online', tryBackup);
    return () => window.removeEventListener('online', tryBackup);
  }, []);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:ml-[245px]">
        <Header />
        <main className="p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
