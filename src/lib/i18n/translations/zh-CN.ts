import type { Translations } from "../types";

const zhCN: Translations = {
  nav: {
    articles: "文章",
    pricing: "定价",
    members: "会员",
    signIn: "登录",
    signOut: "退出",
    toggleMenu: "切换菜单",
  },
  hero: {
    badge: "全球超过 10 万名工程师信赖",
    titleLine1: "大型科技与初创，",
    titleLine2: "内幕第一手。",
    subtitle:
      "其他地方无法获得的深度工程情报。顶尖公司如何交付软件、组建团队、制定薪酬 — 由实践者撰写，为实践者而生。",
    startReading: "开始阅读",
    browseFree: "浏览免费文章",
    readBy: "以下公司的工程师正在阅读",
  },
  features: {
    title: "会员可享有的内容",
    subtitle:
      "加速工程职业生涯的 Premium 洞察 — 过去只能从资深导师那里获得的知识。",
    benefits: [
      {
        title: "深度文章",
        description:
          "顶尖科技公司运作方式的深度分析 — 从工程文化到交付实践。",
      },
      {
        title: "每周简报摘要",
        description:
          "本周最重要科技与工程新闻的精选摘要 — 过滤噪音。",
      },
      {
        title: "私人社区",
        description:
          "在 Slack 社区与 10,000+ 工程师和领导者连接，提问、分享见解。",
      },
      {
        title: "会员讨论",
        description:
          "每篇文章的留言串与 AMA 存档 — 向同行和业界实践者学习。",
      },
      {
        title: "工程 Playbook",
        description:
          "设计审查、On-call 手册、团队 onboarding 的 PDF 指南 — 年费会员专属。",
      },
      {
        title: "行业报告",
        description:
          "招聘趋势、工具采用、组织变化的行业报告。",
      },
    ],
  },
  pricing: {
    sectionTitle: "简单透明的定价",
    sectionSubtitle: "一个订阅。完整访问。随时取消。",
    bestValue: "最划算",
    bestValueSave: "最划算 — 省 $24",
    getStarted: "开始使用",
    pageTitle: "选择方案",
    pageSubtitle:
      "完整访问所有 Premium 内容、社区与会员福利。随时取消。",
    whatsIncluded: "包含内容",
    alreadyMember: "已是会员？",
    subscribe: "订阅",
    processing: "处理中...",
    checkoutFailed: "结账失败，请重试。",
    ctaPrice: "$12/月 或 $120/年。随时取消。",
    plans: {
      monthly: {
        name: "月付",
        description: "完整访问，按月计费。随时取消。",
        interval: "月",
        features: [
          "所有 Premium 文章与深度分析",
          "完整存档（20+ 篇文章）",
          "每周行业简报摘要",
          "Slack 私人社区",
          "每篇文章的会员留言",
          "新内容抢先阅读",
        ],
      },
      annual: {
        name: "年付",
        description: "每年省 $24。最适合认真学习者。",
        interval: "年",
        features: [
          "月付方案全部内容",
          "免费 2 个月（省 $24）",
          "年费会员专属报告",
          "优先提出文章主题",
          "工程 Playbook（PDF）",
          "年度虚拟职业工作坊",
        ],
      },
    },
    includedFeatures: [
      "20+ Premium 深度文章",
      "完整存档访问",
      "每周行业简报摘要",
      "Slack 私人社区（1 万+ 会员）",
      "每篇文章的会员留言",
      "工程 Playbook",
      "行业报告",
      "新内容抢先阅读",
    ],
  },
  testimonials: {
    title: "深受全球工程师喜爱",
    subtitle:
      "加入数千名依赖 Will'sView 获取职业关键知识的工程师和领导者。",
  },
  popularArticles: {
    title: "热门文章",
    subtitle: "会员正在阅读的内容一览",
    viewAll: "查看全部",
    premium: "Premium",
  },
  cta: {
    title: "今天就开始学习",
    subtitle:
      "加入 10 万+ 使用 Will'sView 领先同行的工程师。你的职业生涯会感谢你。",
    subscribe: "立即订阅",
    priceNote: "$12/月 或 $120/年。随时取消。",
  },
  footer: {
    tagline:
      "你在科技行业的隐形护城河：交付速度、组织设计与薪酬基准的第一手深度分析——来自 FAANG 与高成长初创的实战工程师。订阅一次，持续领先。",
    content: "内容",
    allArticles: "所有文章",
    pricing: "定价",
    memberArea: "会员专区",
    connect: "连接",
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
    slack: "Slack 社区",
    copyright: "版权所有。",
    privacy: "隐私",
    terms: "条款",
  },
  login: {
    welcomeBack: "欢迎回来",
    createAccount: "创建账号",
    signInSubtitle: "登录你的 Will'sView 账号",
    signUpSubtitle: "注册以访问会员内容",
    name: "姓名",
    email: "电子邮件",
    password: "密码",
    namePlaceholder: "你的姓名",
    emailPlaceholder: "you@example.com",
    signingIn: "登录中...",
    creatingAccount: "创建账号中...",
    signIn: "登录",
    createAccountBtn: "创建账号",
    alreadyHaveAccount: "已有账号？",
    dontHaveAccount: "还没有账号？",
    createOne: "创建一个",
    demoAccounts: "演示账号",
    demoMember: "会员：",
    demoFree: "免费：",
    notMember: "还不是会员？",
    viewPricing: "查看定价",
    networkError: "网络错误，请重试。",
    somethingWrong: "发生错误",
  },
  members: {
    welcome: "欢迎回来，{name}",
    fullAccess: "你拥有完整会员访问权。在下方查看你的活动记录。",
    upgradePrompt: "升级以解锁所有 Premium 内容和会员福利。",
    memberSince: "会员自",
    subscriptionUntil: "订阅有效至",
    upgradePremium: "升级 Premium",
    searchPlaceholder: "搜索你的活动…",
    loadingActivity: "加载中…",
    tabs: {
      likes: "点赞",
      comments: "消息",
      views: "浏览记录",
    },
    empty: {
      likes: "暂无点赞文章。点赞文章后会显示在这里。",
      comments: "暂无留言。在文章留下消息后会显示在这里。",
      views: "暂无浏览记录。你阅读过的文章会显示在这里。",
    },
  },
  articles: {
    title: "文章",
    subtitle:
      "从免费预览开始。订阅解锁完整存档 — 最佳工程团队如何交付、招聘、运作的内幕。",
    membershipLink: "查看会员方案 — $12/月起",
    premium: "Premium",
    backLink: "所有文章",
  },
  paywall: {
    title: "这是 Premium 内容",
    description:
      "订阅以解锁本文及 20+ 篇关于工程文化、薪酬、最佳实践的深度文章。",
    subscribe: "订阅 — $12/月起",
    alreadyMember: "已是会员？",
    signIn: "登录",
  },
  engagement: {
    like: "点赞",
    discuss: "讨论",
    share: "分享",
    shareX: "分享到 X",
    shareLinkedIn: "分享到 LinkedIn",
    shareSlack: "分享到 Slack",
    discussion: "讨论区",
    placeholder: "分享你的想法...",
    postComment: "发表评论",
    posting: "发表中...",
    signInToDiscuss: "以参与讨论。",
    loadingComments: "加载评论中...",
    noComments: "暂无评论，成为第一个！",
    failedComment: "评论发表失败",
  },
  subscribeSuccess: {
    title: "欢迎加入 Will'sView！",
    description:
      "你的订阅已生效。现在可以完整访问所有 Premium 内容和会员福利。",
    memberArea: "前往会员专区",
    browseArticles: "浏览文章",
  },
  language: {
    label: "语言",
  },
};

export default zhCN;
