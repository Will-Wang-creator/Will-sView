import type { Translations } from "../types";

const fr: Translations = {
  nav: {
    articles: "Articles",
    pricing: "Tarifs",
    members: "Membres",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    toggleMenu: "Ouvrir le menu",
  },
  hero: {
    badge: "La confiance de plus de 100 000 ingénieurs dans le monde",
    titleLine1: "Big tech et startups,",
    titleLine2: "de l'intérieur.",
    subtitle:
      "Une veille ingénierie approfondie introuvable ailleurs. Comment les grandes entreprises livrent leurs logiciels, structurent leurs équipes et rémunèrent leurs ingénieurs — écrit par des praticiens, pour des praticiens.",
    startReading: "Commencer la lecture",
    browseFree: "Parcourir les articles gratuits",
    readBy: "Lu par des ingénieurs chez",
  },
  features: {
    title: "Ce à quoi les membres ont accès",
    subtitle:
      "Des insights premium qui accélèrent votre carrière d'ingénieur — le genre de savoir que l'on obtenait autrefois uniquement d'un mentor senior.",
    benefits: [
      {
        title: "Articles approfondis",
        description:
          "Analyse détaillée du fonctionnement des grandes entreprises tech — de la culture d'ingénierie aux pratiques de livraison.",
      },
      {
        title: "Briefing hebdomadaire",
        description:
          "Résumé sélectionné des actualités tech et ingénierie les plus importantes de la semaine — sans le bruit.",
      },
      {
        title: "Communauté privée",
        description:
          "Échangez avec plus de 10 000 ingénieurs et leaders dans notre communauté Slack. Posez des questions, partagez vos idées.",
      },
      {
        title: "Discussions entre membres",
        description:
          "Fils de commentaires et archives AMA sur chaque article — apprenez de vos pairs et de professionnels du secteur.",
      },
      {
        title: "Playbooks d'ingénierie",
        description:
          "Guides PDF téléchargeables pour les revues de conception, les runbooks d'astreinte et l'onboarding d'équipe — membres annuels.",
      },
      {
        title: "Rapports sectoriels",
        description:
          "Rapports sur les tendances de recrutement, l'adoption d'outils et les évolutions organisationnelles du secteur.",
      },
    ],
  },
  pricing: {
    sectionTitle: "Des tarifs simples et transparents",
    sectionSubtitle: "Un abonnement. Accès complet. Résiliez à tout moment.",
    bestValue: "Meilleur rapport qualité-prix",
    bestValueSave: "Meilleur rapport qualité-prix — économisez NT$798",
    getStarted: "Commencer",
    pageTitle: "Choisissez votre formule",
    pageSubtitle:
      "Accès complet à tout le contenu premium, à la communauté et aux avantages membres. Résiliez à tout moment.",
    whatsIncluded: "Ce qui est inclus",
    alreadyMember: "Déjà membre ?",
    subscribe: "S'abonner",
    processing: "Traitement en cours...",
    checkoutFailed: "Échec du paiement. Veuillez réessayer.",
    ctaPrice: "NT$399/mois ou NT$3990/an. Résiliez à tout moment.",
    plans: {
      monthly: {
        name: "Mensuel",
        description: "Accès complet, facturation mensuelle. Résiliez à tout moment.",
        interval: "mois",
        features: [
          "Tous les articles premium et analyses approfondies",
          "Accès complet aux archives (plus de 20 articles)",
          "Briefing sectoriel hebdomadaire",
          "Accès à la communauté Slack privée",
          "Fils de commentaires membres sur chaque article",
          "Accès anticipé aux nouveaux contenus",
        ],
      },
      annual: {
        name: "Annuel",
        description: "Économisez NT$798/an. Le meilleur choix pour les apprenants engagés.",
        interval: "an",
        features: [
          "Tout ce qui est inclus dans la formule mensuelle",
          "2 mois offerts (économisez NT$798)",
          "Rapports exclusifs pour les membres annuels",
          "Priorité sur les demandes de sujets d'articles",
          "Playbooks d'ingénierie téléchargeables (PDF)",
          "Atelier carrière virtuel annuel",
        ],
      },
    },
    includedFeatures: [
      "Plus de 20 articles premium approfondis",
      "Accès complet aux archives",
      "Briefing sectoriel hebdomadaire",
      "Communauté Slack privée (plus de 10K membres)",
      "Fils de commentaires membres sur chaque article",
      "Playbooks d'ingénierie téléchargeables",
      "Rapports sectoriels",
      "Accès anticipé aux nouveaux contenus",
    ],
  },
  testimonials: {
    title: "Plébiscité par les ingénieurs du monde entier",
    subtitle:
      "Rejoignez des milliers d'ingénieurs et de leaders qui s'appuient sur Will'sView pour un savoir qui façonne les carrières.",
  },
  popularArticles: {
    title: "Articles populaires",
    subtitle: "Un aperçu de ce que lisent les membres",
    viewAll: "Tout voir",
    premium: "Premium",
  },
  cta: {
    title: "Commencez à apprendre dès aujourd'hui",
    subtitle:
      "Rejoignez plus de 100 000 ingénieurs qui utilisent Will'sView pour rester en avance. Votre carrière vous remerciera.",
    subscribe: "S'abonner maintenant",
    priceNote: "NT$399/mois ou NT$3990/an. Résiliez à tout moment.",
  },
  footer: {
    tagline:
      "Votre avantage en tech : des deep dives production-grade sur la vélocité de delivery, l'org design et les benchmarks de rémunération — par des praticiens FAANG et startups. Un abonnement débloque tout l'archive.",
    content: "Contenu",
    allArticles: "Tous les articles",
    pricing: "Tarifs",
    memberArea: "Espace membre",
    connect: "Nous suivre",
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
    slack: "Communauté Slack",
    copyright: "Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions",
    contactUs: "Nous contacter",
  },
  login: {
    welcomeBack: "Bon retour",
    createAccount: "Créer un compte",
    signInSubtitle: "Connectez-vous à votre compte Will'sView",
    signUpSubtitle: "Inscrivez-vous pour accéder au contenu réservé aux membres",
    name: "Nom",
    email: "E-mail",
    password: "Mot de passe",
    namePlaceholder: "Votre nom",
    emailPlaceholder: "vous@exemple.com",
    signingIn: "Connexion en cours...",
    creatingAccount: "Création du compte...",
    signIn: "Se connecter",
    createAccountBtn: "Créer un compte",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    createOne: "En créer un",
    demoAccounts: "Comptes de démonstration",
    demoMember: "Membre :",
    demoFree: "Gratuit :",
    notMember: "Pas encore membre ?",
    viewPricing: "Voir les tarifs",
    networkError: "Erreur réseau. Veuillez réessayer.",
    somethingWrong: "Une erreur s'est produite",
  },
  members: {
    welcome: "Bon retour, {name}",
    fullAccess: "Vous bénéficiez d'un accès membre complet. Consultez votre activité ci-dessous.",
    upgradePrompt:
      "Passez à la formule supérieure pour débloquer tout le contenu premium et les avantages membres.",
    memberSince: "Membre depuis",
    subscriptionUntil: "Abonnement valide jusqu'au",
    upgradePremium: "Passer à Premium",
    searchPlaceholder: "Rechercher dans votre activité…",
    loadingActivity: "Chargement de l'activité…",
    tabs: {
      likes: "J'aime",
      comments: "Messages",
      views: "Historique",
    },
    empty: {
      likes: "Aucun article aimé pour l'instant. Aimez un article pour le retrouver ici.",
      comments: "Aucun message pour l'instant. Commentez un article pour le voir ici.",
      views: "Aucun historique pour l'instant. Les articles lus apparaîtront ici.",
    },
  },
  articles: {
    title: "Articles",
    subtitle:
      "Commencez par les aperçus gratuits. Abonnez-vous pour débloquer l'intégralité des archives — des insights exclusifs sur la façon dont les meilleures équipes d'ingénierie livrent, recrutent et opèrent.",
    membershipLink: "Voir l'abonnement — à partir de NT$399/mois",
    premium: "Premium",
    backLink: "Tous les articles",
  },
  paywall: {
    title: "Contenu premium",
    description:
      "Abonnez-vous pour débloquer cet article et plus de 20 analyses approfondies sur la culture d'ingénierie, la rémunération et les bonnes pratiques.",
    subscribe: "S'abonner — à partir de NT$399/mois",
    alreadyMember: "Déjà membre ?",
    signIn: "Se connecter",
  },
  engagement: {
    like: "J'aime",
    discuss: "Discuter",
    share: "Partager",
    shareX: "Partager sur X",
    shareLinkedIn: "Partager sur LinkedIn",
    shareSlack: "Partager sur Slack",
    discussion: "Discussion",
    placeholder: "Partagez vos réflexions...",
    postComment: "Publier le commentaire",
    posting: "Publication...",
    signInToDiscuss: "pour rejoindre la discussion.",
    loadingComments: "Chargement des commentaires...",
    noComments: "Aucun commentaire pour l'instant. Soyez le premier !",
    failedComment: "Échec de la publication du commentaire",
  },
  subscribeSuccess: {
    title: "Bienvenue sur Will'sView !",
    description:
      "Votre abonnement est actif. Vous avez désormais un accès complet à tout le contenu premium et aux avantages membres.",
    memberArea: "Accéder à l'espace membre",
    browseArticles: "Parcourir les articles",
  },
  language: {
    label: "Langue",
  },
};

export default fr;
