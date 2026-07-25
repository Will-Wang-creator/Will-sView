export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "Before this platform, you literally could not pay for these kinds of insights. You either had a mentor with this experience or you were on your own. I learn something important from every article.",
    author: "Sarah Chen",
    role: "Head of Engineering",
    company: "Stripe",
  },
  {
    id: "2",
    quote:
      "What I've learned in just a single post increases my value as an employee at any company by more than the monthly subscription cost. That's one meal delivery, and the ROI is insane.",
    author: "Marcus Johnson",
    role: "Staff Engineer",
    company: "Datadog",
  },
  {
    id: "3",
    quote:
      "I've learned more from reading this newsletter than from any class or course I've ever taken. The knowledge you pick up WILL increase your market value.",
    author: "Elena Rodriguez",
    role: "Engineering Manager",
    company: "Linear",
  },
  {
    id: "4",
    quote:
      "It's the insider newspaper for the tech industry. Not 'AI is changing the world' — but 'Here's exactly how Meta decides who to lay off.'",
    author: "James Park",
    role: "VP Engineering",
    company: "Notion",
  },
  {
    id: "5",
    quote:
      "Regardless of seniority, stack, or company — this is how you keep up with tech news, see how other teams work, and peek into engineering best practices.",
    author: "Aisha Patel",
    role: "Principal Engineer",
    company: "Cloudflare",
  },
  {
    id: "6",
    quote:
      "You're the only paid subscription I'm currently subscribed to, and I would pay even if it were more expensive. Well deserved.",
    author: "Tom Weber",
    role: "CTO",
    company: "Vercel",
  },
];
