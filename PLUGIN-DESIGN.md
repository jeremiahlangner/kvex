# Plugin System — Design Plan

## Goal

Allow users to write TypeScript plugins that hook into the data flow to:

1. **Identify structured fields** — declare which keys in a returned item contain
   JSON, YAML, HTML, Markdown, or other structured formats for richer preview
2. **Transform for display** — modify fetched items before rendering (e.g.
   pretty-print nested JSON, strip HTML tags for inline peek)
3. **Define side-effects on save** — when a user edits and saves, plugins can
   transform the item, add cascading mutations (other fields, other tables)

---

## Interfaces

```typescript
// src/providers/plugins/types.ts

export type FieldFormat = "json" | "yaml" | "html" | "markdown" | "text";

export interface AnnotatedField {
  key: string;
  format: FieldFormat;
  label?: string;         // Override field name in preview
  previewable: boolean;   // Can render inline (vs open in editor)
}

export interface SideEffect {
  table: string;
  key: Record<string, string>;
  value: object;
}

export interface PluginHooks {
  name: string;

  /** Examine a fetched item and declare structured fields */
  annotate?(item: object, ctx: PluginContext): AnnotatedField[];

  /** Transform the raw item before preview display */
  transformForDisplay?(item: object, ctx: PluginContext): object;

  /** Validate / modify / augment the edited item before save.
   *  Return the item to persist plus any extra mutations. */
  onBeforeSave?(
    editedItem: object,
    originalItem: object,
    ctx: PluginContext,
  ): Promise<{ item: object; sideEffects?: SideEffect[] }>;

  /** Called after the save transaction completes */
  onAfterSave?(savedItem: object, ctx: PluginContext): Promise<void>;
}

export interface PluginContext {
  providerType: ProviderType;
  table: string;
  key: Record<string, string>;
}
```

---

## Integration Points

| Stage | Where | What happens |
|-------|-------|-------------|
| **On fetch** | `key-select.tsx`, `sort-key-select.tsx` (after `provider.getItem()`) | Run `transformForDisplay()` + `annotate()` on item. Store result + annotations alongside raw item in state. |
| **On save** | `utils/editor.ts` (before `provider.putItem()`) | Pipeline: `onBeforeSave()` → `putItem()` → `sideEffects.map(putItem)` → `onAfterSave()` → cache update |
| **Preview** | `components/preview-pane.tsx` | When annotations present, render annotated fields with format hints alongside flat JSON |

---

## Plugin Loading

Bun dynamic `import()` from `~/.kvex/plugins/*.ts`:

```typescript
// src/providers/plugins/loader.ts
const PLUGIN_DIR = `${process.env.HOME}/.kvex/plugins`;

export async function loadPlugins(): Promise<PluginHooks[]> {
  const files = readdirSync(PLUGIN_DIR).filter(f => f.endsWith(".ts"));
  return Promise.all(
    files.map(f => import(join(PLUGIN_DIR, f)).then(m => m.default as PluginHooks))
  );
}
```

---

## New Files

```
src/providers/plugins/
├── types.ts         # PluginHooks, AnnotatedField, PluginContext, etc.
├── loader.ts        # loadPlugins() — dynamic import from ~/.kvex/plugins/
└── runner.ts        # applyAnnotators(), applyTransforms(), applyBeforeSave(), applyAfterSave()
```

---

## Config Changes

Add `plugins: string[]` to `KvexConfig` (list of plugin names to enable).
Default: `[]`.

---

## Things That Don't Change

- `DatabaseProvider` interface — remains pure CRUD
- Provider adapters — no changes needed
- Command palette, status bar, explorer panes, theme system
- Cache layer

---

## Open Questions

1. **Preview rendering** — Annotated fields: expanded inline preview (e.g. HTML
   rendered, JSON sub-tree) or just a format tag on the field name?
2. **Plugin distribution** — Raw `.ts` files in `~/.kvex/plugins/`, or
   npm packages (`kvex-plugin-foo`)?
3. **Field overlap** — When two plugins claim the same field: last-wins, or
   ordered by config priority?
