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

## Provider Conventions

1. Display names for providers: "Local", "AWS", "Cloudflare" (capitalized)
2. Mock data file naming: `~/.kvex/db/<db-name>.db` where db-name matches the
   provider's internal `dbName` field (e.g. `local`, `aws-mock`, `cloudflare-mock`)
3. All provider adapters must implement the `DatabaseProvider` interface
4. Each adapter requires:
   - A `bun test` suite covering all interface CRUD methods
   - Tests verifying data shapes match the real SDK types
5. Connectivity ping endpoints:
   - Every cloud provider MUST specify a reasonable default ping URL in the registry
   - The ping URL should respond to unauthenticated requests (even with an error)
   - Local providers use empty string (no pinging)
   - Examples: Cloudflare → `https://1.1.1.1`, AWS/DynamoDB → `https://dynamodb.us-east-1.amazonaws.com`
   - The ping endpoint is configurable per-provider in the registry
