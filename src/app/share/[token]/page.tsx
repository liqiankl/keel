import { SharedRoadmapView } from "@/components/share/SharedRoadmapView";

// Public route — no authentication, no sidebar.
// Renders outside the (app) route group layout.

interface Props {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  return <SharedRoadmapView token={token} />;
}
