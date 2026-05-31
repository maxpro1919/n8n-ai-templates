import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, sourceType } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "请提供消息列表" }, { status: 400 });
    }

    // 批量插入，每条消息作为一个 highlight
    const rows = messages.map(
      (msg: { sender: string; timestamp: string; content: string }) => ({
        content: msg.content,
        source: null, // 后续可以加群名
        tag: "其他", // 默认标签，后续可由 AI 自动分类
        note: null,
        submitted_by: null, // 后续接用户系统
        sender_name: msg.sender,
        raw_timestamp: msg.timestamp,
        source_type: sourceType || "batch",
        uploaded_by: null, // 后续接用户系统
      })
    );

    // Supabase 批量插入，每次最多 1000 条
    const batchSize = 500;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("highlights").insert(batch);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      inserted += batch.length;
    }

    return NextResponse.json({ count: inserted });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("highlights")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (tag && tag !== "全部") {
      query = query.eq("tag", tag);
    }
    if (search) {
      query = query.or(
        `content.ilike.%${search}%,sender_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ highlights: data || [] });
  } catch {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
