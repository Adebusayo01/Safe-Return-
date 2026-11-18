import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/modules/dashboard/get-dashboard-data";

export const metadata: Metadata = {
  title: "Home",
};

/**
 * Dashboard. The page shell (navigation) is sent immediately; the dashboard
 * content depends on the current time (and later on the signed-in user), so
 * it renders per request inside the Suspense boundary.
 *
 * Preview the "no active journey" state with `/?sample=none`.
 */
export default function DashboardPage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  await connection();
  const now = new Date();
  const { sample } = await searchParams;
  const data = await getDashboardData({ now, sampleScenario: sample === "none" ? "none" : "active" });
  return <DashboardView data={data} now={now} />;
}
