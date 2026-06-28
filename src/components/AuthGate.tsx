import { useState, type ReactNode } from 'react';
import { isOutsideTelegram } from '@/lib/telegram';
import { getManualUserId, setManualUserId } from '@/lib/manualAuth';

/**
 * Inside Telegram, initData is always present — nothing to gate, render children.
 * Outside Telegram (plain browser), there is no verified identity at all. Per an
 * explicit, informed decision by the project owner, this app allows typing a raw
 * Telegram ID with NO verification as a fallback — see the warning copy below and
 * the matching warning in supabase/functions/ref-miniapp/index.ts.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [manualId, setLocalManualId] = useState(getManualUserId());

  if (!isOutsideTelegram() || manualId) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">VOID Partners</h1>
      <p className="text-sm text-tg-hint">
        Это окно открыто не из Telegram, поэтому вход не подтверждён автоматически. Введи свой Telegram ID, чтобы
        посмотреть кабинет.
      </p>
      <p className="text-xs text-amber-500">
        ⚠️ Это небезопасный режим: данные покажутся любому, кто введёт этот ID. Используй только для себя и не делись
        этой ссылкой.
      </p>
      <form
        className="flex w-full max-w-xs flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const id = new FormData(e.currentTarget).get('id');
          const value = String(id ?? '').trim();
          if (!/^\d+$/.test(value)) return;
          setManualUserId(value);
          setLocalManualId(value);
        }}
      >
        <input
          name="id"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Например: 123456789"
          className="rounded-xl bg-tg-secondary-bg px-4 py-3 text-center text-tg-text outline-none"
        />
        <button type="submit" className="rounded-xl bg-tg-button py-3 font-medium text-tg-button-text">
          Войти
        </button>
      </form>
    </div>
  );
}
