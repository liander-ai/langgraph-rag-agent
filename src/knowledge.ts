import type { Doc } from "./vectorstore.js";

/** Sample knowledge base — facts about the three EVM demos in this portfolio. */
export const KNOWLEDGE: Doc[] = [
  {
    id: "staking-reward-formula",
    text: "The EVM staking vault lets users stake an ERC-20 token and earn a reward token over time. The reward equals staked amount times elapsed seconds times reward rate divided by ACC_PRECISION, which is 1e12. Rewards settle on every balance change so a new stake never changes past accrual.",
  },
  {
    id: "staking-two-chains",
    text: "The staking vault is a Solidity port of the same protocol first built on Solana with Anchor in Rust. Building it on both chains keeps the reward accounting identical while the platform primitives differ.",
  },
  {
    id: "indexer",
    text: "The vault indexer reads Staked, Unstaked, and Claimed events from an EVM RPC using viem, stores them in PostgreSQL, and serves them over a Fastify GraphQL API. It is idempotent using a unique constraint on transaction hash and log index.",
  },
  {
    id: "prediction-market",
    text: "The prediction market is a binary parimutuel market. Users bet on YES or NO before the close time, an oracle resolves the outcome, and winners split the whole pool in proportion to their winning stake.",
  },
  {
    id: "prediction-invalid",
    text: "In the prediction market, resolving to a side with no stake is rejected to avoid a division by zero and locked funds. The oracle must use Invalid instead, which refunds every bettor their own stake.",
  },
];
