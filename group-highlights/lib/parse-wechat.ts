export interface ParsedMessage {
  sender: string;
  timestamp: string; // "YYYY-MM-DD HH:MM:SS"
  content: string;
  index: number;
}

// 微信导出聊天记录的消息头格式: "姓名 2024-01-15 14:30:25"
const MSG_HEADER_RE = /^(.+?)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})$/;

// 系统消息前缀，跳过
const SYSTEM_PREFIXES = [
  "以下是新消息",
  "你已添加了",
  "以上是打招呼的内容",
  "——",
  "撤回了一条消息",
  "你撤回了一条消息",
  "群公告",
  "修改群名为",
  "邀请你加入了群聊",
  "你邀请",
  "加入了群聊",
  "移出了群聊",
  "修改了群名称",
  "你成为了群管理员",
  "你被取消了群管理员",
];

function isSystemMessage(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return true;
  // 纯媒体占位符
  if (/^\[(图片|视频|文件|语音|动画表情|链接|位置|红包|转账|名片|接龙|投票|小程序)\]$/.test(trimmed)) {
    return true;
  }
  return SYSTEM_PREFIXES.some((p) => trimmed.startsWith(p));
}

export function parseWeChatExport(text: string): ParsedMessage[] {
  const lines = text.split(/\r?\n/);
  const messages: ParsedMessage[] = [];
  let current: { sender: string; timestamp: string; lines: string[] } | null = null;

  for (const line of lines) {
    const match = line.match(MSG_HEADER_RE);
    if (match) {
      // 新消息头，保存上一条
      if (current) {
        const content = current.lines.join("\n").trim();
        if (!isSystemMessage(content)) {
          messages.push({
            sender: current.sender,
            timestamp: current.timestamp,
            content,
            index: messages.length,
          });
        }
      }
      current = { sender: match[1], timestamp: match[2], lines: [] };
    } else if (current) {
      // 多行消息，追加到当前消息
      current.lines.push(line);
    }
    // 没有 current 且不是消息头的行（文件开头的杂行），跳过
  }

  // 最后一条
  if (current) {
    const content = current.lines.join("\n").trim();
    if (!isSystemMessage(content)) {
      messages.push({
        sender: current.sender,
        timestamp: current.timestamp,
        content,
        index: messages.length,
      });
    }
  }

  return messages;
}

export function getParseStats(messages: ParsedMessage[]) {
  const senders = [...new Set(messages.map((m) => m.sender))];
  const timeRange =
    messages.length > 0
      ? {
          start: messages[0].timestamp,
          end: messages[messages.length - 1].timestamp,
        }
      : null;
  return { total: messages.length, senders, timeRange };
}
