import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SiYuanClient } from "../client.js";
import { ok } from "./_helpers.js";

const MAX_FILE_BYTES = 1_000_000; // 1 MB cap for inline text return

export function registerFileTools(server: McpServer, client: SiYuanClient): void {
  server.registerTool(
    "get_file",
    {
      title: "Get file (text)",
      description:
        "Read a file from the SiYuan workspace and return it as text. Capped at ~1 MB; binary files return a base64 preview.",
      inputSchema: {
        path: z.string().describe("Workspace-relative path, e.g. '/data/storage/notes.json'"),
      },
    },
    async ({ path }) => {
      const buf = (await client.post<ArrayBuffer>("/api/file/getFile", { path })) as ArrayBuffer;
      const bytes = new Uint8Array(buf);
      if (bytes.byteLength > MAX_FILE_BYTES) {
        return ok(
          `File is ${bytes.byteLength} bytes (over ${MAX_FILE_BYTES}); refusing to inline.`,
        );
      }
      // Try UTF-8 first; fall back to base64 if decoding produces replacement chars.
      const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      const looksBinary = /�/.test(text);
      if (looksBinary) {
        return ok(`(binary, ${bytes.byteLength} bytes, base64) ${Buffer.from(bytes).toString("base64")}`);
      }
      return ok(text);
    },
  );

  server.registerTool(
    "remove_file",
    {
      title: "Remove file",
      description: "Delete a file from the workspace. Destructive.",
      inputSchema: { path: z.string().describe("Workspace-relative path") },
    },
    async ({ path }) => ok(await client.post("/api/file/removeFile", { path })),
  );

  server.registerTool(
    "rename_file",
    {
      title: "Rename file",
      description: "Move/rename a file within the workspace.",
      inputSchema: {
        path: z.string().describe("Source workspace-relative path"),
        newPath: z.string().describe("Destination workspace-relative path"),
      },
    },
    async ({ path, newPath }) =>
      ok(await client.post("/api/file/renameFile", { path, newPath })),
  );

  server.registerTool(
    "read_dir",
    {
      title: "Read directory",
      description: "List entries of a directory inside the workspace.",
      inputSchema: { path: z.string().describe("Workspace-relative directory path") },
    },
    async ({ path }) => ok(await client.post("/api/file/readDir", { path })),
  );
}
