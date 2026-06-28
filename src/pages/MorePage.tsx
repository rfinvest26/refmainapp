import { Card } from '@/components/Card';
import { openBotLink, haptic, isOutsideTelegram } from '@/lib/telegram';
import { refBotMenuLink } from '@/lib/links';
import { clearManualUserId, getManualUserId } from '@/lib/manualAuth';

function ActionRow({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      onClick={() => {
        haptic('light');
        onClick();
      }}
      className="flex w-full items-center justify-between py-3 text-left active:opacity-60 transition-opacity"
    >
      <span>{title}</span>
      <span className="text-tg-hint">→</span>
    </button>
  );
}

export function MorePage() {
  const showManualLogout = isOutsideTelegram() && Boolean(getManualUserId());

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <div className="mb-1 text-sm font-semibold">Условия программы</div>
        <p className="text-sm text-tg-hint">
          Лид засчитывается после одобрения анкеты администратором. Вывод доступен после минимального числа
          одобренных лидов и минимальной суммы баланса — точные условия смотри в боте, в разделе «Условия».
        </p>
      </Card>

      <Card className="divide-y divide-white/5">
        <ActionRow title="Открыть вывод в боте" onClick={() => openBotLink(refBotMenuLink())} />
        <ActionRow title="Открыть чат" onClick={() => openBotLink(refBotMenuLink())} />
        <ActionRow title="Открыть меню бота" onClick={() => openBotLink(refBotMenuLink())} />
      </Card>

      {showManualLogout && (
        <Card>
          <ActionRow
            title="Выйти (сменить Telegram ID)"
            onClick={() => {
              clearManualUserId();
              window.location.reload();
            }}
          />
        </Card>
      )}
    </div>
  );
}
