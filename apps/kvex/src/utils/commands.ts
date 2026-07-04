export interface Suggestion {
  name: string;
  description: string;
}

export interface Command {
  name: string;
  aliases: string[];
  description: string;
  action: (args: string[]) => string | void;
}

export function getBuiltinCommands(): Command[] {
  return [
    {
      name: "quit",
      aliases: ["exit"],
      description: "Exit the application",
      action: () => "quit",
    },
    {
      name: "find",
      aliases: ["search", "f"],
      description: "Search cached objects (find <query>)",
      action: (args) => {
        if (!args.length) return "Usage: find <query>";
        return `search:${args.join(" ")}`;
      },
    },
    {
      name: "editor",
      aliases: [],
      description: "Set the editor (editor <name>)",
      action: (args) => {
        if (!args.length) return "Usage: editor <name> (e.g., editor vim)";
        return `editor:${args[0]}`;
      },
    },
  ];
}

export function getSuggestions(input: string): Suggestion[] {
  const commands = getBuiltinCommands();
  const all: Suggestion[] = [];
  for (const cmd of commands) {
    all.push({ name: cmd.name, description: cmd.description });
    all.push(
      ...cmd.aliases
        .filter((a) => a.length > 1)
        .map((a) => ({ name: a, description: cmd.description })),
    );
  }
  if (!input) return all;
  const lower = input.toLowerCase();
  return all.filter((s) => s.name.startsWith(lower));
}

export function parseCommand(input: string): { command: string; args: string[] } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  const raw = parts[0].toLowerCase();

  const commands = getBuiltinCommands();
  for (const cmd of commands) {
    if (raw === cmd.name || cmd.aliases.includes(raw)) {
      return { command: cmd.name, args: parts.slice(1) };
    }
  }
  return null;
}
