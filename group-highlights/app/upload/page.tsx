"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ParsedMessage } from "@/lib/parse-wechat";

type Step = "input" | "parsed" | "saving";

interface ParseResult {
  messages: ParsedMessage[];
  stats: {
    total: number;
    senders: string[];
    timeRange: { start: string; end: string } | null;
  };
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(reader.result as string);
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleParse() {
    setError("");
    if (!text.trim()) {
      setError("请粘贴聊天记录或上传文件");
      return;
    }
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "解析失败");
        return;
      }
      setResult(data);
      setStep("parsed");
    } catch {
      setError("网络错误，请重试");
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setStep("saving");
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: result.messages,
          sourceType: "batch",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        setStep("parsed");
        return;
      }
      setSavedCount(data.count || result.messages.length);
    } catch {
      setError("网络错误，请重试");
      setStep("parsed");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setText("");
    setResult(null);
    setError("");
    setStep("input");
    setSavedCount(0);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-400 text-sm mr-3">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">上传聊天记录</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {/* Step 1: Input */}
        {step === "input" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium mb-1">如何获取聊天记录？</p>
              <p className="text-blue-600">
                微信 → 群聊 → 右上角 ··· → 聊天记录 → 导出聊天记录 →
                选择「迁移聊天记录到另一台设备」→ 生成 .txt 文件
              </p>
            </div>

            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".txt"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <div className="text-3xl mb-1">📄</div>
                <div className="text-sm">点击上传 .txt 文件</div>
              </button>
            </div>

            <div className="text-center text-gray-400 text-xs">或</div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="直接粘贴微信聊天记录..."
              className="w-full h-48 border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleParse}
              disabled={!text.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40 active:bg-blue-700 transition-colors"
            >
              解析
            </button>
          </div>
        )}

        {/* Step 2: Parsed result */}
        {step === "parsed" && result && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-green-700 font-medium mb-2">解析成功</div>
              <div className="text-sm text-green-600 space-y-1">
                <p>共 <span className="font-bold">{result.stats.total}</span> 条消息</p>
                <p>
                  参与者：{result.stats.senders.slice(0, 8).join("、")}
                  {result.stats.senders.length > 8 && ` 等${result.stats.senders.length}人`}
                </p>
                {result.stats.timeRange && (
                  <p>
                    时间：{result.stats.timeRange.start.slice(0, 10)} ~ {result.stats.timeRange.end.slice(0, 10)}
                  </p>
                )}
              </div>
            </div>

            {/* Preview: first 5 messages */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500">预览（前5条）</div>
              {result.messages.slice(0, 5).map((msg) => (
                <div key={msg.index} className="bg-white border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-800">{msg.sender}</span>
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                    {msg.content}
                  </p>
                </div>
              ))}
              {result.messages.length > 5 && (
                <p className="text-xs text-gray-400 text-center">
                  还有 {result.messages.length - 5} 条消息...
                </p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-600 active:bg-gray-50 transition-colors"
              >
                重新上传
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium active:bg-blue-700 transition-colors"
              >
                收录到精华池
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Saving / Done */}
        {step === "saving" && (
          <div className="text-center py-12">
            {saving ? (
              <div className="text-gray-400">保存中...</div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl">✅</div>
                <div className="text-lg font-medium">
                  成功收录 {savedCount} 条消息
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 border border-gray-200 rounded-lg text-gray-600"
                  >
                    继续上传
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
                  >
                    查看精华池
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
