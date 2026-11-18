import type { Metadata } from "next";

import { ComingNext } from "@/components/layout/ComingNext";

export const metadata: Metadata = { title: "Trusted contacts" };

export default function Page() {
  return (
    <ComingNext
      title="Trusted contacts"
      description="Managing trusted contacts will be built once its design direction is approved. Contacts need the database to be saved."
    />
  );
}
