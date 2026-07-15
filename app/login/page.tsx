import { LoginPanel } from "@/components/LoginPanel";

export const runtime = "edge";

export default function LoginPage({
  searchParams
}: {
  searchParams: { role?: string; error?: string };
}) {
  return (
    <LoginPanel
      role={searchParams.role}
      error={searchParams.error}
    />
  );
}
