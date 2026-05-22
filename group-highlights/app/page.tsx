"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Highlight } from "@/lib/supabase";
import HighlightCard from "@/components/HighlightCard";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";

export default function Home() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("全部");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, []);

  async function fetchHighlights() {
    const { data, error } = await supabase
      .from("highlights")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHighlights(data);
    }
    setLoading(false);
  }

  const filtered = highlights.filter((item) => {
    const matchTag = tag === "全部" || item.tag === tag;
    const matchSearch =
      !search ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.source && item.source.toLowerCase().includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-center">群精华板</h1>
          <p className="text-xs text-gray-400 text-center mt-0.5">
            群里好东西，别丢了
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} />
        <TagFilter selected={tag} onChange={setTag} />

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            加载中...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {highlights.length === 0
              ? "还没有精华，点击右下角添加第一条"
              : "没有找到匹配的内容"}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <HighlightCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <Link
        href="/submit"
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light active:bg-blue-700 transition-colors"
      >
        +
      </Link>
    </div>
  );
}
