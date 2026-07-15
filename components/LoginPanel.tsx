import { accountLogin } from "@/app/actions";

type LoginPanelProps = {
  role?: string;
  error?: string;
};

const roles = [
  {
    value: "parent",
    label: "家长",
    help: "给孩子填写未来 8 周可补课时间。"
  },
{
  value: "teacher",
  label: "Teacher（老师）",
  help: "UK teachers fill in their available teaching times.（英国老师填写自己的可上课时间。）"
},
  {
    value: "admin",
    label: "管理员",
    help: "查看匹配结果、确认课程、导出 Excel。"
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
      <section className="login-card single-login-card">
<p className="eyebrow">武博留学</p>
<h1>武博留学补课系统</h1>
        <p className="muted">
          家长、老师、管理员都在这里用邮箱和密码登录。先选择身份，再输入账号。
        </p>

        {error ? <div className="alert">{error}</div> : null}

        <form action={accountLogin} className="stack login-form">
          <label>
            邮箱
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="请输入邮箱"
              required
            />
          </label>

          <label>
            密码
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              minLength={6}
              required
            />
          </label>

          <fieldset className="role-picker">
            <legend>登录身份</legend>

            {roles.map((item) => (
              <label key={item.value} className="role-option">
                <input
                  type="radio"
                  name="role"
                  value={item.value}
                  defaultChecked={defaultRole === item.value}
                />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.help}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <button className="primary" type="submit">
            登录 / 注册
          </button>

          <p className="muted small">
            家长和老师第一次使用会自动创建账号。管理员账号需要先由你在 Supabase 后台授权。
          </p>
        </form>
      </section>
    </main>
  );
}
