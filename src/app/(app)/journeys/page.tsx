import type { Metadata } from "next";

import { ComingNext } from "@/components/layout/ComingNext";

export const metadata: Metadata = { title: "Journeys" };

export default function Page() {
  return (
    <ComingNext
      title="Journeys"
      description="Your journey history will appear here. This screen will be built once its design direction is approved."
    />
  );
}
