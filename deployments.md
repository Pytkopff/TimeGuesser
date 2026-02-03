# Base Mainnet Deployments

## TimeGuesserRanking (v2 - Event-Based Architecture)

**⚠️ NOT YET DEPLOYED - Use Remix IDE to deploy**

### Contract Details:
- **Network:** Base Mainnet (Chain ID: 8453)
- **Architecture:** Event-based (professional pattern)
- **Storage:** Minimal (only bestScore per player)
- **Leaderboard:** Off-chain (Supabase indexing from events)

### Deployment Steps:
1. Open [Remix IDE](https://remix.ethereum.org)
2. Copy code from `contracts/TimeGuesserRanking.sol`
3. Compile with Solidity 0.8.20
4. Deploy via "Injected Provider" (ensure wallet is on Base Mainnet)
5. Verify on [BaseScan](https://basescan.org)

### After Deployment:
- Add contract address to Vercel env: `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS`
- Contract address will be added here after deployment

### Architecture:
- ✅ Event-based (gas efficient)
- ✅ Off-chain leaderboard (Supabase)
- ✅ Ready for The Graph indexing
- ✅ Scalable to millions of games

See `ARCHITECTURE.md` for full details.
