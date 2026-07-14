// Embeddings.
//
// A small, dependency-free embedder: it hashes tokens into a fixed-dimension
// bag-of-words vector, then L2-normalizes so cosine similarity is a dot product.
// Deterministic and fully offline, good enough for keyword-level retrieval in a
// demo. Swap in a real provider (OpenAI, Cohere, Transformers.js) by implementing
// the same `Embedder` interface.

export interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
}

export class LocalHashEmbedder implements Embedder {
  constructor(private readonly dim = 256) {}

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t));
  }

  private embedOne(text: string): number[] {
    const v = new Array<number>(this.dim).fill(0);
    for (const tok of tokenize(text)) {
      v[hash(tok) % this.dim] += 1;
    }
    return normalize(v);
  }
}

export function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

// FNV-1a hash -> unsigned 32-bit.
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

/** Cosine similarity of two L2-normalized vectors (i.e. their dot product). */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
