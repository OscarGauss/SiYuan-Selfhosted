# siyuan-mcp

Model Context Protocol server that exposes a self-hosted [SiYuan](https://github.com/siyuan-note/siyuan) instance to MCP clients (Claude Desktop, Claude Code, etc.).

Wraps SiYuan's REST API as ~40 typed tools: notebooks, documents, blocks, attributes, SQL, templates, files, export, notifications, system.

## Configuration

Copy `.env.example` to `.env` and set:

| Variable | Required | Default | Description |
|---|---|---|---|
| `SIYUAN_BASE_URL` | yes | `http://127.0.0.1:6806` | URL of your SiYuan instance, no trailing slash. |
| `SIYUAN_API_TOKEN` | yes | — | API token from SiYuan UI → Settings → About → API token. |
| `MCP_TRANSPORT` | no | `stdio` | `stdio` for Claude Desktop, `http` for remote deploys. |
| `MCP_HTTP_PORT` | no | `3000` | Port to bind when `MCP_TRANSPORT=http`. |
| `MCP_HTTP_HOST` | no | `0.0.0.0` | Bind host when `MCP_TRANSPORT=http`. |
| `MCP_HTTP_AUTH_TOKEN` | no | — | If set, HTTP requests must send `Authorization: Bearer <token>`. |

## Local install

```bash
npm install
npm run build
```

Sanity-check it talks to SiYuan:

```bash
SIYUAN_BASE_URL=https://notes.example.com \
SIYUAN_API_TOKEN=xxxx \
npm run dev
# stdio server is now reading from stdin — Ctrl+D to exit.
```

## Use with Claude Desktop (stdio)

Add this block to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%/Claude/claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "siyuan": {
      "command": "node",
      "args": ["/absolute/path/to/siyuan-mcp/dist/index.js"],
      "env": {
        "SIYUAN_BASE_URL": "https://notes.example.com",
        "SIYUAN_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

Restart Claude Desktop. The `siyuan` server should appear in the MCP indicator with all tools available.

## Use with Claude Code (stdio)

```bash
claude mcp add siyuan -- node /absolute/path/to/siyuan-mcp/dist/index.js \
  -e SIYUAN_BASE_URL=https://notes.example.com \
  -e SIYUAN_API_TOKEN=your-token-here
```

## Deploy on Dokploy (HTTP)

The `Dockerfile` builds the server in HTTP mode and exposes port `3000`. The `docker-compose.yml` is shaped for sitting next to the existing SiYuan container.

1. In Dokploy: **New Service → Docker Compose**, point at this folder.
2. Set environment variables on the service:
   - `SIYUAN_BASE_URL=http://siyuan:6806` (use the SiYuan container's service name on the shared network)
   - `SIYUAN_API_TOKEN=<token>`
   - `MCP_HTTP_AUTH_TOKEN=<a long random string>`
3. If your SiYuan compose project is separate, add the existing network in the bottom of `docker-compose.yml`:
   ```yaml
   networks:
     siyuan_default:
       external: true
   ```
   …and uncomment the `networks:` block on the service.
4. In Dokploy, set up a domain pointing to port `3000` (e.g. `mcp.example.com`). Traefik will handle TLS.
5. Connect from Claude Code:
   ```bash
   claude mcp add --transport http siyuan https://mcp.example.com/mcp \
     --header "Authorization: Bearer <MCP_HTTP_AUTH_TOKEN>"
   ```

`GET /healthz` is unauthenticated for liveness probes; everything else requires the bearer token if `MCP_HTTP_AUTH_TOKEN` is set.

## Tool reference

| Group | Tools |
|---|---|
| Notebook | `list_notebooks`, `open_notebook`, `close_notebook`, `rename_notebook`, `create_notebook`, `remove_notebook`, `get_notebook_conf`, `set_notebook_conf` |
| Filetree | `create_doc_with_md`, `rename_doc`, `rename_doc_by_id`, `remove_doc`, `remove_doc_by_id`, `move_docs`, `move_docs_by_id`, `get_hpath_by_path`, `get_hpath_by_id`, `get_path_by_id`, `get_ids_by_hpath` |
| Block | `insert_block`, `prepend_block`, `append_block`, `update_block`, `delete_block`, `move_block`, `fold_block`, `unfold_block`, `get_block_kramdown`, `get_child_blocks`, `transfer_block_ref` |
| Attribute | `set_block_attrs`, `get_block_attrs` |
| SQL | `sql_query` |
| Template | `render_template`, `render_sprig` |
| File | `get_file`, `remove_file`, `rename_file`, `read_dir` |
| Export | `export_md_content` |
| Notification | `push_msg`, `push_err_msg` |
| System | `boot_progress`, `version`, `current_time` |

### Endpoints intentionally **not** exposed

| Endpoint | Reason |
|---|---|
| `/api/network/forwardProxy` | Lets the model make arbitrary outbound HTTP requests via SiYuan; SSRF risk. |
| `/api/convert/pandoc` | Requires the `pandoc` binary to be installed in the SiYuan container. |
| `/api/asset/upload`, `/api/file/putFile` | Multipart uploads are awkward to drive from MCP tool args; add later if needed. |
| `/api/sqlite/flushTransaction` | Low-level; called automatically by SiYuan. |
| `/api/export/exportResources` | Returns a server-side filesystem path, not usable by remote MCP clients. |

## Notes on the SQL tool

`sql_query` runs against SiYuan's embedded SQLite index. **Treat it as read-only.** Mutations bypass SiYuan's bookkeeping and may corrupt the index. Rebuild the index from SiYuan's UI if that happens.

Useful tables: `blocks`, `attributes`, `refs`, `spans`, `assets`. Example:

```sql
SELECT id, content, hpath
FROM blocks
WHERE type = 'd'
ORDER BY updated DESC
LIMIT 10;
```

## License

MIT.
