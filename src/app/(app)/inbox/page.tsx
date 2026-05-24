import { InboxView } from "@/components/inbox/InboxView";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InboxPage({ searchParams }: Props) {
  const params = await searchParams;
  const team = typeof params.team === "string" ? params.team : undefined;
  const tab = typeof params.tab === "string" ? params.tab : undefined;
  return <InboxView initialTeam={team} initialTab={tab} />;
}
