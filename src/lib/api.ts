import { getInitData } from './telegram';
import { getManualUserId } from './manualAuth';

export interface PlanSummary {
  id: number;
  code: string;
  name: string;
  lead_price_usd: number;
  profit_pct_l1: number;
  profit_pct_l2: number;
  is_default?: boolean;
}

export interface OverviewData {
  partner_id: number;
  balance_usd: number;
  total_earned_usd: number;
  approved_leads_count: number;
  pending_leads_count: number;
  plan: PlanSummary | null;
  leads_today: number;
  leads_7d: number;
  leads_30d: number;
  best_campaign: { slug: string; label: string; approved: number } | null;
}

export interface CampaignStat {
  slug: string;
  label: string;
  clicks: number;
  leads: number;
  approved: number;
}

export interface ClanOffer {
  team_id: number;
  team_name: string;
  lead_price_usd: number;
}

export interface LinksData {
  ref_code: string;
  campaigns: CampaignStat[];
  clan_offers: ClanOffer[];
}

export interface PlansData {
  current_plan_id: number | null;
  plans: PlanSummary[];
}

export interface AnalyticsDayPoint {
  date: string;
  leads: number;
  approved: number;
  rejected: number;
  earned_pct_share: number;
  earned_fixed_est: number;
}

export interface AnalyticsPeriod {
  leads: number;
  approved: number;
  rejected: number;
  earned_pct_share: number;
}

export interface AnalyticsData {
  days: number;
  total_clicks_alltime: number;
  daily: AnalyticsDayPoint[];
  period: AnalyticsPeriod;
  previous_period: AnalyticsPeriod;
  top_campaigns: { slug: string; label: string; clicks: number; approved: number }[];
  offer_breakdown: {
    via_offer: { approved: number; total: number };
    regular: { approved: number; total: number };
  };
}

export type ApiErrorReason = 'unauthorized' | 'not_a_partner' | 'network' | 'unknown';

export class ApiError extends Error {
  reason: ApiErrorReason;
  constructor(reason: ApiErrorReason, message?: string) {
    super(message ?? reason);
    this.reason = reason;
  }
}

/** True once we have *some* identity to send (real Telegram session or a manually entered id). */
export function hasIdentity(): boolean {
  return Boolean(getInitData() || getManualUserId());
}

function authHeaders(): Record<string, string> {
  const initData = getInitData();
  if (initData) return { 'x-telegram-init-data': initData };
  const manualId = getManualUserId();
  return manualId ? { 'x-telegram-user-id': manualId } : {};
}

async function fetchView<T>(view: 'overview' | 'links' | 'plans' | 'analytics', params: Record<string, string> = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) throw new ApiError('unknown', 'VITE_API_BASE_URL is not configured');

  const query = new URLSearchParams({ view, ...params });
  let res: Response;
  try {
    res = await fetch(`${base}?${query.toString()}`, { headers: authHeaders() });
  } catch {
    throw new ApiError('network');
  }

  if (res.status === 401) throw new ApiError('unauthorized');
  if (res.status === 404) throw new ApiError('not_a_partner');
  if (!res.ok) throw new ApiError('unknown');

  const body = (await res.json()) as { data: T };
  return body.data;
}

export const fetchOverview = (): Promise<OverviewData> => fetchView<OverviewData>('overview');
export const fetchLinks = (): Promise<LinksData> => fetchView<LinksData>('links');
export const fetchPlans = (): Promise<PlansData> => fetchView<PlansData>('plans');
export const fetchAnalytics = (days: 7 | 30 | 90): Promise<AnalyticsData> =>
  fetchView<AnalyticsData>('analytics', { days: String(days) });
