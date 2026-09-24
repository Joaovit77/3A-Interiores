import { Suspense } from "react";

import { BriefingFlow } from "@/features/briefing/components/BriefingFlow";

export default function BriefingResponderPage() {
  return (
    <Suspense>
      <BriefingFlow />
    </Suspense>
  );
}
