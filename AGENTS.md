## Commit Rules

1. Create a new commit after every change. Use Conventional Commits format: `<type>(<scope>): <description>`
   - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `perf`
   - Scope: the module or area being changed (e.g. `command-palette`, `preview-pane`, `config`, `deps`)
   - Description: lowercase, imperative mood, no period

## Coding Style

1. When a function contains a single `if` condition where the only executed code lives inside the block, prefer a negative guard clause with early return. Instead of:
   ```
   if (condition) {
     // do the thing
   }
   ```
   Write:
   ```
   if (!condition) return;
   // do the thing
   ```
