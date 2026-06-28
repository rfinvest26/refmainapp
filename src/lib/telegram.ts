// Thin wrapper around the official `telegram-web-app.js` global (loaded via a
// <script> tag in index.html — no SDK package needed for what this app uses).

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  section_bg_color?: string;
}

interface TelegramHapticFeedback {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TelegramWebApp {
  initData: string;
  themeParams: TelegramThemeParams;
  colorScheme: 'light' | 'dark';
  HapticFeedback: TelegramHapticFeedback;
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  onEvent: (event: 'themeChanged' | string, handler: () => void) => void;
  openTelegramLink: (url: string) => void;
  isVersionAtLeast: (version: string) => boolean;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

/** Matches the bot's secondary-bg so the native header/bottom bars blend with our cards instead of defaulting to Telegram's own chrome color. */
function syncChromeColors(): void {
  const app = getWebApp();
  if (!app) return;
  const bg = app.themeParams.secondary_bg_color ?? app.themeParams.bg_color;
  if (!bg) return;
  app.setHeaderColor(bg);
  app.setBottomBarColor(bg);
  app.setBackgroundColor(app.themeParams.bg_color ?? bg);
}

/** Call once on app boot: signals readiness, expands to full height, themes the native chrome. */
export function initTelegramWebApp(): void {
  const app = getWebApp();
  if (!app) return;
  app.ready();
  app.expand();
  syncChromeColors();
  app.onEvent('themeChanged', syncChromeColors);
}

/** Raw initData string to send to the backend for verification on every request. */
export function getInitData(): string {
  return getWebApp()?.initData ?? '';
}

/** True when running outside Telegram (e.g. a plain browser during development). */
export function isOutsideTelegram(): boolean {
  return !getInitData();
}

/** Opens a t.me link via Telegram's own navigation (falls back to a normal link outside Telegram). */
export function openBotLink(url: string): void {
  const app = getWebApp();
  if (app) app.openTelegramLink(url);
  else window.open(url, '_blank');
}

// HapticFeedback needs Bot API 6.1+ — older clients (and the in-app log noisily
// warns rather than silently no-op-ing), so feature-detect before calling it.
function supportsHaptics(app: TelegramWebApp): boolean {
  return app.isVersionAtLeast('6.1');
}

/** Light tap feedback for buttons — no-op outside Telegram or on old clients. */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  const app = getWebApp();
  if (app && supportsHaptics(app)) app.HapticFeedback.impactOccurred(style);
}

export function hapticNotify(type: 'error' | 'success' | 'warning'): void {
  const app = getWebApp();
  if (app && supportsHaptics(app)) app.HapticFeedback.notificationOccurred(type);
}
