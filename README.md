# kvex

TUI key-value explorer for NoSQL cloud databases. Browse, preview, edit, and search objects across DynamoDB, Cloudflare KV, and mock backends.

Built with [OpenTUI](https://opentui.ai), React, Bun, and Turborepo.

## Installation

**Requirements:** [Bun](https://bun.sh) ≥ 1.3.0, [pnpm](https://pnpm.io) ≥ 10.0

```bash
git clone <repo-url>
cd kvex
pnpm install

# run from the repo
pnpm kvex

# or link globally so you can run "kvex" from anywhere
cd apps/kvex && pnpm link --global
```

## Usage

| Key | Action |
|-----|--------|
| `w` / `b` | Cycle panes forward/back |
| `Tab` | Toggle between explorer and preview |
| `Enter` | Edit item in `$EDITOR` |
| `d` | Delete item (with confirm) |
| `q` | Quit (with confirm) |
| `/` | Open command palette |
| `↑` / `↓` | Navigate suggestions |

### Commands

| Command | Action |
|---------|--------|
| `/quit` | Exit the application |
| `/find <query>` | Fuzzy search cached objects |
| `/editor <name>` | Set editor (e.g. `vim`, `nvim`) |

## Architecture

- **Monorepo** – pnpm workspaces + Turborepo
- **Backend providers** – `DatabaseProvider` interface with mock provider (local JSON)
- **Local cache** – SQLite (`bun:sqlite`) + MiniSearch for fuzzy search
- **Command palette** – Vim-style `/` with Tab autocomplete and arrow key navigation
- **JSON preview** – Syntax-highlighted via custom tokenizer in OpenTUI `<code>`
- **Editor integration** – Suspends TUI, spawns `$EDITOR`, saves on write

## Configuration

`~/.kvex/config.json`:

```json
{
  "editor": "vim",
  "activeProvider": "mock"
}
```
