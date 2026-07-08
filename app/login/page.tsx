import { LoginPanel } from "@/components/LoginPanel";

export default function LoginPage({
  searchParams
}: {
  searchParams: { sent?: string; email?: string; tab?: string; error?: string };
}) {
  return (
    <LoginPanel
      sent={searchParams.sent}
      email={searchParams.email}
      tab={searchParams.tab}
      error={searchParams.error}
    />
  );
}
