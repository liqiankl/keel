import { RoadmapView } from "@/components/roadmap/RoadmapView";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RoadmapPage({ searchParams }: Props) {
  const params = await searchParams;
  const team = typeof params.team === "string" ? params.team : undefined;
  return <RoadmapView initialTeam={team} />;
}
