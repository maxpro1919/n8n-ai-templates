import { NextRequest, NextResponse } from "next/server";
import { processMessages } from "@/lib/llm";
import { ParsedMessage } from "@/lib/parse-wechat";

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = (await req.json()) as {
      messages: ParsedMessage[];
      mode: "by-person" | "by-topic";
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "请提供消息列表" }, { status: 400 });
    }

    if (mode !== "by-person" && mode !== "by-topic") {
      return NextResponse.json(
        { error: "mode 必须是 by-person 或 by-topic" },
        { status: 400 }
      );
    }

    const result = await processMessages(messages, mode);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "处理失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
