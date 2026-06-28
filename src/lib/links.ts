const REF_BOT_USERNAME = import.meta.env.VITE_REF_BOT_USERNAME;
const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME;

/** Opens the refbot's main menu — every "do this in the bot" CTA lands here; */
/** the user takes one more tap inside the bot for the actual action. */
export const refBotMenuLink = (): string => `https://t.me/${REF_BOT_USERNAME}`;

export const mainPartnerLink = (refCode: string): string => `https://t.me/${BOT_USERNAME}?start=p_${refCode}`;

export const subPartnerLink = (refCode: string): string => `https://t.me/${REF_BOT_USERNAME}?start=p_${refCode}`;

export const campaignLink = (refCode: string, slug: string): string => `https://t.me/${BOT_USERNAME}?start=p_${refCode}-${slug}`;

export const clanOfferLink = (refCode: string, teamId: number): string => `https://t.me/${BOT_USERNAME}?start=p_${refCode}-clan_${teamId}`;
