"use client";

import { useEffect, useMemo, useState } from "react";
import type { StockQuote } from "@/lib/stocks";

type MarketPayload = {
  quotes: StockQuote[];
  summary: {
    gainers: number;
    losers: number;
    turnover: number;
    averageChange: number;
  };
  updatedAt: string;
};

function money(value: number) {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)} 亿`;
  }

  return value.toLocaleString("zh-CN");
}

function signed(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function StockDashboard() {
  const [market, setMarket] = useState<MarketPayload | null>(null);
  const [question, setQuestion] = useState("请基于当前自选股，指出今天值得重点跟踪的风险和机会。");
  const [analysis, setAnalysis] = useState("等待分析。");
  const [loading, setLoading] = useState(false);

  async function loadMarket() {
    const response = await fetch("/api/stocks");
    if (response.ok) {
      setMarket((await response.json()) as MarketPayload);
    }
  }

  useEffect(() => {
    loadMarket();
  }, []);

  const sortedQuotes = useMemo(() => {
    return [...(market?.quotes ?? [])].sort((a, b) => b.changePercent - a.changePercent);
  }, [market]);

  async function analyze() {
    setLoading(true);
    setAnalysis("正在分析...");

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question, quotes: market?.quotes ?? [] })
    });

    const payload = (await response.json()) as { analysis?: string; error?: string };
    setAnalysis(payload.analysis ?? payload.error ?? "分析失败");
    setLoading(false);
  }

  async function logout() {
    await fetch("/api/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <h1 className="brand-title">A股 AI 研究台</h1>
            <p className="brand-subtitle">
              免费行情源 · OpenAI 分析 · 私人小范围访问
            </p>
          </div>
        </div>
        <div className="top-actions">
          <button className="button secondary" type="button" onClick={loadMarket}>
            刷新
          </button>
          <button className="button secondary" type="button" onClick={logout}>
            退出
          </button>
        </div>
      </header>

      <section className="layout">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">自选股行情</h2>
              <p className="panel-note">
                更新时间：{market ? new Date(market.updatedAt).toLocaleString("zh-CN") : "加载中"}
              </p>
            </div>
          </div>

          <div className="market-grid">
            <div className="metric">
              <div className="metric-label">平均涨跌</div>
              <div className={market && market.summary.averageChange >= 0 ? "metric-value gain" : "metric-value loss"}>
                {market ? signed(market.summary.averageChange) : "--"}
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">上涨数量</div>
              <div className="metric-value gain">{market?.summary.gainers ?? "--"}</div>
            </div>
            <div className="metric">
              <div className="metric-label">下跌数量</div>
              <div className="metric-value loss">{market?.summary.losers ?? "--"}</div>
            </div>
            <div className="metric">
              <div className="metric-label">合计成交额</div>
              <div className="metric-value">{market ? money(market.summary.turnover) : "--"}</div>
            </div>
          </div>

          <table className="stock-table">
            <thead>
              <tr>
                <th>股票</th>
                <th>最新价</th>
                <th>涨跌幅</th>
                <th>成交额</th>
                <th>成交量</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotes.map((quote) => (
                <tr key={quote.code}>
                  <td>
                    <strong>{quote.name}</strong>
                    <div className="stock-code">{quote.code}</div>
                  </td>
                  <td>{quote.price.toFixed(2)}</td>
                  <td className={quote.changePercent >= 0 ? "gain" : "loss"}>{signed(quote.changePercent)}</td>
                  <td>{money(quote.turnover)}</td>
                  <td>{quote.volume.toLocaleString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">AI 分析</h2>
              <p className="panel-note">输出仅用于研究，不构成投资建议。</p>
            </div>
          </div>
          <div className="analysis">
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
            <div style={{ marginTop: 12 }}>
              <button className="button" type="button" onClick={analyze} disabled={loading}>
                {loading ? "分析中" : "生成分析"}
              </button>
            </div>
            <div className="analysis-result">{analysis}</div>
            <div className="risk">
              风险提示：行情数据来自免费接口，可能延迟、缺失或变更。AI 输出可能出错，请结合公告、财报、交易规则和个人风险承受能力独立判断。
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
