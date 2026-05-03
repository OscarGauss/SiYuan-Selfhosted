#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express, { type Request, type Response } from "express";
import { randomUUID } from "node:crypto";

import { SiYuanClient, SiYuanError } from "./client.js";
import { registerNotebookTools } from "./tools/notebook.js";
import { registerFiletreeTools } from "./tools/filetree.js";
import { registerBlockTools } from "./tools/block.js";
import { registerAttrTools } from "./tools/attr.js";
import { registerSqlTools } from "./tools/sql.js";
import { registerTemplateTools } from "./tools/template.js";
import { registerFileTools } from "./tools/file.js";
import { registerExportTools } from "./tools/export.js";
import { registerNotificationTools } from "./tools/notification.js";
import { registerSystemTools } from "./tools/system.js";

const SERVER_NAME = "siyuan-mcp";
const SERVER_VERSION = "0.1.0";

function buildServer(client: SiYuanClient): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerNotebookTools(server, client);
  registerFiletreeTools(server, client);
  registerBlockTools(server, client);
  registerAttrTools(server, client);
  registerSqlTools(server, client);
  registerTemplateTools(server, client);
  registerFileTools(server, client);
  registerExportTools(server, client);
  registerNotificationTools(server, client);
  registerSystemTools(server, client);
  return server;
}

function readEnv(): {
  baseUrl: string;
  token: string;
  transport: "stdio" | "http";
  httpPort: number;
  httpHost: string;
  httpAuthToken: string | undefined;
} {
  const baseUrl = process.env.SIYUAN_BASE_URL?.trim() ?? "";
  const token = process.env.SIYUAN_API_TOKEN?.trim() ?? "";
  const transportRaw = (process.env.MCP_TRANSPORT?.trim().toLowerCase() ?? "stdio") as
    | "stdio"
    | "http";
  if (transportRaw !== "stdio" && transportRaw !== "http") {
    throw new Error(`MCP_TRANSPORT must be "stdio" or "http", got "${transportRaw}"`);
  }
  const httpPort = Number(process.env.MCP_HTTP_PORT ?? 3000);
  const httpHost = process.env.MCP_HTTP_HOST?.trim() || "0.0.0.0";
  const httpAuthToken = process.env.MCP_HTTP_AUTH_TOKEN?.trim() || undefined;
  return { baseUrl, token, transport: transportRaw, httpPort, httpHost, httpAuthToken };
}

async function runStdio(client: SiYuanClient): Promise<void> {
  const server = buildServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers stay alive until stdin closes; nothing more to do.
}

async function runHttp(
  client: SiYuanClient,
  host: string,
  port: number,
  authToken: string | undefined,
): Promise<void> {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  if (authToken) {
    app.use((req, res, next) => {
      if (req.path === "/healthz") return next();
      const header = req.headers.authorization ?? "";
      if (header !== `Bearer ${authToken}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      next();
    });
  }

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true, name: SERVER_NAME, version: SERVER_VERSION });
  });

  const transports = new Map<string, StreamableHTTPServerTransport>();

  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.header("mcp-session-id");
    let transport = sessionId ? transports.get(sessionId) : undefined;

    if (!transport) {
      if (sessionId) {
        res.status(404).json({
          jsonrpc: "2.0",
          error: { code: -32001, message: "Unknown session ID" },
          id: null,
        });
        return;
      }
      if (!isInitializeRequest(req.body)) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "First request must be initialize" },
          id: null,
        });
        return;
      }
      const newTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports.set(sid, newTransport);
        },
      });
      newTransport.onclose = () => {
        if (newTransport.sessionId) transports.delete(newTransport.sessionId);
      };
      const server = buildServer(client);
      await server.connect(newTransport);
      transport = newTransport;
    }

    await transport.handleRequest(req, res, req.body);
  });

  const handleSessionRequest = async (req: Request, res: Response) => {
    const sessionId = req.header("mcp-session-id");
    const transport = sessionId ? transports.get(sessionId) : undefined;
    if (!transport) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transport.handleRequest(req, res);
  };

  app.get("/mcp", handleSessionRequest);
  app.delete("/mcp", handleSessionRequest);

  await new Promise<void>((resolve) => {
    app.listen(port, host, () => {
      // eslint-disable-next-line no-console
      console.error(`siyuan-mcp listening on http://${host}:${port}/mcp`);
      resolve();
    });
  });
}

async function main(): Promise<void> {
  const env = readEnv();

  if (!env.baseUrl || !env.token) {
    console.error(
      "siyuan-mcp: SIYUAN_BASE_URL and SIYUAN_API_TOKEN must be set in the environment.",
    );
    process.exit(1);
  }

  const client = new SiYuanClient(env.baseUrl, env.token);

  if (env.transport === "stdio") {
    await runStdio(client);
  } else {
    await runHttp(client, env.httpHost, env.httpPort, env.httpAuthToken);
  }
}

main().catch((err) => {
  if (err instanceof SiYuanError) {
    console.error(`siyuan-mcp fatal: ${err.message}`);
  } else {
    console.error("siyuan-mcp fatal:", err);
  }
  process.exit(1);
});
