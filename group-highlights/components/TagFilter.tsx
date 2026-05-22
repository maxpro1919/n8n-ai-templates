"use client";

const TAGS = ["全部", "资源", "通知", "经验", "吐槽", "其他"];

export default function TagFilter({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (tag: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === tag
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 active:bg-gray-100"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
