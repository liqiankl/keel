import { InboxView } from "@/components/inbox/InboxView";
import { TEAMS } from "@/lib/constants";

interface Props {
  params: Promise<{ teamSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TeamIdeasPage({ params, searchParams }: Props) {
  const { teamSlug } = await params;
  const p = await searchParams;
  const tab = typeof p.tab === "string" ? p.tab : undefined;
  const team = TEAMS.find((t) => t.slug === teamSlug);
  const title = team ? `${team.name} · Ideas` : "Ideas";
  return <InboxView title={title} initialTeam={teamSlug} initialTab="new" visibleTabs={["new"]} />;
}
