import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { InMemoryVectorStore } from "./vectorstore.js";

// Graph state: a question flows in, retrieval fills `context`, generation fills `answer`.
const RagState = Annotation.Root({
  question: Annotation<string>(),
  context: Annotation<string[]>({ reducer: (_prev, next) => next, default: () => [] }),
  answer: Annotation<string>({ reducer: (_prev, next) => next, default: () => "" }),
});

export interface RagDeps {
  store: InMemoryVectorStore;
  model: BaseChatModel;
  k?: number;
}

/**
 * Build a two-node retrieval-augmented generation graph:
 *   START -> retrieve (vector search) -> generate (LLM with context) -> END
 * The model and store are injected, so tests can pass a fake model + local store.
 */
export function buildRagGraph({ store, model, k = 3 }: RagDeps) {
  async function retrieve(state: typeof RagState.State) {
    const docs = await store.similaritySearch(state.question, k);
    return { context: docs.map((d) => d.text) };
  }

  async function generate(state: typeof RagState.State) {
    const context = state.context.join("\n\n");
    const res = await model.invoke([
      new SystemMessage(
        "You are a helpful assistant. Answer the question using ONLY the provided context. " +
          "If the context does not contain the answer, say you don't know."
      ),
      new HumanMessage(`Context:\n${context}\n\nQuestion: ${state.question}`),
    ]);
    const answer = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
    return { answer };
  }

  return new StateGraph(RagState)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", END)
    .compile();
}
