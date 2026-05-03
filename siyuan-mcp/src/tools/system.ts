import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerSystemTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "boot_progress",
    {
      title: "Boot progress",
      description: "Return SiYuan boot progress and status message.",
    },
    async () => ok(await client.post("/api/system/bootProgress")),
  );

  server.registerTool(
    "version",
    {
      title: "SiYuan version",
      description: "Return the running SiYuan version string.",
    },
    async () => ok(await client.post("/api/system/version")),
  );

  server.registerTool(
    "current_time",
    {
      title: "Server time",
      description: "Return the SiYuan server's current Unix timestamp in milliseconds.",
    },
    async () => ok(await client.post("/api/system/currentTime")),
  );
}
