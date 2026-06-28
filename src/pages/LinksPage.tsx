import { fetchLinks } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { Card } from '@/components/Card';
import { LoadingView, ErrorView } from '@/components/StateView';
import { CopyButton } from '@/components/CopyButton';
import { mainPartnerLink, subPartnerLink, campaignLink, clanOfferLink, refBotMenuLink } from '@/lib/links';
import { openBotLink } from '@/lib/telegram';

function LinkRow({ title, url }: { title: string; url: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <div className="text-sm text-tg-hint">{title}</div>
        <div className="truncate text-sm">{url}</div>
      </div>
      <CopyButton value={url} />
    </div>
  );
}

export function LinksPage() {
  const state = useApiData(fetchLinks);

  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorView reason={state.reason} />;

  const { data } = state;

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card>
        <div className="mb-1 text-sm font-semibold">Основные</div>
        <LinkRow title="Ссылка в проект" url={mainPartnerLink(data.ref_code)} />
        <LinkRow title="Пригласить партнёра (2-й уровень)" url={subPartnerLink(data.ref_code)} />
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold">Кампании</span>
          <button className="text-sm text-tg-link" onClick={() => openBotLink(refBotMenuLink())}>
            Создать →
          </button>
        </div>
        {data.campaigns.length === 0 ? (
          <div className="py-2 text-sm text-tg-hint">Пока нет кампаний — создай в боте, чтобы метить трафик по источникам.</div>
        ) : (
          data.campaigns.map((c) => (
            <div key={c.slug} className="border-t border-white/5 py-2 first:border-0">
              <LinkRow title={c.label} url={campaignLink(data.ref_code, c.slug)} />
              <div className="text-xs text-tg-hint">
                Клики: {c.clicks} · Лиды: {c.leads} · Одобрено: {c.approved}
                {c.clicks > 0 && ` · CR: ${((c.approved / c.clicks) * 100).toFixed(1)}%`}
              </div>
            </div>
          ))
        )}
      </Card>

      {data.clan_offers.length > 0 && (
        <Card>
          <div className="mb-1 text-sm font-semibold">🔥 Супер-офферы</div>
          {data.clan_offers.map((o) => (
            <LinkRow key={o.team_id} title={`${o.team_name} · $${o.lead_price_usd.toFixed(2)}/лид`} url={clanOfferLink(data.ref_code, o.team_id)} />
          ))}
        </Card>
      )}
    </div>
  );
}
