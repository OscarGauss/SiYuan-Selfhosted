import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerAttrTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "set_block_attrs",
    {
      title: "Set block attributes",
      description:
        "Set custom attributes on a block. Custom attribute keys must start with 'custom-'.",
      inputSchema: {
        id: z.string().describe("Block ID"),
        attrs: z
          .record(z.string())
          .describe("Map of attribute name → value (custom keys must start with 'custom-')"),
      },
    },
    async ({ id, attrs }) =>
      ok(await client.post("/api/attr/setBlockAttrs", { id, attrs })),
  );

  server.registerTool(
    "get_block_attrs",
    {
      title: "Get block attributes",
      description: "Read all attributes of a block.",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/attr/getBlockAttrs", { id })),
  );
}
