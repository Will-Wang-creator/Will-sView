export interface PlanTranslation {
  name: string;
  description: string;
  interval: string;
  features: string[];
}

export interface BenefitTranslation {
  title: string;
  description: string;
}

export interface Translations {
  nav: {
    articles: string;
    pricing: string;
    members: string;
    signIn: string;
    signOut: string;
    toggleMenu: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    startReading: string;
    browseFree: string;
    readBy: string;
  };
  features: {
    title: string;
    subtitle: string;
    benefits: BenefitTranslation[];
  };
  pricing: {
    sectionTitle: string;
    sectionSubtitle: string;
    bestValue: string;
    bestValueSave: string;
    getStarted: string;
    pageTitle: string;
    pageSubtitle: string;
    whatsIncluded: string;
    alreadyMember: string;
    subscribe: string;
    processing: string;
    checkoutFailed: string;
    plans: {
      monthly: PlanTranslation;
      annual: PlanTranslation;
    };
    includedFeatures: string[];
    ctaPrice: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
  };
  popularArticles: {
    title: string;
    subtitle: string;
    viewAll: string;
    premium: string;
  };
  cta: {
    title: string;
    subtitle: string;
    subscribe: string;
    priceNote: string;
  };
  footer: {
    tagline: string;
    content: string;
    allArticles: string;
    pricing: string;
    memberArea: string;
    connect: string;
    twitter: string;
    linkedin: string;
    slack: string;
    copyright: string;
    privacy: string;
    terms: string;
    contactUs: string;
  };
  login: {
    welcomeBack: string;
    createAccount: string;
    signInSubtitle: string;
    signUpSubtitle: string;
    name: string;
    email: string;
    password: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    signingIn: string;
    creatingAccount: string;
    signIn: string;
    createAccountBtn: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    createOne: string;
    demoAccounts: string;
    demoMember: string;
    demoFree: string;
    notMember: string;
    viewPricing: string;
    networkError: string;
    somethingWrong: string;
  };
  members: {
    welcome: string;
    fullAccess: string;
    upgradePrompt: string;
    memberSince: string;
    subscriptionUntil: string;
    upgradePremium: string;
    searchPlaceholder: string;
    loadingActivity: string;
    tabs: {
      likes: string;
      comments: string;
      views: string;
    };
    empty: {
      likes: string;
      comments: string;
      views: string;
    };
  };
  articles: {
    title: string;
    subtitle: string;
    membershipLink: string;
    premium: string;
    backLink: string;
  };
  paywall: {
    title: string;
    description: string;
    subscribe: string;
    alreadyMember: string;
    signIn: string;
  };
  engagement: {
    like: string;
    discuss: string;
    share: string;
    shareX: string;
    shareLinkedIn: string;
    shareSlack: string;
    discussion: string;
    placeholder: string;
    postComment: string;
    posting: string;
    signInToDiscuss: string;
    loadingComments: string;
    noComments: string;
    failedComment: string;
  };
  subscribeSuccess: {
    title: string;
    description: string;
    memberArea: string;
    browseArticles: string;
  };
  language: {
    label: string;
  };
}
