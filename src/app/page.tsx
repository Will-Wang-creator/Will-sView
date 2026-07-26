import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { PopularArticles } from "@/components/PopularArticles";
import { PricingSection } from "@/components/PricingSection";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <PopularArticles />
      <Features />
      <PricingSection />
      <CTASection />
    </>
  );
}
