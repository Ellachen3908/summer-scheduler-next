import { sendParentOtp, teacherLogin, verifyParentOtp } from "@/app/actions";

export function LoginPanel({
  sent,
  phone,
  tab,
  error
}: {
  sent?: string;
  phone?: string;
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
                <label>手机号<input name="phone" placeholder="+8613800000000" defaultValue={phone} required /></label>
                <button className="primary">发送验证码</button>
                <p className="muted small">后期可在这里接微信授权登录。</p>
              </form>
            ) : (
              <form action={verifyParentOtp} className="stack">
                <input type="hidden" name="phone" value={phone} />
                <label>验证码<input name="token" inputMode="numeric" required /></label>
                <button className="primary">登录家长端</button>
              </form>
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
