export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 399,
    interval: "month",
    description: "Full access, billed monthly. Cancel anytime.",
    features: [
      "All premium articles & deep dives",
      "Full archive access (20+ articles)",
      "Weekly industry briefing digest",
      "Private Slack community access",
      "Member comment threads on every article",
      "Early access to new content",
    ],
  },
  {
    id: "annual",
    name: "Annual",
    price: 3990,
    interval: "year",
    description: "Save NT$798/year. Best value for committed learners.",
    features: [
      "Everything in Monthly",
      "2 months free (save NT$798)",
      "Exclusive annual member reports",
      "Priority article topic requests",
      "Downloadable engineering playbooks (PDF)",
      "Annual virtual career workshop",
    ],
    highlighted: true,
  },
];

export const memberBenefits = [
  {
    icon: "book-open",
    title: "Deep-Dive Articles",
    description:
      "In-depth analysis of how top tech companies operate — from engineering culture to shipping practices.",
  },
  {
    icon: "newspaper",
    title: "Weekly Briefing Digest",
    description:
      "Curated summary of the week's most important tech and engineering news — cut through the noise.",
  },
  {
    icon: "users",
    title: "Private Community",
    description:
      "Connect with 10,000+ engineers and leaders in our Slack community. Ask questions, share insights.",
  },
  {
    icon: "message-square",
    title: "Member Discussions",
    description:
      "Comment threads and AMA archives on every article — learn from peers and industry practitioners.",
  },
  {
    icon: "book-marked",
    title: "Engineering Playbooks",
    description:
      "Downloadable PDF guides for design reviews, on-call runbooks, and team onboarding — annual members.",
  },
  {
    icon: "trending-up",
    title: "Industry Reports",
    description:
      "Industry reports on hiring trends, tool adoption, and organizational shifts across the industry.",
  },
];

export const includedFeatures = [
  "20+ premium deep-dive articles",
  "Full archive access",
  "Weekly industry briefing digest",
  "Private Slack community (10K+ members)",
  "Member comment threads on every article",
  "Downloadable engineering playbooks",
  "Industry reports",
  "Early access to new content",
];
