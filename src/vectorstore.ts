import { type Embedder, cosine } from "./embeddings.js";

export interface Doc {
  id: string;
  text: string;
}

interface Entry extends Doc {
  vector: number[];
}

/** A minimal in-memory vector store: embed on add, cosine top-k on search. */
export class InMemoryVectorStore {
  private entries: Entry[] = [];

  constructor(private readonly embedder: Embedder) {}

  async addDocuments(docs: Doc[]): Promise<void> {
    const vectors = await this.embedder.embed(docs.map((d) => d.text));
    docs.forEach((d, i) => this.entries.push({ ...d, vector: vectors[i] }));
  }

  /** Return the `k` documents most similar to `query`, most similar first. */
  async similaritySearch(query: string, k = 3): Promise<Doc[]> {
    const [q] = await this.embedder.embed([query]);
    return this.entries
      .map((e) => ({ doc: e, score: cosine(q, e.vector) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((r) => ({ id: r.doc.id, text: r.doc.text }));
  }

  get size(): number {
    return this.entries.length;
  }
}
