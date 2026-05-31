import * as lark from "@larksuiteoapi/node-sdk";
import type { Section } from "./llm";

const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID!,
  appSecret: process.env.FEISHU_APP_SECRET!,
});

export async function createDocument(
  title: string
): Promise<{ documentId: string; url: string }> {
  const res = await client.docx.v1.document.create({
    data: { title },
  });

  if (!res.data?.document) {
    throw new Error("创建飞书文档失败");
  }

  const documentId = res.data.document.document_id!;
  const url = `https://feishu.cn/docx/${documentId}`;

  return { documentId, url };
}

function makeTextBlock(text: string, bold = false) {
  return {
    block_type: 2 as const,
    text: {
      elements: [
        {
          text_run: {
            content: text,
            ...(bold ? { text_element_style: { bold: true } } : {}),
          },
        },
      ],
    },
  };
}

function makeHeadingBlock(text: string) {
  return {
    block_type: 3 as const,
    heading2: {
      elements: [{ text_run: { content: text } }],
    },
  };
}

function makeDividerBlock() {
  return { block_type: 22 } as const;
}

export async function addContentBlocks(
  documentId: string,
  title: string,
  sections: Section[],
  dateRange?: { start: string; end: string }
) {
  // 文档根 block ID 就是 documentId
  const blocks: Array<ReturnType<typeof makeTextBlock> | ReturnType<typeof makeHeadingBlock> | ReturnType<typeof makeDividerBlock>> = [];

  // 文档标题行
  const dateStr = dateRange
    ? ` (${dateRange.start.slice(0, 10)} ~ ${dateRange.end.slice(0, 10)})`
    : "";
  blocks.push(makeTextBlock(`📋 ${title}${dateStr}`, true));
  blocks.push(makeDividerBlock());

  for (const section of sections) {
    // 话题/人物标题
    blocks.push(makeHeadingBlock(section.title));

    // 摘要
    if (section.summary) {
      blocks.push(makeTextBlock(section.summary));
    }

    // 引用
    for (const h of section.highlights) {
      const timeStr = h.timestamp ? ` (${h.timestamp.slice(5, 16)})` : "";
      blocks.push(makeTextBlock(`${h.sender}${timeStr}`, true));
      blocks.push(makeTextBlock(`> ${h.quote}`));
    }

    blocks.push(makeDividerBlock());
  }

  // 批量添加（飞书 API 限制每次最多 50 个 block）
  const batchSize = 50;
  for (let i = 0; i < blocks.length; i += batchSize) {
    const batch = blocks.slice(i, i + batchSize);
    await client.docx.v1.documentBlockChildren.create({
      path: { document_id: documentId, block_id: documentId },
      params: { document_revision_id: -1 },
      data: {
        children: batch,
        index: -1, // 追加到末尾
      },
    });
  }
}

export async function setPublicReadPermission(documentId: string) {
  await client.drive.v1.permissionPublic.patch({
    path: { token: documentId },
    params: { type: "docx" },
    data: {
      link_share_entity: "anyone_readable",
      external_access: true,
    },
  });
}
