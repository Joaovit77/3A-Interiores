import type { Metadata } from "next";

import { BriefingProvider } from "@/features/briefing/state/BriefingProvider";

export const metadata: Metadata = {
  title: "Briefing",
  description: "Briefing interativo para projetos de Design de Interiores.",
};

export default function BriefingLayout({ children }: LayoutProps<"/briefing">) {
  return <BriefingProvider>{children}</BriefingProvider>;
}
