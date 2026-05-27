import { SettingsView } from "@/components/settings/SettingsView";

interface Props {
  params: Promise<{ section: string }>;
}

export default async function SettingsSectionPage({ params }: Props) {
  const { section } = await params;
  return <SettingsView initialSection={section} />;
}
