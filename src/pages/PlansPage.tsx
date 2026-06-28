import { fetchPlans } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { Card, StatRow } from '@/components/Card';
import { LoadingView, ErrorView } from '@/components/StateView';
import { openBotLink, haptic } from '@/lib/telegram';
import { refBotMenuLink } from '@/lib/links';

export function PlansPage() {
  const state = useApiData(fetchPlans);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView reason={state.reason} />;

  const { data } = state;

  return (
    <div className="flex flex-col gap-4 p-4">
      {data.plans.map((plan) => {
        const isCurrent = plan.id === data.current_plan_id;
        return (
          <Card key={plan.id} className={isCurrent ? 'ring-2 ring-tg-link' : ''}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-lg font-semibold">{plan.name}</span>
              {isCurrent && <span className="rounded-full bg-tg-link/20 px-2 py-0.5 text-xs text-tg-link">Текущий</span>}
            </div>
            <StatRow label="За лида" value={`$${plan.lead_price_usd.toFixed(2)}`} />
            <StatRow label="% профита (1 ур.)" value={`${plan.profit_pct_l1}%`} />
            <StatRow label="% профита (2 ур.)" value={`${plan.profit_pct_l2}%`} />
            {!isCurrent && (
              <button
                className="mt-3 w-full rounded-xl bg-tg-button py-2.5 font-medium text-tg-button-text active:scale-95 transition-transform"
                onClick={() => {
                  haptic('light');
                  openBotLink(refBotMenuLink());
                }}
              >
                Выбрать в боте
              </button>
            )}
          </Card>
        );
      })}
      <p className="px-2 text-center text-xs text-tg-hint">
        Смена тарифа применяется только к новым лидам и профиту — начисленное ранее не пересчитывается.
      </p>
    </div>
  );
}
