import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerTemplateTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "render_template",
    {
      title: "Render template",
      description:
        "Render a SiYuan template file against a target document. Returns the rendered Markdown content.",
      inputSchema: {
        id: z.string().describe("Target document block ID"),
        path: z
          .string()
          .describe(
            "Absolute path to the .md template file inside the workspace, e.g. '/data/templates/foo.md'",
          ),
      },
    },
    async ({ id, path }) =>
      ok(await client.post("/api/template/render", { id, path })),
  );

  server.registerTool(
    "render_sprig",
    {
      title: "Render Sprig template",
      description:
        "Evaluate a Sprig (Go template) expression. Useful for date formatting like '{{now | date \"2006-01-02\"}}'.",
      inputSchema: { template: z.string().describe("Sprig template string") },
    },
    async ({ template }) =>
      ok(await client.post("/api/template/renderSprig", { template })),
  );
}
