import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, quotes } = (await request.json()) as {
    question?: string;
    quotes?: unknown;
  };

  if (!question) {
    return NextResponse.json({ error: "请输入要分析的问题" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        analysis:
          "还没有配置 OPENAI_API_KEY。请先在 .env.local 中填入 OpenAI API Key，然后重启开发服务器。"
      },
      { status: 200 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "你是一个谨慎的 A 股研究助手。只做信息整理、风险分析和研究框架，不承诺收益，不给出确定性买卖指令。输出中文。"
        },
        {
          role: "user",
          content: `当前自选股行情 JSON：${JSON.stringify(quotes ?? [])}\n\n用户问题：${question}\n\n请按：市场观察、个股线索、风险点、下一步需要核实的数据，四段回答。`
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: `OpenAI API 请求失败：${detail.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const analysis =
    data.output_text ??
    data.output?.flatMap((item) => item.content ?? []).map((content) => content.text).join("\n") ??
    "没有收到可展示的分析结果。";

  return NextResponse.json({ analysis });
}
