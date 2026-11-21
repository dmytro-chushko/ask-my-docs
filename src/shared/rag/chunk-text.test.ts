import { describe, expect, it } from 'vitest';

import { chunkText } from './chunk-text';

describe('chunkText', () => {
  it('returns an empty array for blank input', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   \n\n  ')).toEqual([]);
  });

  it('keeps short text as a single chunk', () => {
    const chunks = chunkText('Hello world');

    expect(chunks).toEqual([{ chunkIndex: 0, content: 'Hello world' }]);
  });

  it('splits long text into ordered chunks within maxChars', () => {
    const chunks = chunkText('A'.repeat(2500), {
      maxChars: 1000,
      overlap: 150,
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk, index) => chunk.chunkIndex === index)).toBe(
      true,
    );
    expect(
      chunks.every(
        (chunk) => chunk.content.length > 0 && chunk.content.length <= 1000,
      ),
    ).toBe(true);
  });

  it('throws when options are invalid', () => {
    expect(() => chunkText('hello', { maxChars: 0 })).toThrow(
      'maxChars must be > 0.',
    );
    expect(() => chunkText('hello', { maxChars: 100, overlap: 100 })).toThrow(
      'overlap must be >= 0 and < maxChars.',
    );
    expect(() => chunkText('hello', { maxChars: 100, overlap: -1 })).toThrow(
      'overlap must be >= 0 and < maxChars.',
    );
  });

  it('packs multiple paragraphs into more than one chunk', () => {
    const text = [
      'Alpha paragraph. '.repeat(40).trim(),
      'Beta paragraph. '.repeat(40).trim(),
      'Gamma paragraph. '.repeat(40).trim(),
    ].join('\n\n');

    const chunks = chunkText(text, { maxChars: 500, overlap: 50 });

    expect(chunks.length).toBeGreaterThan(1);
    expect(
      chunks.every(
        (chunk) => chunk.content.length > 0 && chunk.content.length <= 500,
      ),
    ).toBe(true);
  });
});
