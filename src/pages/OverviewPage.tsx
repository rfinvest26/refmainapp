import { useNavigate } from 'react-router-dom';
import { fetchOverview } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { Card, StatRow } from '@/components/Card';
import { LoadingView, ErrorView } from '@/components/StateView';
import { openBotLink, haptic } from '@/lib/telegram';
import { refBotMenuLink } from '@/lib/links';

const money = (n: number) => `$${n.toFixed(2)}`;
const BTN = 'active:scale-95 transition-transform';

export function OverviewPage() {
  const state = useApiData(fetchOverview);
  const navigate = useNavigate();

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView reason={state.reason} />;

  const { data } = state;
  const go = (path: string) => {
    haptic('light');
    navigate(path);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <StatRow label="Баланс" value={money(data.balance_usd)} />
        <StatRow label="Всего заработано" value={money(data.total_earned_usd)} />
        <StatRow label="Одобренных лидов" value={data.approved_leads_count} />
        <StatRow label="В ожидании" value={data.pending_leads_count} />
      </Card>

      <Card>
        <div className="mb-2 text-sm text-tg-hint">Текущий тариф</div>
        {data.plan ? (
          <>
            <div className="mb-2 text-lg font-semibold">{data.plan.name}</div>
            <StatRow label="За лида" value={money(data.plan.lead_price_usd)} />
            <StatRow label="% профита (1 ур.)" value={`${data.plan.profit_pct_l1}%`} />
            <StatRow label="% профита (2 ур.)" value={`${data.plan.profit_pct_l2}%`} />
          </>
        ) : (
          <div className="text-tg-hint">Тариф не назначен</div>
        )}
        <button className={`mt-3 w-full rounded-xl bg-tg-button py-2.5 font-medium text-tg-button-text ${BTN}`} onClick={() => go('/plans')}>
          Сравнить тарифы
        </button>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-tg-hint">Динамика лидов</span>
          <button className="text-sm text-tg-link" onClick={() => go('/analytics')}>
            Аналитика →
          </button>
        </div>
        <StatRow label="Сегодня" value={data.leads_today} />
        <StatRow label="7 дней" value={data.leads_7d} />
        <StatRow label="30 дней" value={data.leads_30d} />
      </Card>

      {data.best_campaign && (
        <Card>
          <div className="mb-1 text-sm text-tg-hint">Лучшая кампания</div>
          <div className="text-lg font-semibold">{data.best_campaign.label}</div>
          <div className="text-sm text-tg-hint">{data.best_campaign.approved} одобренных лидов</div>
        </Card>
      )}

      <div className="flex gap-3">
        <button className={`flex-1 rounded-xl bg-tg-secondary-bg py-2.5 font-medium ${BTN}`} onClick={() => go('/links')}>
          Все ссылки
        </button>
        <button
          className={`flex-1 rounded-xl bg-tg-secondary-bg py-2.5 font-medium ${BTN}`}
          onClick={() => {
            haptic('light');
            openBotLink(refBotMenuLink());
          }}
        >
          Открыть бота
        </button>
      </div>
    </div>
  );
}
