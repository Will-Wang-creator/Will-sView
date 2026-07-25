import type { LegalContent } from "./types";
import { SITE_CONTACT_EMAIL } from "@/lib/site";

const privacy: LegalContent["privacy"] = {
  title: "Privacy Policy",
  updated: "Last updated: July 2026",
  intro:
    "Will'sView provides editorial content and membership features for software engineers and engineering leaders. We take your privacy seriously. This Privacy Policy explains how we collect, use, and share personal information when you use our website and services. Your use of Will'sView is also subject to our Terms of Service.",
  sections: [
    {
      heading: "What this Privacy Policy covers",
      paragraphs: [
        "This policy describes how Will'sView processes personal information when you browse articles, create an account, subscribe to membership, leave comments, or interact with member features such as likes and reading history.",
        "This policy applies to Will'sView as the operator of the platform. It does not cover third-party websites linked from our content or services.",
      ],
    },
    {
      heading: "Changes to this Privacy Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. When we make material changes, we will post a notice on the site and update the date at the top of this page. Continued use of Will'sView after changes become effective means you accept the updated policy.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: ["We may collect the following information:"],
      bullets: [
        "Account information such as your name and email address when you register or sign in.",
        "Subscription and billing-related information when you purchase or manage membership (processed by our payment provider where applicable).",
        "Usage information such as articles you read, like, or comment on, login timestamps, and member activity stored to power your account features.",
        "Technical information such as IP address, browser type, device information, and pages visited.",
        "Communications you send us, including support requests and feedback.",
        "Cookie and similar technology data as described in the Cookies section below.",
      ],
    },
    {
      heading: "How we use your information",
      paragraphs: ["We use personal information to:"],
      bullets: [
        "Provide, operate, and maintain the Will'sView platform and membership features.",
        "Authenticate your account and manage your subscription status.",
        "Deliver editorial content, member benefits, and account-related communications.",
        "Display your comments, likes, and activity history within your member account.",
        "Improve our services, troubleshoot issues, and protect against fraud or abuse.",
        "Comply with legal obligations and enforce our Terms of Service.",
        "Send service announcements or, with your consent where required, marketing communications you can opt out of at any time.",
      ],
    },
    {
      heading: "How we share information",
      paragraphs: [
        "We do not sell your personal information. We may share information in the following circumstances:",
      ],
      bullets: [
        "Service providers that help us operate the platform, such as hosting, email delivery, analytics, and payment processing, under contractual confidentiality obligations.",
        "When required by law, regulation, legal process, or to protect the rights, safety, and security of Will'sView, our users, or others.",
        "In connection with a merger, acquisition, or sale of assets, subject to applicable law.",
        "Public comments you post on articles, which are visible to other members as part of the discussion feature.",
      ],
    },
    {
      heading: "Member comments and engagement",
      paragraphs: [
        "When you comment on an article, your display name and comment content may be visible to other signed-in members. Likes and reading history are associated with your account and shown in your private member dashboard unless you choose to share content elsewhere.",
        "We may review comments and engagement data to enforce community standards, prevent spam, and maintain platform security.",
      ],
    },
    {
      heading: "Cookies",
      paragraphs: [
        "We use cookies and similar technologies to keep you signed in, remember your language preference, and understand how the site is used.",
      ],
      bullets: [
        "Strictly necessary cookies for authentication, security, and core site functionality.",
        "Preference cookies to store settings such as your selected language.",
        "Analytics cookies, where enabled, to help us measure traffic and improve the reading experience.",
      ],
    },
    {
      heading: "Data retention",
      paragraphs: [
        "We retain personal information for as long as needed to provide the services, comply with legal obligations, resolve disputes, and enforce our agreements. You may request account deletion, subject to retention required by law or legitimate business needs such as billing records.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "We use reasonable administrative, technical, and organizational measures to protect personal information. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Depending on your location, you may have the right to access, correct, delete, or restrict processing of your personal information, or to object to certain processing. To exercise these rights, contact us using the details below. We will respond within a reasonable timeframe.",
        "You can update certain account information from your member settings. You may unsubscribe from non-essential marketing emails using the link in those messages.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "Will'sView is not directed to children under 16, and we do not knowingly collect personal information from children under 16. If you believe a child has provided us personal information, please contact us so we can delete it.",
      ],
    },
    {
      heading: "International transfers",
      paragraphs: [
        "Will'sView may process and store information in countries other than where you live. Where required, we take steps designed to protect personal information in accordance with this Privacy Policy and applicable law.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        `If you have questions about this Privacy Policy or our privacy practices, contact us at ${SITE_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

const terms: LegalContent["terms"] = {
  title: "Terms of Service",
  updated: "Effective date: July 2026",
  intro:
    "Welcome to Will'sView. These Terms of Service are a binding agreement between you and Will'sView governing your use of our website, articles, and membership features. By accessing or using Will'sView, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the service.",
  sections: [
    {
      heading: "Eligibility and accounts",
      paragraphs: [
        "You must be at least 16 years old and able to form a binding contract to use Will'sView. If you use Will'sView on behalf of an organization, you represent that you have authority to bind that organization.",
        "You agree to provide accurate registration information and to keep your account credentials secure. You are responsible for activity that occurs under your account.",
      ],
    },
    {
      heading: "Editorial content",
      paragraphs: [
        "Will'sView publishes editorial content about software engineering, technology companies, and related topics for informational and educational purposes. Content reflects the views of the authors and is not professional, legal, financial, or career advice.",
        "We may update, correct, or remove content at any time. Free previews and premium articles may change as we publish new material.",
      ],
    },
    {
      heading: "Membership and subscriptions",
      paragraphs: [
        "Some articles and member features require a paid subscription. Subscription plans, pricing, and included benefits are described on our pricing page.",
        "Demo checkout on this platform may activate membership locally for testing purposes only. Production payment terms, renewal, cancellation, and refund policies will be disclosed before live billing is enabled.",
        "We may change subscription pricing or plan features prospectively. Price changes do not apply retroactively to an active billing period unless required by law or disclosed at checkout.",
      ],
    },
    {
      heading: "Your content and comments",
      paragraphs: [
        "You retain ownership of comments and other content you submit. By posting comments or other member content, you grant Will'sView a non-exclusive, worldwide, royalty-free license to host, display, reproduce, and distribute that content as needed to operate the platform.",
        "You represent that you have the rights to post your content and that it does not violate these Terms or applicable law.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: ["You agree not to:"],
      bullets: [
        "Copy, scrape, redistribute, or resell Will'sView content without permission.",
        "Use automated means to access the service in a way that burdens or disrupts the platform.",
        "Impersonate another person or misrepresent your affiliation.",
        "Post unlawful, harassing, defamatory, spam, or otherwise abusive content.",
        "Attempt to gain unauthorized access to accounts, systems, or data.",
        "Use Will'sView in violation of applicable laws or third-party rights.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "Will'sView and its content, branding, design, and software are protected by intellectual property laws. Except for the limited rights expressly granted in these Terms, no rights are transferred to you.",
        "If you believe content on Will'sView infringes your copyright, contact us with sufficient detail for us to review the claim.",
      ],
    },
    {
      heading: "Third-party links and services",
      paragraphs: [
        "Will'sView may link to third-party websites or services. We are not responsible for their content, policies, or practices. Your use of third-party services is at your own risk and subject to their terms.",
      ],
    },
    {
      heading: "Disclaimers",
      paragraphs: [
        "Will'sView is provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.",
        "We do not warrant that the service will be uninterrupted, error-free, or free of harmful components.",
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, Will'sView will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, or goodwill arising from your use of the service.",
        "To the extent liability cannot be excluded, our total liability for any claim relating to Will'sView will not exceed the greater of USD $100 or the amount you paid us for membership in the twelve months before the event giving rise to the claim.",
      ],
    },
    {
      heading: "Termination",
      paragraphs: [
        "You may stop using Will'sView at any time. We may suspend or terminate your access if you violate these Terms or if we discontinue the service.",
        "Upon termination, provisions that by their nature should survive will remain in effect, including intellectual property, disclaimers, limitations of liability, and dispute provisions.",
      ],
    },
    {
      heading: "Privacy",
      paragraphs: [
        "Our Privacy Policy explains how we collect and use personal information. By using Will'sView, you acknowledge that you have read our Privacy Policy.",
      ],
    },
    {
      heading: "Changes to these Terms",
      paragraphs: [
        "We may modify these Terms from time to time. If we make material changes, we will provide notice on the site or by email where appropriate. Continued use after changes become effective constitutes acceptance of the revised Terms.",
      ],
    },
    {
      heading: "Governing law and contact",
      paragraphs: [
        "These Terms are governed by applicable law without regard to conflict-of-law principles, except where mandatory local consumer protections apply.",
        `Questions about these Terms may be sent to ${SITE_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

const en: LegalContent = { privacy, terms };

export default en;
