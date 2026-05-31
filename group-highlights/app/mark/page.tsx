"use client";

import { useState } from "react";
import Link from "next/link";

const TAGS = ["资源", "通知", "经验", "吐槽", "其他"];

export default function MarkPage() {
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("");
  const [tag, setTag] = useState("其他");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              sender: sender || "匿名",
              timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
              content: content.trim(),
            },
          ],
          sourceType: "mark",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }
      setSaved(true);
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setContent("");
    setSender("");
    setTag("其他");
    setNote("");
    setSaved(false);
    setError("");
  }

  if (saved) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
            <Link href="/" className="text-gray-400 text-sm mr-3">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold">标记消息</h1>
          </div>
        </header>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <div className="text-lg font-medium">已收录</div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600"
            >
              继续标记
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              查看精华池
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-400 text-sm mr-3">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">标记消息</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-700">
          看到群里有价值的消息，粘贴到这里收藏
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">消息内容 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="粘贴消息原文..."
            className="w-full h-32 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">谁说的</label>
          <input
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="发送者昵称"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">标签</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`tag-${t} text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  tag === t ? "ring-2 ring-blue-400" : "opacity-60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">备注（可选）</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="补充说明"
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!content.trim() || saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40"
        >
          {saving ? "保存中..." : "收录"}
        </button>
      </main>
    </div>
  );
}
