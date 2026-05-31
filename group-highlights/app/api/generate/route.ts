import { NextRequest, NextResponse } from "next/server";
import {
  createDocument,
  addContentBlocks,
  setPublicReadPermission,
} from "@/lib/feishu";
import type { Section } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { title, sections, dateRange } = (await req.json()) as {
      title: string;
      sections: Section[];
      dateRange?: { start: string; end: string };
    };

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json(
        { error: "请提供标题和内容" },
        { status: 400 }
      );
    }

    // 1. 创建文档
    const { documentId, url } = await createDocument(title);

    // 2. 写入内容
    await addContentBlocks(documentId, title, sections, dateRange);

    // 3. 设为公开可读
    await setPublicReadPermission(documentId);

    return NextResponse.json({ url, documentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
