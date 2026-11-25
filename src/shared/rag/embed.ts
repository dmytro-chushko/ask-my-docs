const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings';

export class EmbeddingError extends Error {
  readonly code = 'EMBEDDING_FAILED' as const;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'EmbeddingError';
  }
}

type OpenRouterEmbedConfig = {
  apiKey: string;
  model: string;
  dimensions: number;
};

type OpenRouterEmbeddingItem = {
  embedding?: unknown;
  index?: unknown;
};

type OpenRouterEmbeddingsResponse = {
  data?: OpenRouterEmbeddingItem[];
  error?: { message?: string };
};

function requireOpenRouterEmbedConfig(): OpenRouterEmbedConfig {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim() ?? '';
  const model = process.env.OPENROUTER_EMBEDDING_MODEL?.trim() ?? '';
  const dimensionsRaw =
    process.env.OPENROUTER_EMBEDDING_DIMENSIONS?.trim() ?? '';
  const dimensions = Number(dimensionsRaw);

  if (!apiKey) {
    throw new EmbeddingError('Missing OPENROUTER_API_KEY.');
  }

  if (!model) {
    throw new EmbeddingError('Missing OPENROUTER_EMBEDDING_MODEL.');
  }

  if (!Number.isInteger(dimensions) || dimensions <= 0) {
    throw new EmbeddingError(
      'OPENROUTER_EMBEDDING_DIMENSIONS must be a positive integer.',
    );
  }

  return { apiKey, model, dimensions };
}

function assertEmbeddingVector(
  value: unknown,
  expectedDimensions: number,
  index: number,
): number[] {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === 'number' && Number.isFinite(item))
  ) {
    throw new EmbeddingError(
      `OpenRouter embedding at index ${index} is not a number[].`,
    );
  }

  if (value.length !== expectedDimensions) {
    throw new EmbeddingError(
      `OpenRouter embedding at index ${index} has ${value.length} dims; expected ${expectedDimensions}.`,
    );
  }

  return value;
}

async function requestEmbeddings(texts: string[]): Promise<number[][]> {
  const config = requireOpenRouterEmbedConfig();

  let response: Response;

  try {
    response = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        input: texts,
        dimensions: config.dimensions,
      }),
    });
  } catch (error) {
    throw new EmbeddingError('OpenRouter embeddings request failed.', {
      cause: error,
    });
  }

  let payload: OpenRouterEmbeddingsResponse;

  try {
    payload = (await response.json()) as OpenRouterEmbeddingsResponse;
  } catch (error) {
    throw new EmbeddingError(
      `OpenRouter embeddings returned non-JSON (HTTP ${response.status}).`,
      { cause: error },
    );
  }

  if (!response.ok) {
    const detail = payload.error?.message?.trim();
    throw new EmbeddingError(
      detail
        ? `OpenRouter embeddings error (HTTP ${response.status}): ${detail}`
        : `OpenRouter embeddings error (HTTP ${response.status}).`,
    );
  }

  const items = payload.data;

  if (!Array.isArray(items) || items.length !== texts.length) {
    throw new EmbeddingError(
      `OpenRouter embeddings response size mismatch: got ${items?.length ?? 0}, expected ${texts.length}.`,
    );
  }

  const ordered = [...items].sort((a, b) => {
    const aIndex = typeof a.index === 'number' ? a.index : 0;
    const bIndex = typeof b.index === 'number' ? b.index : 0;

    return aIndex - bIndex;
  });

  return ordered.map((item, index) =>
    assertEmbeddingVector(item.embedding, config.dimensions, index),
  );
}

/**
 * One text string → one embedding vector.
 * Server-only; requires OPENROUTER_* env.
 */
export async function embedText(text: string): Promise<number[]> {
  const normalized = text.trim();

  if (!normalized) {
    throw new EmbeddingError('Cannot embed empty text.');
  }

  const [embedding] = await requestEmbeddings([normalized]);

  return embedding;
}

/**
 * Many text strings → matching embedding vectors (same order).
 * Server-only; requires OPENROUTER_* env.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const normalized = texts.map((text, index) => {
    const value = text.trim();

    if (!value) {
      throw new EmbeddingError(`Cannot embed empty text at index ${index}.`);
    }

    return value;
  });

  return requestEmbeddings(normalized);
}
