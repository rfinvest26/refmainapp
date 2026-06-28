import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchAnalytics } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { Card, StatRow } from '@/components/Card';
import { LoadingView, ErrorView } from '@/components/StateView';
import { haptic } from '@/lib/telegram';

const PERIODS = [7, 30, 90] as const;
type Period = (typeof PERIODS)[number];

const money = (n: number) => `$${n.toFixed(2)}`;
const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return current > 0 ? <span className="text-emerald-400">новое</span> : null;
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return <span className={positive ? 'text-emerald-400' : 'text-red-400'}>{positive ? '+' : ''}{pct.toFixed(0)}%</span>;
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>(30);
  const state = useApiData(() => fetchAnalytics(period), [period]);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView reason={state.reason} />;

  const { data } = state;
  const chartData = data.daily.map((d) => ({
    ...d,
    label: dayLabel(d.date),
    earned_total: d.earned_pct_share + d.earned_fixed_est,
  }));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => {
              haptic('light');
              setPeriod(p);
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              p === period ? 'bg-tg-button text-tg-button-text' : 'bg-tg-secondary-bg text-tg-hint'
            }`}
          >
            {p}д
          </button>
        ))}
      </div>

      <Card>
        <div className="mb-2 text-sm font-semibold">Лиды и одобрения</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-tg-hint)' }} interval={Math.floor(chartData.length / 6)} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-tg-hint)' }} allowDecimals={false} width={28} />
            <Tooltip contentStyle={{ background: 'var(--color-tg-bg)', border: 'none', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="leads" name="Лиды" stroke="var(--color-tg-hint)" fill="var(--color-tg-hint)" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="approved" name="Одобрено" stroke="var(--color-tg-link)" fill="var(--color-tg-link)" fillOpacity={0.25} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="mb-1 text-sm font-semibold">Доход по дням</div>
        <div className="mb-2 text-xs text-tg-hint">% от профита — точно, фикса за лида — оценка по текущему тарифу</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-tg-hint)' }} interval={Math.floor(chartData.length / 6)} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-tg-hint)' }} width={28} />
            <Tooltip
              contentStyle={{ background: 'var(--color-tg-bg)', border: 'none', borderRadius: 8, fontSize: 12 }}
              formatter={(value) => money(Number(value))}
            />
            <Bar dataKey="earned_pct_share" name="% профита" stackId="earn" fill="var(--color-tg-link)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="earned_fixed_est" name="≈ фикса" stackId="earn" fill="var(--color-tg-hint)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="mb-2 text-sm font-semibold">За период vs предыдущий</div>
        <StatRow label="Лиды" value={<>{data.period.leads} <Delta current={data.period.leads} previous={data.previous_period.leads} /></>} />
        <StatRow label="Одобрено" value={<>{data.period.approved} <Delta current={data.period.approved} previous={data.previous_period.approved} /></>} />
        <StatRow label="Отклонено" value={<>{data.period.rejected} <Delta current={data.period.rejected} previous={data.previous_period.rejected} /></>} />
        <StatRow
          label="Доход (% профита)"
          value={<>{money(data.period.earned_pct_share)} <Delta current={data.period.earned_pct_share} previous={data.previous_period.earned_pct_share} /></>}
        />
        <StatRow label="Клики (всего, по кампаниям)" value={data.total_clicks_alltime} />
      </Card>

      {data.top_campaigns.length > 0 && (
        <Card>
          <div className="mb-2 text-sm font-semibold">Топ кампаний</div>
          {data.top_campaigns.map((c) => (
            <StatRow key={c.slug} label={c.label} value={`${c.approved} одобр. · ${c.clicks} клик.`} />
          ))}
        </Card>
      )}

      <Card>
        <div className="mb-2 text-sm font-semibold">Обычные лиды vs супер-офферы</div>
        <StatRow label="🔥 Через супер-офферы" value={`${data.offer_breakdown.via_offer.approved} / ${data.offer_breakdown.via_offer.total}`} />
        <StatRow label="Обычные" value={`${data.offer_breakdown.regular.approved} / ${data.offer_breakdown.regular.total}`} />
        <div className="mt-1 text-xs text-tg-hint">одобрено / всего лидов</div>
      </Card>
    </div>
  );
}
