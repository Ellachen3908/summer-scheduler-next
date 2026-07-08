import Link from "next/link";
import { CalendarClock, LogOut } from "lucide-react";
import { signOut } from "@/app/actions";

export function AppShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><CalendarClock size={22} /></div>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/parent">家长端</Link>
          <Link href="/teacher">老师端</Link>
          <Link href="/admin">管理后台</Link>
          <form action={signOut}>
            <button className="icon-button" title="退出登录"><LogOut size={18} /></button>
          </form>
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
