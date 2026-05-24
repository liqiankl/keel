import { ScoringView } from "@/components/scoring/ScoringView";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ScoringPage({ searchParams }: Props) {
  const params = await searchParams;
  const team = typeof params.team === "string" ? params.team : undefined;
  return <ScoringView initialTeam={team} />;
}
