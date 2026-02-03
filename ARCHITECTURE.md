# 🏗️ TimeGuesser Architecture - Professional Event-Based Design

## 📐 **ARCHITEKTURA SYSTEMU**

```
┌─────────────────┐
│   Frontend      │
│  (Next.js App)  │
└────────┬────────┘
         │
         │ 1. User plays 5 rounds
         │ 2. Calls mintScore(gameId, score)
         │
         ▼
┌─────────────────┐
│  Smart Contract │
│  (Base Mainnet) │
└────────┬────────┘
         │
         │ 3. Emits ScoreMinted event
         │ 4. Updates bestScore (minimal storage)
         │
         ├─────────────────┬──────────────────┐
         │                 │                  │
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase   │  │  The Graph   │  │  BaseScan     │
│  (Off-chain  │  │  (Optional)  │  │  (Explorer)   │
│   Indexing)  │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
         │
         │ 5. Leaderboard built from events
         │
         ▼
┌─────────────────┐
│   Leaderboard   │
│   (Supabase DB) │
└─────────────────┘
```

---

## 🎯 **DLACZEGO EVENT-BASED?**

### ✅ **Zalety:**
1. **Gas Efficient** - nie przechowujemy wszystkich wyników on-chain
2. **Skalowalne** - miliony gier, zero problemów
3. **Off-chain Indexing** - Supabase/The Graph buduje leaderboard
4. **Immutable History** - wszystkie eventy są na blockchainie
5. **Professional Pattern** - tak robią najlepsze aplikacje (Uniswap, Aave, etc.)

### ❌ **Stary kontrakt (zły):**
- Przechowywał wszystkie wyniki w `allScores[]` array ❌
- `getTopScores()` zwracał ostatnie N, nie najwyższe ❌
- Sortowanie on-chain = drogie ❌
- Limit skalowalności ❌

### ✅ **Nowy kontrakt (dobry):**
- Tylko eventy + minimalne storage (bestScore) ✅
- Leaderboard w Supabase (off-chain) ✅
- Skalowalne do milionów gier ✅
- Gotowy do The Graph indexing ✅

---

## 📦 **CO JEST W KONTRAKCIE?**

### **Storage (minimalne):**
```solidity
mapping(address => uint256) public bestScore;  // Tylko najlepszy wynik
mapping(address => uint256) public totalGames; // Licznik gier
```

### **Event (source of truth):**
```solidity
event ScoreMinted(
    address indexed player,
    string indexed gameId,
    uint256 score,
    uint256 timestamp,
    bool isNewBest
);
```

### **Funkcja:**
```solidity
function mintScore(string memory gameId, uint256 score) external
```

---

## 🔄 **FLOW WDROŻENIA**

### **1. User gra 5 rund**
- Frontend: `app/page.tsx`
- Wynik zapisany w Supabase (`games` table)

### **2. User mintuje wynik**
- Frontend: `components/MintScore.tsx`
- Wywołuje `mintScore(gameId, score)` na kontrakcie
- Kontrakt emituje `ScoreMinted` event

### **3. Off-chain indexing (Supabase)**
- API route: `app/api/score/route.ts`
- Weryfikuje transakcję on-chain
- Zapisuje do Supabase:
  - `users` table (wallet address)
  - `games` table (game result)
  - `mints` table (on-chain proof)

### **4. Leaderboard (Supabase)**
- Leaderboard jest budowany z tabeli `mints` (tylko zmintowane wyniki)
- Query: `SELECT * FROM mints WHERE status = 'success' ORDER BY score DESC LIMIT 50`
- Frontend: `/leaderboard` page (do zrobienia)

---

## 🗄️ **SUPABASE SCHEMA**

### **Tabela: `users`**
```sql
canonical_user_id (text, PK)  -- wallet address
wallet (text)                   -- wallet address (duplicate for convenience)
created_at (timestamp)
updated_at (timestamp)
```

### **Tabela: `games`**
```sql
id (uuid, PK)                  -- gameId from frontend
canonical_user_id (text, FK)   -- wallet address
ended_at (timestamp)           -- when game finished
total_score (integer)          -- final score
created_at (timestamp)
```

### **Tabela: `mints`**
```sql
id (uuid, PK)
game_id (uuid, FK)             -- references games.id
tx_hash (text, unique)         -- on-chain transaction hash
chain_id (integer)             -- 8453 for Base
status (text)                  -- 'success' | 'failed'
created_at (timestamp)
```

### **View: `leaderboard` (do stworzenia)**
```sql
CREATE VIEW leaderboard AS
SELECT 
  u.wallet,
  g.total_score as score,
  g.ended_at as played_at,
  m.tx_hash,
  ROW_NUMBER() OVER (ORDER BY g.total_score DESC) as rank
FROM mints m
JOIN games g ON m.game_id = g.id
JOIN users u ON g.canonical_user_id = u.canonical_user_id
WHERE m.status = 'success'
ORDER BY g.total_score DESC;
```

---

## 🚀 **NEXT STEPS**

1. ✅ **Kontrakt** - gotowy (event-based)
2. ✅ **API route** - gotowy (weryfikuje on-chain)
3. ⏳ **Leaderboard page** - do zrobienia (`/leaderboard`)
4. ⏳ **Indexer script** (opcjonalny) - do czytania eventów z blockchaina

---

## 📚 **DODATKOWE ZASOBY**

- **The Graph:** https://thegraph.com/docs/en/ (opcjonalne, dla większej skali)
- **Supabase Realtime:** https://supabase.com/docs/guides/realtime (dla live leaderboard)
- **Base Events:** https://docs.base.org/tools/explorers (sprawdzanie eventów)

---

**To jest profesjonalna architektura używana przez najlepsze aplikacje DeFi i gaming na Base! 🎯**
