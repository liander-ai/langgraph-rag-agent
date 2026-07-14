# LangGraph RAG Agent

A retrieval-augmented question-answering agent built as a **LangGraph** state machine.

Given a question, the graph retrieves the most relevant documents from a vector store, then asks an LLM to answer **using only that retrieved context** — the core RAG pattern, wired as an explicit two-node graph:

```
START ──> retrieve (vector search) ──> generate (LLM + context) ──> END
```

## Design

- **Graph** (`src/graph.ts`) — a LangGraph `StateGraph` with typed state (`question → context → answer`). The store and chat model are **injected**, so the same graph runs with a real LLM in production and a fake model in tests.
- **Retrieval** (`src/embeddings.ts`, `src/vectorstore.ts`) — a small in-memory vector store with cosine similarity. Embeddings use a dependency-free local hashing embedder (offline, free); swap in OpenAI / Cohere / Transformers.js by implementing the one-method `Embedder` interface.
- **Model** (`src/model.ts`) — `ChatAnthropic` for live runs; a `FakeListChatModel` in tests.
- **Knowledge base** (`src/knowledge.ts`) — sample facts about my three EVM demos ([staking vault](https://github.com/liander-ai/evm-staking-vault), [indexer](https://github.com/liander-ai/evm-vault-indexer), [prediction market](https://github.com/liander-ai/evm-prediction-market)).

## Run it

```bash
npm install
cp .env.example .env          # add ANTHROPIC_API_KEY
npm run ask -- "how are staking rewards calculated?"
```

```
Q: how are staking rewards calculated?

Retrieved context:
  - The EVM staking vault lets users stake an ERC-20 token and earn a reward token over time…
  - The staking vault is a Solidity port of the same protocol first built on Solana…

A: The reward equals the staked amount times the elapsed seconds times the reward rate, divided by 1e12 …
```

## Tests

```bash
npm test        # vitest
npm run typecheck
```

```
✓ test/vectorstore.test.ts (2 tests)   retrieval ranking + k limit
✓ test/graph.test.ts (1 test)          retrieve -> generate end to end
Test Files  2 passed (2)
     Tests  3 passed (3)
```

Tests run the whole graph with a **fake chat model**, so `npm test` needs **no API key and costs nothing** — only a live `npm run ask` calls a real model.

## Stack

- **LangGraph** (`@langchain/langgraph`) for the agent graph
- **LangChain** core + `@langchain/anthropic` for the chat model
- Local hashing embedder + in-memory cosine vector store
- **TypeScript**, **Vitest**

## Layout

```
src/graph.ts         LangGraph retrieve -> generate state machine
src/vectorstore.ts   in-memory cosine vector store
src/embeddings.ts    dependency-free local embedder (swappable)
src/model.ts         real ChatAnthropic model (tests inject a fake)
src/knowledge.ts     sample knowledge base
src/run.ts           CLI entry point
test/                Vitest suites (no API key needed)
```

## License

MIT
