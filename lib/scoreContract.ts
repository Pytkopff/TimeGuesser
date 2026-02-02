export const SCORE_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const SCORE_CONTRACT_ABI = [
  {
    type: "function",
    name: "mintScore",
    stateMutability: "nonpayable",
    inputs: [
      { name: "gameId", type: "string" },
      { name: "score", type: "uint256" },
    ],
    outputs: [],
  },
] as const;
