import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerSqlTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "sql_query",
    {
      title: "SQL query",
      description:
        "Run a SQL statement against SiYuan's embedded SQLite. Returns rows as JSON. Read-only queries are safest; mutations may corrupt the index.",
      inputSchema: { stmt: z.string().describe("SQL statement") },
    },
    async ({ stmt }) => ok(await client.post("/api/query/sql", { stmt })),
  );
}
