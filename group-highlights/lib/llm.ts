import { ParsedMessage } from "./parse-wechat";

export interface Section {
  title: string; // 话题名或人名
  summary: string;
  participants: string[];
  highlights: {
    sender: string;
    quote: string;
    timestamp: string;
  }[];
}

export interface ProcessResult {
  mode: "by-person" | "by-topic";
  sections: Section[];
}

const BY_TOPIC_PROMPT = `你是群聊精华整理助手。给定一段微信群聊天记录，请：
1. 识别 3-7 个主要讨论话题
2. 将消息归类到对应话题
3. 每个话题提取：标题、参与者、关键观点摘要（1-2句话）、2-5 条最有价值的原文引用
4. 引用必须保留原文，不要改写
5. 以 JSON 格式输出

输出格式：
{
  "sections": [
    {
      "title": "话题标题",
      "summary": "简短摘要",
      "participants": ["参与者1", "参与者2"],
      "highlights": [
        { "sender": "张三", "quote": "原文引用", "timestamp": "2024-01-15 14:30:25" }
      ]
    }
  ]
}`;

const BY_PERSON_PROMPT = `你是群聊精华整理助手。给定一段微信群聊天记录，请按发言者分组整理：
1. 每个发言者提取：姓名、发言主题概述（1-2句话）、2-5 条最有价值的原文引用
2. 引用必须保留原文，不要改写
3. 只收录发言有实质内容的人（跳过只发"嗯""好的""+1"之类的人）
4. 以 JSON 格式输出

输出格式：
{
  "sections": [
    {
      "title": "张三",
      "summary": "主要讨论了...",
      "participants": ["张三"],
      "highlights": [
        { "sender": "张三", "quote": "原文引用", "timestamp": "2024-01-15 14:30:25" }
      ]
    }
  ]
}`;

function messagesToText(messages: ParsedMessage[]): string {
  return messages
    .map((m) => `${m.sender} ${m.timestamp}\n${m.content}`)
    .join("\n\n");
}

export async function processMessages(
  messages: ParsedMessage[],
  mode: "by-person" | "by-topic"
): Promise<ProcessResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }

  const systemPrompt = mode === "by-topic" ? BY_TOPIC_PROMPT : BY_PERSON_PROMPT;
  const userContent = messagesToText(messages);

  // 如果消息太长，截断到约 8000 字
  const maxChars = 8000;
  const truncated =
    userContent.length > maxChars
      ? userContent.slice(0, maxChars) + "\n\n[消息已截断，以上为部分内容]"
      : userContent;

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: truncated },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DeepSeek 返回为空");
  }

  try {
    const parsed = JSON.parse(content);
    return {
      mode,
      sections: parsed.sections || [],
    };
  } catch {
    throw new Error("DeepSeek 返回格式错误，请重试");
  }
}
