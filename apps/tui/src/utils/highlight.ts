import { parseColor, type RGBA } from "@opentui/core";
import type { TextChunk, ChunkRenderContext } from "@opentui/core";
import type { ThemeColors } from "../themes/types";

const tokenRe = /("(?:\\.|[^"\\])*")(\s*:\s*)|("(?:\\.|[^"\\])*")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\]:,])|(\s+)|(.+?)/g;

export function createOnChunks(colors: ThemeColors) {
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
        fg: tokenColor(match, colors),
      });
    }
    return result;
  };
}

function tokenColor(match: RegExpExecArray, c: ThemeColors): RGBA {
  if (match[1]) return parseColor(c.syntaxProperty);
  if (match[3]) return parseColor(c.syntaxString);
  if (match[4]) return parseColor(c.syntaxKeyword);
  if (match[5]) return parseColor(c.syntaxNumber);
  if (match[6]) return parseColor(c.syntaxPunctuation);
  return parseColor(c.syntaxDefault);
}
