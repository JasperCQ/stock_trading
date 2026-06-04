"use client";

import { FormEvent, useState } from "react";

export function LoginPanel() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "登录失败");
      return;
    }

    window.location.reload();
  }

  return (
    <main className="login-wrap">
      <form className="login-panel" onSubmit={handleSubmit}>
        <h1>A股 AI 研究台</h1>
        <p>这是私人研究工具。输入访问密码后，可以查看自选股行情并调用 OpenAI 做辅助分析。</p>
        <div className="field">
          <label htmlFor="password">访问密码</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button className="button" type="submit" disabled={loading}>
          {loading ? "正在进入" : "进入研究台"}
        </button>
      </form>
    </main>
  );
}
