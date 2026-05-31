import { Highlight } from "@/lib/supabase";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export default function HighlightCard({ item }: { item: Highlight }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className={`tag-${item.tag} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
          {item.tag}
        </span>
        {item.source && (
          <span className="text-xs text-gray-400 truncate">{item.source}</span>
        )}
        {item.source_type === "batch" && (
          <span className="text-xs text-gray-300">批量</span>
        )}
      </div>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
        {item.content}
      </p>
      {item.note && (
        <p className="text-xs text-gray-500 mt-2 italic">{item.note}</p>
      )}
      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
        {item.sender_name && (
          <>
            <span className="font-medium text-gray-500">{item.sender_name}</span>
            {item.raw_timestamp && <span>({item.raw_timestamp.slice(5, 16)})</span>}
            <span>·</span>
          </>
        )}
        {item.submitted_by && !item.sender_name && (
          <>
            <span>{item.submitted_by}</span>
            <span>·</span>
          </>
        )}
        <span>{timeAgo(item.created_at)}</span>
      </div>
    </div>
  );
}
