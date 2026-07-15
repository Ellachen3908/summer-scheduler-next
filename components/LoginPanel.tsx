import { accountLogin } from "@/app/actions";

type LoginPanelProps = {
  role?: string;
  error?: string;
};

const roles = [
  {
    value: "parent",
    label: "Parent（家长）",
    help: "Parents fill in children’s available make-up lesson times.（家长给孩子填写未来 8 周可补课时间。）"
  },
  {
    value: "teacher",
    label: "Tutor（老师）",
    help: "UK tutors fill in their available teaching times.（英国老师填写自己的可上课时间。）"
  },
  {
    value: "admin",
    label: "Admin（管理员）",
    help: "Admins view matches, confirm lessons, and export Excel.（管理员查看匹配结果、确认课程、导出 Excel。）"
  }
];

function getDefaultRole(role?: string) {
  if (role === "teacher" || role === "admin") return role;
  return "parent";
}

export function LoginPanel({ role, error }: LoginPanelProps) {
  const defaultRole = getDefaultRole(role);

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">武博留学</p>
        <h1>武博留学补课系统</h1>
        <p className="muted">
          Parents, tutors, and admins sign in here with email and password.
          （家长、老师、管理员都在这里用邮箱和密码登录。）
        </p>

        {error ? <div className="error-banner">{error}</div> : null}

        <form action={accountLogin} className="login-form">
          <label>
            Email（邮箱）
            <input
              name="email"
              type="email"
              placeholder="Enter email（请输入邮箱）"
              required
            />
          </label>

          <label>
            Password（密码）
            <input
              name="password"
              type="password"
              placeholder="Enter password（请输入密码）"
              minLength={6}
              required
            />
          </label>

          <fieldset className="role-options">
            <legend>Login Role（登录身份）</legend>

            {roles.map((item) => (
              <label key={item.value} className="role-option">
                <input
                  type="radio"
                  name="role"
                  value={item.value}
                  defaultChecked={item.value === defaultRole}
                />
                <strong>{item.label}</strong>
                <span>{item.help}</span>
              </label>
            ))}
          </fieldset>

          <button className="primary" type="submit">
            Log In / Sign Up（登录 / 注册）
          </button>
        </form>

        <p className="muted">
          Parent and tutor accounts are created automatically on first use.
          Admin accounts must be authorized in Supabase first.
          （家长和老师第一次使用会自动创建账号。管理员账号需要先在 Supabase 后台授权。）
        </p>
      </section>
    </main>
  );
}
