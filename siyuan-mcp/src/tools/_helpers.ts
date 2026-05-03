import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function ok(data: unknown): CallToolResult {
  let text: string;
  if (data === null || data === undefined) {
    text = "OK";
  } else if (typeof data === "string") {
    text = data;
  } else {
    try {
      text = JSON.stringify(data, null, 2);
    } catch {
      text = String(data);
    }
  }
  return { content: [{ type: "text", text }] };
}
