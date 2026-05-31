// Backup system: stores data locally, syncs to email when online

const BACKUP_EMAIL_KEY = 'productivity_backup_email';
const LAST_BACKUP_KEY = 'productivity_last_backup';

export function getBackupEmail(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(BACKUP_EMAIL_KEY) || '';
}

export function setBackupEmail(email: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BACKUP_EMAIL_KEY, email);
}

export function getLastBackup(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LAST_BACKUP_KEY) || '';
}

function setLastBackup() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

// Collect all app data into one JSON object
export function getAllData(): object {
  if (typeof window === 'undefined') return {};
  const keys = [
    'productivity_daily_entries',
    'productivity_weekly_entries',
    'productivity_monthly_entries',
    'productivity_habit_challenges',
    'productivity_quotes',
    'productivity_photos',
    'productivity_theme',
    'productivity_gym_workouts',
    'productivity_gym_custom_templates',
    'productivity_custom_templates',
    'productivity_life_goals_v2',
    'productivity_streak_challenges',
  ];

  const data: Record<string, unknown> = {};
  keys.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      try { data[key] = JSON.parse(val); } catch { data[key] = val; }
    }
  });
  data._exportedAt = new Date().toISOString();
  data._version = '1.0';
  return data;
}

// Restore data from a backup JSON (with validation)
const ALLOWED_KEYS = [
  'productivity_daily_entries',
  'productivity_weekly_entries',
  'productivity_monthly_entries',
  'productivity_habit_challenges',
  'productivity_quotes',
  'productivity_photos',
  'productivity_theme',
  'productivity_gym_workouts',
  'productivity_gym_custom_templates',
  'productivity_custom_templates',
  'productivity_life_goals_v2',
  'productivity_streak_challenges',
];

export function restoreData(data: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('_')) return;
    if (!ALLOWED_KEYS.includes(key)) return; // only allow known keys
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  });
}

// Send backup to email using mailto (opens email client with data)
// For a production app you'd use an API like SendGrid/Resend
export function sendBackupToEmail(email: string): boolean {
  if (!email) return false;

  const data = getAllData();
  const jsonStr = JSON.stringify(data, null, 2);

  // Create a downloadable file as well
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Download the backup file
  const a = document.createElement('a');
  a.href = url;
  a.download = `clarity360-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Open email client with instructions
  const subject = encodeURIComponent(`Clarity360 Backup - ${new Date().toLocaleDateString()}`);
  const body = encodeURIComponent(
    `Hi,\n\nYour Clarity360 data backup has been downloaded as a JSON file.\n\nTo restore: Go to Clarity360 > Settings > Import Backup and upload the JSON file.\n\nBackup date: ${new Date().toLocaleString()}\nEntries: ${Object.keys(data).length - 2} data keys\n\nAttach the downloaded JSON file to this email for safekeeping.\n\n— Clarity360`
  );

  window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  setLastBackup();
  return true;
}

// Auto-backup: check if online and backup is due (every 24hrs)
export function shouldAutoBackup(): boolean {
  const email = getBackupEmail();
  if (!email) return false;
  if (!navigator.onLine) return false;

  const last = getLastBackup();
  if (!last) return true;

  const hoursSince = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60);
  return hoursSince >= 24;
}

// Download backup as file (manual)
export function downloadBackup() {
  const data = getAllData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clarity360-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
