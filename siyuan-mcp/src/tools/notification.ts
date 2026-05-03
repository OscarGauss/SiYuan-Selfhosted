import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerNotificationTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "push_msg",
    {
      title: "Push info notification",
      description: "Show an informational toast in the SiYuan UI.",
      inputSchema: {
        msg: z.string().describe("Message text"),
        timeout: z.number().int().positive().optional().describe("Milliseconds before auto-dismiss"),
      },
    },
    async (args) => ok(await client.post("/api/notification/pushMsg", args)),
  );

  server.registerTool(
    "push_err_msg",
    {
      title: "Push error notification",
      description: "Show an error toast in the SiYuan UI.",
      inputSchema: {
        msg: z.string().describe("Message text"),
        timeout: z.number().int().positive().optional().describe("Milliseconds before auto-dismiss"),
      },
    },
    async (args) => ok(await client.post("/api/notification/pushErrMsg", args)),
  );
}
