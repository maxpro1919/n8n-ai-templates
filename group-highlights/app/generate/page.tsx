"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, Highlight } from "@/lib/supabase";
import type { Section, ProcessResult } from "@/lib/llm";

type Step = "select" | "mode" | "processing" | "review" | "generating" | "done";

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("select");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"by-person" | "by-topic">("by-topic");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [editedSections, setEditedSections] = useState<Section[]>([]);
  const [docUrl, setDocUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, []);

  async function fetchHighlights() {
    const { data } = await supabase
      .from("highlights")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data) setHighlights(data);
    setLoading(false);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function selectAll() {
    if (selected.size === highlights.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(highlights.map((h) => h.id)));
    }
  }

  async function handleProcess() {
    if (selected.size === 0) return;
    setStep("processing");
    setError("");

    const selectedMessages = highlights
      .filter((h) => selected.has(h.id))
      .map((h) => ({
        sender: h.sender_name || h.submitted_by || "匿名",
        timestamp: h.raw_timestamp || h.created_at,
        content: h.content,
        index: 0,
      }));

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: selectedMessages, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "处理失败");
        setStep("mode");
        return;
      }
      setResult(data);
      setEditedSections(data.sections);
      setStep("review");
    } catch {
      setError("网络错误");
      setStep("mode");
    }
  }

  async function handleGenerate() {
    setStep("generating");
    setError("");

    const first = highlights.find((h) => selected.has(h.id));
    const last = [...highlights].reverse().find((h) => selected.has(h.id));
    const dateRange =
      first && last
        ? {
            start: last.raw_timestamp || last.created_at,
            end: first.raw_timestamp || first.created_at,
          }
        : undefined;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `群精华整理`,
          sections: editedSections,
          dateRange,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "生成失败");
        setStep("review");
        return;
      }
      setDocUrl(data.url);
      setStep("done");
    } catch {
      setError("网络错误");
      setStep("review");
    }
  }

  function updateSectionTitle(idx: number, title: string) {
    const next = [...editedSections];
    next[idx] = { ...next[idx], title };
    setEditedSections(next);
  }

  function updateSectionSummary(idx: number, summary: string) {
    const next = [...editedSections];
    next[idx] = { ...next[idx], summary };
    setEditedSections(next);
  }

  function removeSection(idx: number) {
    setEditedSections(editedSections.filter((_, i) => i !== idx));
  }

  function removeHighlight(sectionIdx: number, highlightIdx: number) {
    const next = [...editedSections];
    next[sectionIdx] = {
      ...next[sectionIdx],
      highlights: next[sectionIdx].highlights.filter((_, i) => i !== highlightIdx),
    };
    setEditedSections(next);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="text-gray-400 text-sm mr-3">
            ← 返回
          </Link>
          <h1 className="text-xl font-bold">生成飞书文档</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4">
        {/* Step 1: Select highlights */}
        {step === "select" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                已选 {selected.size} / {highlights.length} 条
              </span>
              <button
                onClick={selectAll}
                className="text-sm text-blue-600"
              >
                {selected.size === highlights.length ? "取消全选" : "全选"}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">加载中...</div>
            ) : highlights.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                精华池为空，请先上传聊天记录
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {highlights.map((h) => (
                  <label
                    key={h.id}
                    className={`block bg-white border rounded-lg p-3 cursor-pointer transition-colors ${
                      selected.has(h.id)
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(h.id)}
                      onChange={() => toggleSelect(h.id)}
                      className="mr-2"
                    />
                    <span className="text-xs text-gray-400 mr-2">
                      {h.sender_name || h.submitted_by || "匿名"}
                    </span>
                    <span className="text-sm text-gray-700 line-clamp-2">
                      {h.content}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <button
              onClick={() => setStep("mode")}
              disabled={selected.size === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40"
            >
              下一步：选择模式
            </button>
          </div>
        )}

        {/* Step 2: Choose mode */}
        {step === "mode" && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              已选 {selected.size} 条消息
            </div>

            <button
              onClick={() => {
                setMode("by-topic");
                handleProcess();
              }}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50"
            >
              <div className="font-medium mb-1">📌 按话题整理</div>
              <div className="text-sm text-gray-500">
                AI 自动识别讨论话题，按话题归类消息
              </div>
            </button>

            <button
              onClick={() => {
                setMode("by-person");
                handleProcess();
              }}
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50"
            >
              <div className="font-medium mb-1">👤 按人物整理</div>
              <div className="text-sm text-gray-500">
                按发言者分组，提取每个人的精华发言
              </div>
            </button>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={() => setStep("select")}
              className="w-full py-2 text-gray-400 text-sm"
            >
              返回选择
            </button>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="text-center py-16 space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <div className="text-gray-500">AI 正在整理...</div>
            <div className="text-xs text-gray-400">
              通常需要 10-30 秒
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === "review" && (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              AI 整理完成，请检查内容。你可以编辑标题、摘要，或删除不需要的条目。
            </div>

            <div className="space-y-3">
              {editedSections.map((section, si) => (
                <div
                  key={si}
                  className="bg-white border border-gray-100 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <input
                      value={section.title}
                      onChange={(e) => updateSectionTitle(si, e.target.value)}
                      className="font-medium text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => removeSection(si)}
                      className="text-gray-300 hover:text-red-400 ml-2 text-lg"
                    >
                      ×
                    </button>
                  </div>

                  <textarea
                    value={section.summary}
                    onChange={(e) => updateSectionSummary(si, e.target.value)}
                    className="w-full text-sm text-gray-600 border border-gray-100 rounded p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                    rows={2}
                  />

                  <div className="space-y-2">
                    {section.highlights.map((h, hi) => (
                      <div
                        key={hi}
                        className="flex items-start gap-2 text-sm group"
                      >
                        <span className="text-gray-400 shrink-0 mt-0.5">
                          {h.sender}
                        </span>
                        <span className="text-gray-600 flex-1">
                          {h.quote}
                        </span>
                        <button
                          onClick={() => removeHighlight(si, hi)}
                          className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("mode")}
                className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-600"
              >
                重新整理
              </button>
              <button
                onClick={handleGenerate}
                disabled={editedSections.length === 0}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-40"
              >
                生成飞书文档
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Generating */}
        {step === "generating" && (
          <div className="text-center py-16 space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <div className="text-gray-500">正在生成飞书文档...</div>
          </div>
        )}

        {/* Step 6: Done */}
        {step === "done" && (
          <div className="text-center py-12 space-y-4">
            <div className="text-4xl">✅</div>
            <div className="text-lg font-medium">飞书文档已生成</div>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
            >
              打开文档
            </a>
            <div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(docUrl);
                }}
                className="text-sm text-blue-600"
              >
                复制链接
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              请将链接发到群公告，让大家看到精华整理
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
