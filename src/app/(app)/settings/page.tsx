import { SettingsView } from "@/components/settings/SettingsView";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const section = typeof params.section === "string" ? params.section : "profile";
  return <SettingsView initialSection={section} />;
}
