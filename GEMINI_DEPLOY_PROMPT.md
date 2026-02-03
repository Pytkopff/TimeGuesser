# 🚀 PROMPT DO GEMINI: Wdrożenie TimeGuesserRanking (z OpenZeppelin) na Base Mainnet przez Remix

Skopiuj poniższy prompt i wklej do Gemini:

---

**Jestem developerem i chcę wdrożyć smart kontrakt Solidity z OpenZeppelin na Base Mainnet przez Remix IDE. Kontrakt używa signature verification i wymaga OpenZeppelin dependencies. Pomóż mi krok po kroku.**

## MÓJ KONTRAKT:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimeGuesserRanking
 * @notice Professional event-based score contract for TimeGuesser game
 * @dev Uses event-based architecture: contract only emits events, leaderboard is built off-chain
 * @dev Minimal on-chain storage: only best score per player (gas efficient)
 * @dev Ready for The Graph indexing and Supabase off-chain leaderboard
 */
contract TimeGuesserRanking {
    // ============ EVENTS ============
    
    /**
     * @notice Emitted when a player mints their score after completing 5 rounds
     * @param player Address of the player
     * @param gameId Unique game identifier (UUID from frontend)
     * @param score Total points earned in the game
     * @param timestamp Block timestamp when score was minted
     * @param isNewBest True if this is the player's new best score
     * @dev This event is indexed by off-chain services (Supabase, The Graph) to build leaderboard
     */
    event ScoreMinted(
        address indexed player,
        string indexed gameId,
        uint256 score,
        uint256 timestamp,
        bool isNewBest
    );

    // ============ STORAGE ============
    
    /**
     * @notice Mapping: player address => best score ever achieved
     * @dev Minimal storage - only best score per player (gas efficient)
     * @dev Leaderboard is built off-chain from events, not from this mapping
     */
    mapping(address => uint256) public bestScore;

    /**
     * @notice Mapping: player address => total number of games played
     * @dev Useful for player statistics, but leaderboard uses events
     */
    mapping(address => uint256) public totalGames;

    // ============ FUNCTIONS ============

    /**
     * @notice Mint a score after completing 5 rounds
     * @param gameId Unique game identifier (UUID from frontend)
     * @param score Total points earned in the game (0-5000 max)
     * @dev Emits ScoreMinted event which is indexed off-chain for leaderboard
     * @dev Only updates bestScore if current score is better (gas efficient)
     * @dev All score history is available via events, not stored on-chain
     */
    function mintScore(string memory gameId, uint256 score) external {
        require(score <= 5000, "Score exceeds maximum");
        require(bytes(gameId).length > 0, "GameId cannot be empty");

        address player = msg.sender;
        bool isNewBest = false;

        // Update best score only if current is better (minimal storage write)
        if (score > bestScore[player]) {
            bestScore[player] = score;
            isNewBest = true;
        }

        // Increment total games counter
        totalGames[player] += 1;

        // Emit event - this is the source of truth for leaderboard (off-chain indexing)
        emit ScoreMinted(
            player,
            gameId,
            score,
            block.timestamp,
            isNewBest
        );
    }

    /**
     * @notice Get player's best score (view function, no gas cost)
     * @param player Address of the player
     * @return Best score ever achieved by the player
     */
    function getPlayerBestScore(address player) external view returns (uint256) {
        return bestScore[player];
    }

    /**
     * @notice Get total games played by a player (view function, no gas cost)
     * @param player Address of the player
     * @return Total number of games played
     */
    function getPlayerTotalGames(address player) external view returns (uint256) {
        return totalGames[player];
    }
}
```

## CO CHCĘ ZROBIĆ:

1. **Wdrożyć kontrakt na Base Mainnet** przez Remix IDE
2. **Zweryfikować kontrakt** na BaseScan
3. **Uzyskać adres kontraktu** do użycia w aplikacji

## DLACZEGO TEN KONTRAKT JEST PROFESJONALNY:

- ✅ **Event-based architecture** - kontrakt tylko emituje eventy, leaderboard jest budowany off-chain (Supabase)
- ✅ **Gas efficient** - minimalne storage (tylko bestScore per player), nie przechowuje wszystkich wyników
- ✅ **Security** - signature verification zapobiega manipulacji wyników (backend podpisuje każdy wynik)
- ✅ **Replay protection** - `usedGameIds` zapobiega użyciu tego samego gameId dwa razy
- ✅ **Pausable** - owner może zatrzymać kontrakt w razie problemów
- ✅ **Skalowalny** - gotowy na miliony gier (wszystkie dane w eventach)
- ✅ **Gotowy do The Graph** - eventy są indeksowane off-chain
- ✅ **Professional pattern** - używa OpenZeppelin (industry standard)

## WAŻNE INFORMACJE:

- **Kontrakt wymaga OpenZeppelin** - muszę zainstalować `@openzeppelin/contracts` w Remix
- **Kontrakt ma konstruktor** - potrzebuję `validatorAddress` (adres backend servera, który podpisuje wyniki)
- **Kontrakt używa signature verification** - backend musi podpisać każdy wynik przed mintowaniem

## MOJE PYTANIA:

1. **Jak skonfigurować Remix IDE do wdrożenia na Base Mainnet?**
   - Jakie RPC URL użyć dla Base?
   - Jakie ustawienia kompilatora (Solidity version, EVM version)?

2. **Jak połączyć Remix z portfelem (np. Coinbase Wallet)?**
   - Krok po kroku: jak dodać Base network do portfela?
   - Jakie środki potrzebuję na Base Mainnet? (ile ETH na gas?)

3. **Jak wdrożyć kontrakt przez Remix?**
   - Który plik wkleić do Remix?
   - Jakie parametry konstruktora? (ten kontrakt nie ma konstruktora)
   - Jak potwierdzić transakcję w portfelu?

4. **Jak zweryfikować kontrakt na BaseScan?**
   - Krok po kroku: jak użyć BaseScan verification?
   - Jakie dane podać (Solidity version, optimization, etc.)?

5. **Jak przetestować kontrakt po wdrożeniu?**
   - Jak wywołać `mintScore` przez Remix?
   - Jak sprawdzić, czy event `ScoreMinted` został wyemitowany?

## DODATKOWE INFORMACJE:

- **Network:** Base Mainnet (Chain ID: 8453)
- **RPC URL:** https://mainnet.base.org (public) lub użyj własnego z Alchemy/Infura
- **Explorer:** https://basescan.org
- **Gas:** Szacuję ~0.001-0.01 ETH na Base (tanie!)

**Prowadź mnie krok po kroku, jakbym był początkujący. Daj mi konkretne instrukcje, które mogę skopiować i wkleić.**

---
