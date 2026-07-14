import { describe, it, expect } from "vitest";
import { FakeListChatModel } from "@langchain/core/utils/testing";
import { LocalHashEmbedder } from "../src/embeddings.js";
import { InMemoryVectorStore } from "../src/vectorstore.js";
import { buildRagGraph } from "../src/graph.js";

describe("rag graph", () => {
  it("retrieves context and generates an answer end-to-end (fake model, no API cost)", async () => {
    const store = new InMemoryVectorStore(new LocalHashEmbedder());
    await store.addDocuments([
      { id: "vault", text: "The staking vault reward equals staked amount times elapsed seconds times reward rate divided by 1e12." },
      { id: "market", text: "The prediction market is parimutuel and an oracle resolves the outcome." },
    ]);

    const model = new FakeListChatModel({
      responses: ["The reward is proportional to the amount staked and the time elapsed."],
    });
    const graph = buildRagGraph({ store, model, k: 1 });

    const result = await graph.invoke({ question: "how is the staking reward calculated?" });

    // retrieval picked the relevant doc...
    expect(result.context).toHaveLength(1);
    expect(result.context[0].toLowerCase()).toContain("reward");
    // ...and generation produced the (fake) model's answer.
    expect(result.answer).toBe("The reward is proportional to the amount staked and the time elapsed.");
  });
});
