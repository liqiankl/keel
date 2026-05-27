import { RoadmapView } from "@/components/roadmap/RoadmapView";

interface Props {
  params: Promise<{ teamSlug: string }>;
}

export default async function TeamRoadmapPage({ params }: Props) {
  const { teamSlug } = await params;
  return <RoadmapView initialTeam={teamSlug} />;
}
