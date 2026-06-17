import { AppShell } from "@/app/_components/AppShell";

export default function PerfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
