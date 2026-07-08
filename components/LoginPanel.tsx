import { sendParentOtp, teacherLogin } from "@/app/actions";

export function LoginPanel({
  sent,
  email,
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
            {!sent ? (
              <form action={sendParentOtp} className="stack">
                <label>邮箱<input name="email" type="email" placeholder="parent@example.com" defaultValue={email} required /></label>
                <button className="primary">发送登录链接</button>
                <p className="muted small">家长会收到一封邮件，点击邮件里的链接即可登录。</p>
              </form>
            ) : (
              <div className="stack">
                <p className="muted">登录链接已发送到：</p>
                <strong>{email}</strong>
                <p className="muted small">请打开邮箱，点击登录链接。</p>
                <a className="button" href="/login">重新发送</a>
              </div>
            )}
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
