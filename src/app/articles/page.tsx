import type { Metadata } from "next";
import { ArticlesPageContent } from "@/components/ArticlesPageContent";

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse engineering intelligence articles — free previews and premium deep dives.",
};

export default function ArticlesPage() {
  return <ArticlesPageContent />;
}
