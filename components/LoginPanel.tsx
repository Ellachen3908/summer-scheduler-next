import { parentLogin, teacherLogin } from "@/app/actions";

export function LoginPanel({
  tab,
  error
}: {
  sent?: string;
  email?: string;
  tab?: string;
  error?: string;
}) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div>
          <p className="eyebrow">Summer Scheduler</p>
          <h1>暑期订课排课系统</h1>
          <p className="muted">家长填时间，老师填时间，教务后台自动匹配并确认课程。</p>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="login-grid">
          <div className={`login-box ${tab !== "teacher" ? "active" : ""}`}>
            <h2>家长登录</h2>
            <form action={parentLogin} className="stack">
              <label>邮箱<input name="email" type="email" placeholder="parent@example.com" required /></label>
              <label>密码<input name="password" type="password" required /></label>
              <button className="primary">登录 / 注册家长账号</button>
              <p className="muted small">第一次使用会自动创建家长账号。请记住邮箱和密码。</p>
            </form>
          </div>

          <div className={`login-box ${tab === "teacher" ? "active" : ""}`}>
            <h2>老师登录</h2>
            <form action={teacherLogin} className="stack">
              <label>邮箱<input name="email" type="email" placeholder="teacher@example.com" required /></label>
              <label>密码<input name="password" type="password" required /></label>
              <button className="primary">登录老师端</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
