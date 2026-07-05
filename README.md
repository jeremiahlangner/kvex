# kvex

TUI key-value explorer for NoSQL cloud databases. Browse, preview, edit, and
search objects across DynamoDB, Cloudflare KV, and local SQLite backends.

Built with [OpenTUI](https://opentui.ai), React, Bun, and Turborepo.

## Features

- Multi-pane explorer: database → collection → sort key with Tab navigation
- Live JSON preview with syntax highlighting (theme-aware)
- Command palette with fuzzy suggestions, Tab completion, and vim-style `/`
- Edit values in `$EDITOR` with automatic re-save
- Delete with styled confirm dialog
- Switch providers at runtime: `Local`, `AWS`, `Cloudflare`
- Switch themes at runtime: `default`, `oxocarbon`, `tokyo-night`
- Connectivity status bar (online/offline/local) with 10s polling
- Per-provider SQLite storage under `~/.kvex/db/<name>.db`

## Installation

**Requirements:** [Bun](https://bun.sh) ≥ 1.3.0, [pnpm](https://pnpm.io) ≥ 10.0

```bash
git clone <repo-url>
cd kvex
pnpm install

# run from the repo
pnpm kvex

# or link globally
cd apps/tui && pnpm link --global && kvex
```

## Usage

### Keyboard

| Key | Action |
|-----|--------|
| `w` | Next pane (cycles: DB → Collection → SortKey → Preview) |
| `b` | Previous pane (stops at first pane, no wrap to preview) |
| `Tab` | Advance panes (0→1→2→preview→last key→0) |
| `Enter` | Edit selected item in `$EDITOR` |
| `d` | Delete selected item (with confirm dialog) |
| `q` / `Ctrl+C` | Quit (with confirm dialog) |
| `/` | Open command palette |
| `↑` / `↓` / `j` / `k` | Navigate palette suggestions |

### Commands

| Command | Aliases | Action |
|---------|---------|--------|
| `/quit` | `q` | Exit the application |
| `/find <query>` | `search`, `f`, `s` | Fuzzy search cached objects |
| `/editor <name>` | — | Set editor (e.g. `vim`, `nvim`, `code`) |
| `/theme <name>` | `t` | Switch theme (Tab-completes names) |
| `/provider <name>` | `p` | Switch provider (Tab-completes names) |

## Configuration

`~/.kvex/config.json`:

```json
{
  "editor": "vim",
  "activeProvider": "local",
  "theme": "default"
}
```

## Architecture

- **Turborepo monorepo** — pnpm workspaces with `apps/tui` as the main app
- **Provider interface** — `DatabaseProvider` with type-safe CRUD operations
- **SQLite cache** — Local storage via `bun:sqlite` with MiniSearch fuzzy search
- **Command palette** — Vim-style `/` with Tab autocomplete, arrow key, and vim key navigation
- **Theme system** — `ThemeColors` interface with per-theme syntax highlight styles
- **JSON preview** — Custom tokenizer in OpenTUI `<code>` element
- **Editor integration** — Suspends TUI, spawns `$EDITOR`, watches for file write

## Adding a Provider Adapter

Providers are registered in `apps/tui/src/providers/registry.ts` and follow the
`DatabaseProvider` interface.

### 1. Implement the interface

All adapters must implement `DatabaseProvider` from `apps/tui/src/providers/types.ts`:

```typescript
interface DatabaseProvider {
  readonly type: ProviderType;           // "local" | "dynamodb" | "cloudflare-kv" | <yours>
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  listTables(): Promise<TableInfo[]>;    // { name, keySchema: { hash, range? } }
  describeTable(name: string): Promise<KeySchema>;
  getItem(table: string, key: Record<string, string>): Promise<object | null>;
  putItem(table: string, key: Record<string, string>, value: object): Promise<void>;
  deleteItem(table: string, key: Record<string, string>): Promise<void>;
  query(table: string, keyCondition: Record<string, string>): Promise<object[]>;
  getKeyValues(table: string, keyName: string): Promise<string[]>;
}
```

Existing mock adapters wrap the shared `SqliteDatabase` class at
`apps/tui/src/providers/db/sqlite-provider.ts` for storage. For production
adapters you can call the real cloud SDK instead and skip SQLite entirely.

### 2. Register the provider

Add an entry to the `PROVIDER_REGISTRY` array in
`apps/tui/src/providers/registry.ts`:

```typescript
{
  name: "GCP",                  // Display name (capitalized)
  type: "gcp-datastore",        // Unique ProviderType literal
  description: "Google Cloud Datastore",
  pingEndpoint: "https://datastore.googleapis.com",
  isLocal: false,
  dbName: "gcp-mock",           // SQLite filename (mock only)
  collectionLabel: "Kind",      // Table → Datastore: "Kind"
  connectionLabel: "GCP",       // Status bar label
}
```

Then add the new string literal to the `ProviderType` union in `types.ts`:
`"local" | "dynamodb" | "cloudflare-kv" | "gcp-datastore"`

### 3. Wire the factory

Add a case to `createProvider()` in `apps/tui/src/providers/factory.ts`:

```typescript
case "gcp-datastore":
  return new GcpMockProvider();
```

### 4. Write tests

Create a co-located test file next to your adapter (e.g.
`apps/tui/src/providers/gcp-mock.test.ts`). Tests must cover:

- All 10 CRUD methods (`listTables`, `putItem`, `describeTable`, `getItem`,
  `getItem` for missing key, `putItem` update, `query`, `getKeyValues`,
  `deleteItem`, `type is set`)
- Data shape compatibility with the real SDK types

Use an adapter from `apps/tui/src/providers/` as a reference. Run with
`bun test`.

### 5. Ping endpoint

Set `pingEndpoint` to a URL that responds to unauthenticated HEAD requests.
The connectivity monitor polls this every 10 seconds. Local providers without
network dependencies use an empty string (no pinging).

## Project Structure

```
apps/tui/src/
├── app.tsx                       # Main application layout and key bindings
├── state.tsx                     # App state and reducer
├── config.ts                     # Config read/write (json)
├── providers/
│   ├── types.ts                  # DatabaseProvider interface, ProviderType, helpers
│   ├── registry.ts               # ProviderInfo registry and lookup
│   ├── factory.ts                # createProvider(type) factory
│   ├── local-provider.ts         # Local SQLite-backed adapter
│   ├── aws-mock.ts               # DynamoDB mock adapter
│   ├── cloudflare-mock.ts        # Cloudflare KV mock adapter
│   ├── db/
│   │   └── sqlite-provider.ts    # Shared SQLite CRUD operations
│   ├── local.test.ts
│   ├── aws-mock.test.ts
│   ├── cloudflare-mock.test.ts
│   └── registry.test.ts
├── components/
│   ├── command-palette.tsx       # Palette with suggest, completion, cursor
│   ├── confirm-dialog.tsx        # Styled Y/No delete confirmation
│   ├── explorer-pane.tsx         # Generic pane component
│   ├── database-select.tsx       # DB/Namespace/Kind selector
│   ├── key-select.tsx            # Key selector
│   ├── sort-key-select.tsx       # Sort key / range selector
│   ├── preview-pane.tsx          # JSON preview with syntax highlighting
│   └── status-bar.tsx            # Bottom bar: provider • connectivity
├── themes/
│   ├── types.ts                  # ThemeColors interface
│   ├── default.ts                # Default light-ish theme
│   ├── oxocarbon.ts              # IBM Carbon dark theme
│   ├── tokyo-night.ts            # Tokyo Night dark theme
│   └── index.ts                  # Registry, getTheme(), useTheme()
└── utils/
    ├── commands.ts               # Command definitions, suggestion logic
    ├── syntax.ts                 # Theme-aware syntax style generator
    ├── highlight.ts              # JSON chunk tokenizer
    └── connectivity.ts           # ConnectivityMonitor (10s polling)
```

## Development

```bash
# start the TUI
pnpm kvex

# run tests
bun test

# type check
tsc --noEmit
```
