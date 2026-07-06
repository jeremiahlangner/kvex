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

import { getThemeNames } from "../themes";
import { getProviderNames } from "../providers/registry";

const THEME_CMDS = ["theme", "t"];
const PROVIDER_CMDS = ["provider", "p"];
const EDITOR_CMDS = ["editor"];

const COMMON_EDITORS = ["vim", "nvim", "neovim", "nano", "emacs", "code", "hx", "helix", "vi", "zed"];

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
    {
      name: "theme",
      aliases: ["t"],
      description: "Set the color theme (theme <name>)",
      action: (args) => {
        if (!args.length) return "Usage: theme <name>";
        return `theme:${args[0]}`;
      },
    },
    {
      name: "provider",
      aliases: ["p"],
      description: "Switch database provider (provider <name>)",
      action: (args) => {
        if (!args.length) return "Usage: provider <name>";
        return `provider:${args[0]}`;
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

  const parts = input.split(/\s+/);
  const cmdPart = parts[0].toLowerCase();
  if (parts.length > 1 && THEME_CMDS.includes(cmdPart)) {
    const argPrefix = parts.slice(1).join(" ").toLowerCase();
    return getThemeNames()
      .filter((name) => name.toLowerCase().startsWith(argPrefix))
      .map((name) => ({ name, description: "" }));
  }
  if (parts.length > 1 && PROVIDER_CMDS.includes(cmdPart)) {
    const argPrefix = parts.slice(1).join(" ").toLowerCase();
    return getProviderNames()
      .filter((name) => name.toLowerCase().startsWith(argPrefix))
      .map((name) => ({
        name,
        description: name === "Local" ? "" : "(Local)",
      }));
  }
  if (parts.length > 1 && EDITOR_CMDS.includes(cmdPart)) {
    const argPrefix = parts.slice(1).join(" ").toLowerCase();
    return COMMON_EDITORS
      .filter((name) => name.toLowerCase().startsWith(argPrefix))
      .map((name) => ({ name, description: "" }));
  }

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
