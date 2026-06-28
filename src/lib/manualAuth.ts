// Browser-only fallback identity (no Telegram initData available). Deliberately
// unverified — see the warning in IdLoginPage and supabase/functions/ref-miniapp.
const STORAGE_KEY = 'void_manual_telegram_id';

export function getManualUserId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

export function setManualUserId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id.trim());
}

export function clearManualUserId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
