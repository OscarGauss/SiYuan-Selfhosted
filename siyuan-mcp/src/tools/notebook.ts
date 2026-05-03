import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerNotebookTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "list_notebooks",
    {
      title: "List notebooks",
      description: "Return all notebooks (open and closed). No input.",
    },
    async () => ok(await client.post("/api/notebook/lsNotebooks")),
  );

  server.registerTool(
    "open_notebook",
    {
      title: "Open notebook",
      description: "Open a closed notebook by its ID.",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => ok(await client.post("/api/notebook/openNotebook", { notebook })),
  );

  server.registerTool(
    "close_notebook",
    {
      title: "Close notebook",
      description: "Close an open notebook by its ID.",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => ok(await client.post("/api/notebook/closeNotebook", { notebook })),
  );

  server.registerTool(
    "rename_notebook",
    {
      title: "Rename notebook",
      description: "Change the display name of a notebook.",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        name: z.string().describe("New notebook name"),
      },
    },
    async ({ notebook, name }) =>
      ok(await client.post("/api/notebook/renameNotebook", { notebook, name })),
  );

  server.registerTool(
    "create_notebook",
    {
      title: "Create notebook",
      description: "Create a new notebook with the given name.",
      inputSchema: { name: z.string().describe("Notebook name") },
    },
    async ({ name }) => ok(await client.post("/api/notebook/createNotebook", { name })),
  );

  server.registerTool(
    "remove_notebook",
    {
      title: "Remove notebook",
      description: "Permanently delete a notebook. This is destructive.",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => ok(await client.post("/api/notebook/removeNotebook", { notebook })),
  );

  server.registerTool(
    "get_notebook_conf",
    {
      title: "Get notebook configuration",
      description: "Fetch a notebook's configuration object.",
      inputSchema: { notebook: z.string().describe("Notebook ID") },
    },
    async ({ notebook }) => ok(await client.post("/api/notebook/getNotebookConf", { notebook })),
  );

  server.registerTool(
    "set_notebook_conf",
    {
      title: "Set notebook configuration",
      description: "Update the configuration of a notebook.",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        conf: z.record(z.unknown()).describe("Configuration object to merge"),
      },
    },
    async ({ notebook, conf }) =>
      ok(await client.post("/api/notebook/setNotebookConf", { notebook, conf })),
  );
}
