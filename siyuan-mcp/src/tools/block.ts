import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

const dataType = z
  .enum(["markdown", "dom"])
  .describe("Format of the `data` field");

export function registerBlockTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "insert_block",
    {
      title: "Insert block",
      description:
        "Insert a block at a specific position. Provide exactly one of nextID, previousID, or parentID.",
      inputSchema: {
        dataType,
        data: z.string().describe("Block content (Markdown or DOM)"),
        nextID: z.string().optional().describe("Insert before this block"),
        previousID: z.string().optional().describe("Insert after this block"),
        parentID: z.string().optional().describe("Insert as last child of this block"),
      },
    },
    async (args) => ok(await client.post("/api/block/insertBlock", args)),
  );

  server.registerTool(
    "prepend_block",
    {
      title: "Prepend block",
      description: "Insert a block as the first child of a parent.",
      inputSchema: {
        dataType,
        data: z.string().describe("Block content"),
        parentID: z.string().describe("Parent block ID"),
      },
    },
    async (args) => ok(await client.post("/api/block/prependBlock", args)),
  );

  server.registerTool(
    "append_block",
    {
      title: "Append block",
      description: "Insert a block as the last child of a parent.",
      inputSchema: {
        dataType,
        data: z.string().describe("Block content"),
        parentID: z.string().describe("Parent block ID"),
      },
    },
    async (args) => ok(await client.post("/api/block/appendBlock", args)),
  );

  server.registerTool(
    "update_block",
    {
      title: "Update block",
      description: "Replace the content of a block by ID.",
      inputSchema: {
        dataType,
        data: z.string().describe("New block content"),
        id: z.string().describe("Target block ID"),
      },
    },
    async (args) => ok(await client.post("/api/block/updateBlock", args)),
  );

  server.registerTool(
    "delete_block",
    {
      title: "Delete block",
      description: "Delete a block by ID. Destructive.",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/block/deleteBlock", { id })),
  );

  server.registerTool(
    "move_block",
    {
      title: "Move block",
      description:
        "Move a block under a new parent or after a sibling. Provide previousID and/or parentID.",
      inputSchema: {
        id: z.string().describe("Block ID to move"),
        previousID: z.string().optional().describe("Place after this block"),
        parentID: z.string().optional().describe("Move under this parent"),
      },
    },
    async (args) => ok(await client.post("/api/block/moveBlock", args)),
  );

  server.registerTool(
    "fold_block",
    {
      title: "Fold block",
      description: "Collapse a block in the editor.",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/block/foldBlock", { id })),
  );

  server.registerTool(
    "unfold_block",
    {
      title: "Unfold block",
      description: "Expand a previously folded block.",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/block/unfoldBlock", { id })),
  );

  server.registerTool(
    "get_block_kramdown",
    {
      title: "Get block as Kramdown",
      description: "Return the Kramdown source of a block (round-trips with update_block).",
      inputSchema: { id: z.string().describe("Block ID") },
    },
    async ({ id }) => ok(await client.post("/api/block/getBlockKramdown", { id })),
  );

  server.registerTool(
    "get_child_blocks",
    {
      title: "Get child blocks",
      description: "List the immediate children of a block.",
      inputSchema: { id: z.string().describe("Parent block ID") },
    },
    async ({ id }) => ok(await client.post("/api/block/getChildBlocks", { id })),
  );

  server.registerTool(
    "transfer_block_ref",
    {
      title: "Transfer block references",
      description:
        "Redirect references that currently point at fromID to point at toID. Optionally limit to specific reference IDs.",
      inputSchema: {
        fromID: z.string().describe("Block currently referenced"),
        toID: z.string().describe("New target block"),
        refIDs: z
          .array(z.string())
          .optional()
          .describe("Limit to these reference IDs (omit for all)"),
      },
    },
    async (args) => ok(await client.post("/api/block/transferBlockRef", args)),
  );
}
