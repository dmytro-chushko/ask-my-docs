export type TextChunk = {
  chunkIndex: number;
  content: string;
};

export type ChunkTextOptions = {
  /** Soft max characters per chunk. Default: 1000 */
  maxChars?: number;
  /** Characters reused across consecutive chunk boundaries. Default: 150 */
  overlap?: number;
};

const DEFAULT_MAX_CHARS = 1000;
const DEFAULT_OVERLAP = 150;

/**
 * Long text → ordered chunks for later embedding (L4).
 *
 * Strategy (KISS):
 * 1) split on paragraph breaks
 * 2) pack paragraphs into windows of maxChars
 * 3) hard-split any single segment longer than maxChars (with overlap step)
 * 4) apply overlap when starting the next packed window
 */
export function chunkText(
  text: string,
  options: ChunkTextOptions = {},
): TextChunk[] {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;

  if (maxChars <= 0) {
    throw new Error('maxChars must be > 0.');
  }

  if (overlap < 0 || overlap >= maxChars) {
    throw new Error('overlap must be >= 0 and < maxChars.');
  }

  const normalized = text.replace(/\r\n/g, '\n').trim();

  if (normalized.length === 0) {
    return [];
  }

  if (normalized.length <= maxChars) {
    return [{ chunkIndex: 0, content: normalized }];
  }

  const segments = splitIntoSegments(normalized, maxChars, overlap);
  const windows = packSegments(segments, maxChars, overlap);

  return windows.map((content, chunkIndex) => ({ chunkIndex, content }));
}

function splitIntoSegments(
  text: string,
  maxChars: number,
  overlap: number,
): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const segments: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxChars) {
      segments.push(paragraph);
      continue;
    }

    segments.push(...hardSplit(paragraph, maxChars, overlap));
  }

  return segments;
}

function hardSplit(text: string, maxChars: number, overlap: number): string[] {
  const step = Math.max(maxChars - overlap, 1);
  const parts: string[] = [];

  for (let start = 0; start < text.length; start += step) {
    const part = text.slice(start, start + maxChars).trim();

    if (part.length > 0) {
      parts.push(part);
    }

    if (start + maxChars >= text.length) {
      break;
    }
  }

  return parts;
}

function packSegments(
  segments: string[],
  maxChars: number,
  overlap: number,
): string[] {
  const windows: string[] = [];
  let current = '';

  for (const segment of segments) {
    if (current.length === 0) {
      current = segment;
      continue;
    }

    const candidate = `${current}\n\n${segment}`;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    windows.push(current);

    const overlapText = takeOverlap(current, overlap);
    current = overlapText.length > 0 ? `${overlapText}\n\n${segment}` : segment;

    if (current.length > maxChars) {
      // Overlap + next segment cannot fit; keep the segment alone.
      current = segment;
    }
  }

  if (current.trim().length > 0) {
    windows.push(current.trim());
  }

  return windows;
}

function takeOverlap(text: string, overlap: number): string {
  if (overlap === 0 || text.length === 0) {
    return '';
  }

  if (text.length <= overlap) {
    return text;
  }

  return text.slice(text.length - overlap).trimStart();
}
