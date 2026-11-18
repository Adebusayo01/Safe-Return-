import type { Metadata } from "next";

import { ComingNext } from "@/components/layout/ComingNext";

export const metadata: Metadata = { title: "Active journey" };

export default function Page() {
  return (
    <ComingNext
      title="Active journey"
      description="The active journey screen (countdown, check in, extend, need help, cancel) will be built after journey creation."
    />
  );
}
