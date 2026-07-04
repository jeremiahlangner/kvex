import { RGBA, TreeSitterClient } from "@opentui/core";
import type { TextChunk, ChunkRenderContext } from "@opentui/core";

const COLORS: Record<string, [number, number, number]> = {
  key: [0x9C, 0xDC, 0xFE],
  string: [0xCE, 0x91, 0x78],
  number: [0xB5, 0xCE, 0xA8],
  keyword: [0x56, 0x9C, 0xD6],
  punctuation: [0xD4, 0xD4, 0xD4],
};

const tokenRe = /("(?:\\.|[^"\\])*")(\s*:\s*)|("(?:\\.|[^"\\])*")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\]:,])|(\s+)|(.+?)/g;

function tokenColor(match: RegExpExecArray): [number, number, number] {
  if (match[1]) return COLORS.key;
  if (match[3]) return COLORS.string;
  if (match[4]) return COLORS.keyword;
  if (match[5]) return COLORS.number;
  if (match[6]) return COLORS.punctuation;
  return [0xFF, 0xFF, 0xFF];
}

export function onChunks(chunks: TextChunk[], context: ChunkRenderContext): TextChunk[] {
  if (context.highlights.length > 0) return chunks;

  const text = chunks.map((c) => c.text).join("");
  const result: TextChunk[] = [];
  tokenRe.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(text)) !== null) {
    result.push({
      __isChunk: true as const,
      text: match[0],
      fg: RGBA.fromInts(...tokenColor(match)),
    });
  }
  return result;
}

class JsonHighlightClient extends TreeSitterClient {
  async highlightOnce(_content: string, _filetype: string) {
    return { highlights: [] };
  }
}

let _client: JsonHighlightClient | null = null;

export function getHighlightClient(): JsonHighlightClient {
  if (!_client) {
    _client = new JsonHighlightClient({ dataPath: "/tmp" } as any);
  }
  return _client;
}
