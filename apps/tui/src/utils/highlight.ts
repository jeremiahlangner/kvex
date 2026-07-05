import { RGBA } from "@opentui/core";
import type { TextChunk, ChunkRenderContext } from "@opentui/core";
import type { ThemeColors } from "../themes/types";

const tokenRe = /("(?:\\.|[^"\\])*")(\s*:\s*)|("(?:\\.|[^"\\])*")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\]:,])|(\s+)|(.+?)/g;

export function createOnChunks(colors: ThemeColors) {
  const c = colors.syntax;

  return function onChunks(chunks: TextChunk[], context: ChunkRenderContext): TextChunk[] {
    if (context.highlights.length > 0) return chunks;

    const text = chunks.map((ch) => ch.text).join("");
    const result: TextChunk[] = [];
    tokenRe.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = tokenRe.exec(text)) !== null) {
      result.push({
        __isChunk: true as const,
        text: match[0],
        fg: tokenColor(match, c),
      });
    }
    return result;
  };
}

function tokenColor(match: RegExpExecArray, c: ThemeColors["syntax"]): RGBA {
  if (match[1]) return RGBA.fromHex(c.property);
  if (match[3]) return RGBA.fromHex(c.string);
  if (match[4]) return RGBA.fromHex(c.keyword);
  if (match[5]) return RGBA.fromHex(c.number);
  if (match[6]) return RGBA.fromHex(c.punctuation);
  return RGBA.fromHex(c.default);
}
