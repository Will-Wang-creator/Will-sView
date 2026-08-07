import type { Article } from "./types";
import type { Locale } from "@/lib/i18n/locales";
import { defaultLocale } from "@/lib/i18n/locales";
import { getArticleLocaleContent } from "./locales";
import { article as changesAtGoogleDeepmindDemisHassabisFromCeoToChair20260814 } from "./changes-at-google-deepmind-demis-hassabis-from-ceo-to-chair-2026-08-14";
import { article as developersAreAttachedToToolsBecauseToolsEncodeTrust20260807 } from "./developers-are-attached-to-tools-because-tools-encode-trust-2026-08-07";
import { article as forwardDeployedEngineersEnterpriseAi20260731 } from "./forward-deployed-engineers-enterprise-ai-2026-07-31";
import { article as anthropicReliabilityEngineering } from "./anthropic-reliability-engineering";
import { article as engineeringMetricsThatMatter } from "./engineering-metrics-that-matter";
import { article as howLinearBuiltDeveloperTool } from "./how-linear-built-developer-tool";
import { article as euAiActEngineeringLeaders } from "./eu-ai-act-engineering-leaders";
import { article as appleOnDeviceAiEngineering } from "./apple-on-device-ai-engineering";
import { article as netflixChaosEngineeringPractices } from "./netflix-chaos-engineering-practices";
import { article as techHiringMarketMid2026 } from "./tech-hiring-market-mid-2026";
import { article as cloudflareEdgeComputingDeepDive } from "./cloudflare-edge-computing-deep-dive";
import { article as openaiEngineeringOrgStructure } from "./openai-engineering-org-structure";
import { article as amazonTwoPizzaTeams2026 } from "./amazon-two-pizza-teams-2026";
import { article as engineeringLevelsIcVsManager } from "./engineering-levels-ic-vs-manager";
import { article as howStripeShipsPaymentsAtScale } from "./how-stripe-ships-payments-at-scale";
import { article as aiAgentsInProduction2026 } from "./ai-agents-in-production-2026";
import { article as googleGeminiInfrastructureLessons } from "./google-gemini-infrastructure-lessons";
import { article as returnToOfficeEngineeringTeams } from "./return-to-office-engineering-teams";
import { article as insideMetaEngineeringCulture } from "./inside-meta-engineering-culture";
import { article as howClaudeCodeIsBuilt } from "./how-claude-code-is-built";
import { article as howBigTechRunsProjects } from "./how-big-tech-runs-projects";
import { article as buildingCursorInsideStory } from "./building-cursor-inside-story";
import { article as incidentReviewBestPractices } from "./incident-review-best-practices";
import { article as remoteCompensationGuide } from "./remote-compensation-guide";
import { article as aiCodingToolsAdoption } from "./ai-coding-tools-adoption";

export type { Article, ArticleLocaleContent } from "./types";

export const articles: Article[] = [
  changesAtGoogleDeepmindDemisHassabisFromCeoToChair20260814,
  developersAreAttachedToToolsBecauseToolsEncodeTrust20260807,
  forwardDeployedEngineersEnterpriseAi20260731,
  anthropicReliabilityEngineering,
  engineeringMetricsThatMatter,
  howLinearBuiltDeveloperTool,
  euAiActEngineeringLeaders,
  appleOnDeviceAiEngineering,
  netflixChaosEngineeringPractices,
  techHiringMarketMid2026,
  cloudflareEdgeComputingDeepDive,
  openaiEngineeringOrgStructure,
  amazonTwoPizzaTeams2026,
  engineeringLevelsIcVsManager,
  howStripeShipsPaymentsAtScale,
  aiAgentsInProduction2026,
  googleGeminiInfrastructureLessons,
  returnToOfficeEngineeringTeams,
  insideMetaEngineeringCulture,
  howClaudeCodeIsBuilt,
  howBigTechRunsProjects,
  buildingCursorInsideStory,
  incidentReviewBestPractices,
  remoteCompensationGuide,
  aiCodingToolsAdoption,
];

function localizeArticle(article: Article, locale: Locale): Article {
  const overlay = getArticleLocaleContent(article.slug, locale);
  if (!overlay) return article;
  return { ...article, ...overlay };
}

export function getSortedArticles(locale: Locale = defaultLocale): Article[] {
  return [...articles]
    .map((a) => localizeArticle(a, locale))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getArticle(
  slug: string,
  locale: Locale = defaultLocale
): Article | undefined {
  const article = articles.find((a) => a.slug === slug);
  if (!article) return undefined;
  return localizeArticle(article, locale);
}

export function getPublicArticles(locale: Locale = defaultLocale): Article[] {
  return getSortedArticles(locale).filter((a) => !a.isPremium);
}

export function getPremiumArticles(locale: Locale = defaultLocale): Article[] {
  return getSortedArticles(locale).filter((a) => a.isPremium);
}
