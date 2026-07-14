// CLI: answer a question over the knowledge base using the RAG graph + a real LLM.
//   ANTHROPIC_API_KEY=... npm run ask -- "how are staking rewards calculated?"
import { LocalHashEmbedder } from "./embeddings.js";
import { InMemoryVectorStore } from "./vectorstore.js";
import { KNOWLEDGE } from "./knowledge.js";
import { getChatModel } from "./model.js";
import { buildRagGraph } from "./graph.js";

async function main() {
  const question = process.argv.slice(2).join(" ") || "How are staking rewards calculated?";

  const store = new InMemoryVectorStore(new LocalHashEmbedder());
  await store.addDocuments(KNOWLEDGE);

  const graph = buildRagGraph({ store, model: getChatModel(), k: 3 });
  const result = await graph.invoke({ question });

  console.log(`Q: ${question}\n`);
  console.log("Retrieved context:");
  for (const c of result.context) console.log("  -", c.slice(0, 90) + "…");
  console.log(`\nA: ${result.answer}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
