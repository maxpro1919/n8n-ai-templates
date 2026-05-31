import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "请输入邀请码" }, { status: 400 });
    }

    const adminCodes = (process.env.ADMIN_CODES || "").split(",").map(s => s.trim()).filter(Boolean);
    const memberCodes = (process.env.MEMBER_CODES || "").split(",").map(s => s.trim()).filter(Boolean);

    if (adminCodes.includes(code)) {
      return NextResponse.json({ role: "admin" });
    }
    if (memberCodes.includes(code)) {
      return NextResponse.json({ role: "member" });
    }

    return NextResponse.json({ error: "邀请码无效" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}
