import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerExportTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "export_md_content",
    {
      title: "Export document as Markdown",
      description: "Return the full Markdown content and human-readable path of a document.",
      inputSchema: { id: z.string().describe("Document block ID") },
    },
    async ({ id }) => ok(await client.post("/api/export/exportMdContent", { id })),
  );
}
