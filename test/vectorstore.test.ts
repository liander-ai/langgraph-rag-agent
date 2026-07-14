import { describe, it, expect } from "vitest";
import { LocalHashEmbedder } from "../src/embeddings.js";
import { InMemoryVectorStore } from "../src/vectorstore.js";

describe("in-memory vector store", () => {
  it("ranks the most relevant document first", async () => {
    const store = new InMemoryVectorStore(new LocalHashEmbedder());
    await store.addDocuments([
      { id: "cats", text: "cats are small furry animals that meow and chase mice" },
      { id: "staking", text: "staking rewards accrue over time based on the amount staked" },
      { id: "weather", text: "rain and clouds and storms make up the weather forecast" },
    ]);

    const res = await store.similaritySearch("how do staking rewards work", 1);
    expect(res[0].id).toBe("staking");
  });

  it("respects the k limit", async () => {
    const store = new InMemoryVectorStore(new LocalHashEmbedder());
    await store.addDocuments([
      { id: "a", text: "alpha staking rewards" },
      { id: "b", text: "beta staking rewards" },
      { id: "c", text: "gamma staking rewards" },
    ]);

    const res = await store.similaritySearch("staking", 2);
    expect(res).toHaveLength(2);
  });
});
