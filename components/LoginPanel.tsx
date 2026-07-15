import { accountLogin } from "@/app/actions";

type LoginPanelProps = {
  role?: string;
  error?: string;
};

const text = {
  title: "\u6691\u671f\u8ba2\u8bfe\u6392\u8bfe\u7cfb\u7edf",
  subtitle:
    "\u5bb6\u957f\u3001\u8001\u5e08\u3001\u7ba1\u7406\u5458\u90fd\u5728\u8fd9\u91cc\u7528\u90ae\u7bb1\u548c\u5bc6\u7801\u767b\u5f55\u3002\u5148\u9009\u62e9\u8eab\u4efd\uff0c\u518d\u8f93\u5165\u8d26\u53f7\u3002",
  email: "\u90ae\u7bb1",
  emailPlaceholder: "\u8bf7\u8f93\u5165\u90ae\u7bb1",
  password: "\u5bc6\u7801",
  passwordPlaceholder: "\u8bf7\u8f93\u5165\u5bc6\u7801",
  roleLegend: "\u767b\u5f55\u8eab\u4efd",
  submit: "\u767b\u5f55 / \u6ce8\u518c",
  note:
    "\u5bb6\u957f\u548c\u8001\u5e08\u7b2c\u4e00\u6b21\u4f7f\u7528\u4f1a\u81ea\u52a8\u521b\u5efa\u8d26\u53f7\u3002\u7ba1\u7406\u5458\u8d26\u53f7\u9700\u8981\u5148\u7531\u4f60\u5728 Supabase \u540e\u53f0\u6388\u6743\u3002"
};

const roles = [
  {
    value: "parent",
    label: "\u5bb6\u957f",
    help: "\u7ed9\u5b69\u5b50\u586b\u5199\u672a\u6765 8 \u5468\u53ef\u8865\u8bfe\u65f6\u95f4\u3002"
  },
  {
    value: "teacher",
    label: "\u8001\u5e08",
    help: "\u82f1\u56fd\u8001\u5e08\u586b\u5199\u81ea\u5df1\u7684\u53ef\u4e0a\u8bfe\u65f6\u95f4\u3002"
  },
  {
    value: "admin",
    label: "\u7ba1\u7406\u5458",
    help: "\u67e5\u770b\u5339\u914d\u7ed3\u679c\u3001\u786e\u8ba4\u8bfe\u7a0b\u3001\u5bfc\u51fa Excel\u3002"
  }
];

function getDefaultRole(role?: string) {
  if (role === "teacher" || role === "admin") {
    return role;
  }

  return "parent";
}

export function LoginPanel({ role, error }: LoginPanelProps) {
  const defaultRole = getDefaultRole(role);

  return (
    <main className="login-page">
      <section className="login-card single-login-card">
        <p className="eyebrow">Summer Scheduler</p>
        <h1>{text.title}</h1>
        <p className="muted">{text.subtitle}</p>

        {error ? <div className="alert">{error}</div> : null}

        <form action={accountLogin} className="stack login-form">
          <label>
            {text.email}
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder={text.emailPlaceholder}
              required
            />
          </label>

          <label>
            {text.password}
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={text.passwordPlaceholder}
              minLength={6}
              required
            />
          </label>

          <fieldset className="role-picker">
            <legend>{text.roleLegend}</legend>
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
            {text.submit}
          </button>

          <p className="muted small">{text.note}</p>
        </form>
      </section>
    </main>
  );
}
