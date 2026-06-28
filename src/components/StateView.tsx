import type { ApiErrorReason } from '@/lib/api';
import { refBotMenuLink } from '@/lib/links';
import { openBotLink, haptic } from '@/lib/telegram';
import { PageSkeleton } from '@/components/Skeleton';

export function LoadingView() {
  return <PageSkeleton />;
}

export function ErrorView({ reason }: { reason: ApiErrorReason }) {
  if (reason === 'not_a_partner') {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <p className="text-tg-text">Ты ещё не зарегистрирован как партнёр.</p>
        <p className="text-sm text-tg-hint">Нажми /start в боте, чтобы получить свою реферальную ссылку — после этого кабинет покажет твою статистику.</p>
        <button
          className="mt-2 rounded-xl bg-tg-button px-5 py-2.5 font-medium text-tg-button-text active:scale-95 transition-transform"
          onClick={() => {
            haptic('light');
            openBotLink(refBotMenuLink());
          }}
        >
          Открыть бота
        </button>
      </div>
    );
  }
  if (reason === 'unauthorized') {
    return (
      <div className="px-6 py-12 text-center text-tg-hint">
        Не удалось подтвердить вход через Telegram. Открой кабинет заново из бота.
      </div>
    );
  }
  return (
    <div className="px-6 py-12 text-center text-tg-hint">
      Не удалось загрузить данные. Попробуй ещё раз чуть позже.
    </div>
  );
}
