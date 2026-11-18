import type { Metadata } from "next";

import { ComingNext } from "@/components/layout/ComingNext";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return (
    <ComingNext
      title="Settings"
      description="Account and app settings will be built once their design direction is approved."
    />
  );
}
