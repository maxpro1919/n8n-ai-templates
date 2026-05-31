import { NextRequest, NextResponse } from "next/server";
import { parseWeChatExport, getParseStats } from "@/lib/parse-wechat";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "请提供聊天记录文本" }, { status: 400 });
    }

    const messages = parseWeChatExport(text);
    const stats = getParseStats(messages);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "未识别到有效消息，请检查格式是否为微信导出的聊天记录", stats },
        { status: 400 }
      );
    }

    return NextResponse.json({ messages, stats });
  } catch {
    return NextResponse.json({ error: "解析失败" }, { status: 500 });
  }
}
