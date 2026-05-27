import { ScoringView } from "@/components/scoring/ScoringView";

interface Props {
  params: Promise<{ teamSlug: string }>;
}

export default async function TeamPrioritizePage({ params }: Props) {
  const { teamSlug } = await params;
  return <ScoringView initialTeam={teamSlug} />;
}
