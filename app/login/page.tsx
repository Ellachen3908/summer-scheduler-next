import { LoginPanel } from "@/components/LoginPanel";

export default function LoginPage({
  searchParams
}: {
  searchParams: { sent?: string; phone?: string; tab?: string; error?: string };
}) {
  return (
    <LoginPanel
      sent={searchParams.sent}
      phone={searchParams.phone}
      tab={searchParams.tab}
      error={searchParams.error}
    />
  );
}
