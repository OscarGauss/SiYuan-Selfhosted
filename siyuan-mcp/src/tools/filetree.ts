import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

export function registerFiletreeTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "create_doc_with_md",
    {
      title: "Create document from Markdown",
      description:
        "Create a new document from Markdown content. Returns the new document's block ID.",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z
          .string()
          .describe(
            'Human-readable path starting with "/", e.g. "/Inbox/Today". Intermediate folders are created automatically.',
          ),
        markdown: z.string().describe("Document body in Markdown"),
      },
    },
    async ({ notebook, path, markdown }) =>
      ok(await client.post("/api/filetree/createDocWithMd", { notebook, path, markdown })),
  );

  server.registerTool(
    "rename_doc",
    {
      title: "Rename document by path",
      description: "Rename a document identified by its storage path.",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z.string().describe("Storage path of the doc, e.g. '/<id>.sy'"),
        title: z.string().describe("New title"),
      },
    },
    async ({ notebook, path, title }) =>
      ok(await client.post("/api/filetree/renameDoc", { notebook, path, title })),
  );

  server.registerTool(
    "rename_doc_by_id",
    {
      title: "Rename document by ID",
      description: "Rename a document identified by its block ID.",
      inputSchema: {
        id: z.string().describe("Document block ID"),
        title: z.string().describe("New title"),
      },
    },
    async ({ id, title }) =>
      ok(await client.post("/api/filetree/renameDocByID", { id, title })),
  );

  server.registerTool(
    "remove_doc",
    {
      title: "Remove document by path",
      description: "Delete a document identified by its storage path. Destructive.",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z.string().describe("Storage path of the doc, e.g. '/<id>.sy'"),
      },
    },
    async ({ notebook, path }) =>
      ok(await client.post("/api/filetree/removeDoc", { notebook, path })),
  );

  server.registerTool(
    "remove_doc_by_id",
    {
      title: "Remove document by ID",
      description: "Delete a document identified by its block ID. Destructive.",
      inputSchema: { id: z.string().describe("Document block ID") },
    },
    async ({ id }) => ok(await client.post("/api/filetree/removeDocByID", { id })),
  );

  server.registerTool(
    "move_docs",
    {
      title: "Move documents by path",
      description: "Move documents to a new notebook/path.",
      inputSchema: {
        fromPaths: z.array(z.string()).describe("Storage paths to move"),
        toNotebook: z.string().describe("Destination notebook ID"),
        toPath: z.string().describe("Destination storage path"),
      },
    },
    async ({ fromPaths, toNotebook, toPath }) =>
      ok(await client.post("/api/filetree/moveDocs", { fromPaths, toNotebook, toPath })),
  );

  server.registerTool(
    "move_docs_by_id",
    {
      title: "Move documents by ID",
      description: "Move documents to a new parent identified by ID.",
      inputSchema: {
        fromIDs: z.array(z.string()).describe("Document block IDs to move"),
        toID: z.string().describe("Destination parent block ID"),
      },
    },
    async ({ fromIDs, toID }) =>
      ok(await client.post("/api/filetree/moveDocsByID", { fromIDs, toID })),
  );

  server.registerTool(
    "get_hpath_by_path",
    {
      title: "Get human-readable path from storage path",
      description: "Convert a storage path inside a notebook into a human-readable path.",
      inputSchema: {
        notebook: z.string().describe("Notebook ID"),
        path: z.string().describe("Storage path"),
      },
    },
    async ({ notebook, path }) =>
      ok(await client.post("/api/filetree/getHPathByPath", { notebook, path })),
  );

  server.registerTool(
    "get_hpath_by_id",
    {
      title: "Get human-readable path from block ID",
      description: "Return the human-readable path of the block.",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/filetree/getHPathByID", { id })),
  );

  server.registerTool(
    "get_path_by_id",
    {
      title: "Get storage path from block ID",
      description: "Return the notebook + storage path for a block.",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/filetree/getPathByID", { id })),
  );

  server.registerTool(
    "get_ids_by_hpath",
    {
      title: "Get block IDs from human-readable path",
      description: "Resolve a human-readable path to one or more block IDs.",
      inputSchema: {
        path: z.string().describe("Human-readable path, e.g. '/Inbox/Today'"),
        notebook: z.string().describe("Notebook ID"),
      },
    },
    async ({ path, notebook }) =>
      ok(await client.post("/api/filetree/getIDsByHPath", { path, notebook })),
  );
}
