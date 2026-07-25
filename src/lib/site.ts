export const SITE_NAME = "Will'sView";

export const CURRENCY_PREFIX = "NT$";

export function formatPrice(amount: number): string {
  return `${CURRENCY_PREFIX}${amount}`;
}

export const SITE_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "asd123456w910909@gmail.com";

export const SOCIAL_LINKS = {
  x: process.env.NEXT_PUBLIC_SOCIAL_X ?? "https://x.com",
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "https://www.linkedin.com",
  slack: process.env.NEXT_PUBLIC_SOCIAL_SLACK ?? "https://slack.com/community",
} as const;
