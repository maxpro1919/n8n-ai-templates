"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TAGS = ["资源", "通知", "经验", "吐槽", "其他"];

export default function SubmitPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [tag, setTag] = useState("");
  const [note, setNote] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !tag) return;

    setSubmitting(true);
    const { error } = await supabase.from("highlights").insert({
      content: content.trim(),
      source: source.trim() || null,
      tag,
      note: note.trim() || null,
      submitted_by: submittedBy.trim() || null,
    });

    if (error) {
      setToast("提交失败，请重试");
      setSubmitting(false);
      return;
    }

    setToast("添加成功");
    setTimeout(() => router.push("/"), 800);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-500 active:text-gray-800 text-lg"
          >
            ←
          </button>
          <h1 className="text-lg font-bold">添加精华</h1>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              精华内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="粘贴你看到的有价值的消息..."
              rows={5}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              来源群名
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="例: Python学习群"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              标签 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tag === t
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 active:bg-gray-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              补充说明
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可选，补充背景信息"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submitted by */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              你的昵称
            </label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="可选"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!content.trim() || !tag || submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium text-sm active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "提交中..." : "提交精华"}
          </button>
        </form>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full toast-enter">
          {toast}
        </div>
      )}
    </div>
  );
}
