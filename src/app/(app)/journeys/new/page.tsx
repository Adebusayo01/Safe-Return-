import type { Metadata } from "next";

import { ComingNext } from "@/components/layout/ComingNext";

export const metadata: Metadata = { title: "Start a journey" };

export default function Page() {
  return (
    <ComingNext
      title="Start a journey"
      description="Journey creation (destination, arrival time, grace period, contacts and location consent) is the next screen to build, after your review of the dashboard."
    />
  );
}
