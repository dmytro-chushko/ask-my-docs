import { extractText, getDocumentProxy } from 'unpdf';

export class PdfParseError extends Error {
  readonly code = 'PDF_PARSE_FAILED' as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PdfParseError';
  }
}

export type ParsePdfResult = {
  text: string;
  totalPages: number;
};

/**
 * Light cleanup for RAG: keep structure, drop noisy whitespace.
 * Empty text after cleanup is treated as a hard failure (OCR is out of scope).
 */
function normalizePdfText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * PDF bytes → plain text. Storage/download stays outside this module.
 */
export async function parsePdf(data: Uint8Array): Promise<ParsePdfResult> {
  if (data.byteLength === 0) {
    throw new PdfParseError('PDF data is empty.');
  }

  try {
    // Copy first: PDF.js may transfer/detach the caller's ArrayBuffer.
    const pdf = await getDocumentProxy(data.slice());
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const normalized = normalizePdfText(text);

    if (normalized.length === 0) {
      throw new PdfParseError('PDF has no extractable text.');
    }

    return {
      text: normalized,
      totalPages,
    };
  } catch (error) {
    if (error instanceof PdfParseError) {
      throw error;
    }

    throw new PdfParseError('Failed to parse PDF.', { cause: error });
  }
}
