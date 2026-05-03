<div align="center">

# SiYuan — Self-Hosted Knowledge Base

**A privacy-first, local-first personal knowledge management system.**  
Deploy your own instance in minutes using Docker Compose and Dokploy.

[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://hub.docker.com/r/b3log/siyuan)
[![License](https://img.shields.io/badge/License-AGPL--3.0-22c55e?style=flat-square)](https://github.com/siyuan-note/siyuan/blob/master/LICENSE)
[![SiYuan](https://img.shields.io/badge/SiYuan-upstream-7c3aed?style=flat-square)](https://github.com/siyuan-note/siyuan)
[![Self-Hosted](https://img.shields.io/badge/self--hosted-Dokploy-0ea5e9?style=flat-square)](https://dokploy.com)

</div>

---

## Overview

This repository contains the Docker Compose configuration to self-host [SiYuan](https://github.com/siyuan-note/siyuan) — an open-source, block-based knowledge management system written in TypeScript and Go. It is designed to be deployed behind a reverse proxy (Traefik via Dokploy) with SSL termination and persistent storage.

SiYuan runs as a **single Docker container** with no external database dependencies, making it lightweight and straightforward to maintain.

---

## Features

| Category | Details |
|---|---|
| Editor | Block-based WYSIWYG with native Markdown |
| Linking | Bidirectional links, block references, graph view |
| Learning | Flashcards with spaced repetition built-in |
| Search | Full-text search with SQL query support |
| Data | Database views, tables, Notion-style layouts |
| Media | OCR for text extraction from images |
| AI | OpenAI API integration (bring your own key) |
| Storage | Offline-first, embedded SQLite — no internet required |
| Integration | REST API + WebDAV support |
| Deployment | Single Docker container, zero external dependencies |

---

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Go |
| Frontend | TypeScript |
| Storage | SQLite (embedded) |
| Container | Docker |
| Reverse Proxy | Traefik (via Dokploy) |
| Default Port | `6806` |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose v2+
- A domain or subdomain pointing to your server
- Dokploy installed on your VPS

### Clone

```bash
git clone git@github.com:OscarGauss/SiYuan-Selfhosted.git
cd SiYuan-Selfhosted
```

### Configure

Copy the example env file and set your values:

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
SIYUAN_AUTH_CODE=your-strong-password-here
```

The `.env` file is gitignored and will never be committed to the repository.

### Run locally

```bash
docker compose up -d
```

Access the UI at `http://localhost:6806` and enter your `accessAuthCode` when prompted.

---

## Docker Compose

```yaml
services:
  siyuan:
    image: b3log/siyuan:latest
    container_name: siyuan
    command:
      - "--workspace=/siyuan/workspace/"
      - "--accessAuthCode=${SIYUAN_AUTH_CODE}"
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=UTC
    volumes:
      - siyuan_data:/siyuan/workspace
    ports:
      - "6806:6806"
    restart: unless-stopped

volumes:
  siyuan_data:
```

---

## Deploying on Dokploy

1. In Dokploy, create a **New Service → Docker Compose**
2. Paste or import the `docker-compose.yml` from this repository
3. Set `YOUR_PASSWORD_HERE` to a strong access code
4. Under **Domains**, configure your subdomain (e.g. `notes.yourdomain.com`) to proxy port `6806`
5. Dokploy provisions an SSL certificate automatically via Traefik
6. Trigger a deploy and navigate to `https://notes.yourdomain.com`

> **Note:** Do not configure URL rewriting or redirection on the domain. SiYuan requires a direct reverse proxy to port `6806` — URL rewriting can break session authentication.

---

## Environment Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `PUID` | `1000` | No | UID of the user running the process inside the container |
| `PGID` | `1000` | No | GID of the user running the process inside the container |
| `TZ` | `UTC` | No | Container timezone. Keep `UTC` for consistent timestamps if you access from multiple timezones. |
| `SIYUAN_AUTH_CODE` | — | **Yes** | Access password for the UI — set in `.env`, never hardcoded |
| `--workspace` | `/siyuan/workspace/` | No | Workspace directory path inside the container |

> If you encounter permission errors on startup, ensure the mounted volume directory on the host is owned by the UID/GID specified in `PUID`/`PGID`.

---

## Backup & Restore

All data is stored in the `siyuan_data` Docker volume. Use the following commands to export and restore it.

**Export**

```bash
docker run --rm \
  -v siyuan_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/siyuan-backup.tar.gz -C /data .
```

**Restore**

```bash
docker run --rm \
  -v siyuan_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/siyuan-backup.tar.gz -C /data
```

---

## AI Integration

SiYuan supports AI-assisted writing, translation, and grammar correction via the OpenAI API. No paid hosting plan is required — you only need your own API key.

**Setup:** SiYuan UI → **Settings → AI** → enter your `OpenAI API Key` and select a model (e.g. `gpt-4o`).

---

## Contributing

Contributions, improvements, and suggestions are welcome.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/your-change

# 3. Commit your changes
git commit -m "feat: describe your change"

# 4. Push and open a Pull Request
git push origin feature/your-change
```

---

## License

The configuration in this repository is released under the [MIT License](./LICENSE).  
SiYuan itself is licensed under [AGPL-3.0](https://github.com/siyuan-note/siyuan/blob/master/LICENSE) by the SiYuan authors.
