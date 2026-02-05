# 📋 PODSUMOWANIE PROBLEMÓW - TimeGuesser Contract

## 🎯 Cel projektu
Gra TimeGuesser na Base/Farcaster z on-chain score verification. Po 5 rundach gracz może "zmintować" swój wynik na blockchainie.

## 📦 Stack technologiczny
- **Frontend:** Next.js 15.1.4, React 19
- **Blockchain:** Base Network, @coinbase/onchainkit, wagmi, viem
- **Backend:** Next.js API Routes (Vercel)
- **Smart Contract:** Solidity 0.8.31, OpenZeppelin Contracts v5.0.0
- **Database:** Supabase

---

## ❌ PROBLEM 1: BigInt Serialization Error w `/api/sign-score`

### Opis problemu:
Backend endpoint `/api/sign-score` zwracał błąd 500 z komunikatem:
```
TypeError: Do not know how to serialize a BigInt
at JSON.stringify (<anonymous>)
at l.json (.next/server/chunks/1692.js:1:6745)
```

### Co próbowaliśmy naprawić:

1. **Konwersja wartości na stringi:**
   - `signature` → `String(signature)`
   - `validatorAddress` → `String(account.address)`
   - `messageHash` → `String(hash)`
   - `ethSignedMessageHash` → `String(hash)`

2. **Custom JSON.stringify z replacerem:**
   ```typescript
   const jsonString = JSON.stringify(responseData, (key, value) => {
     if (typeof value === 'bigint') {
       return value.toString();
     }
     return value;
   });
   ```

3. **Zastąpienie `NextResponse.json()` przez `new NextResponse()`:**
   - Wszystkie odpowiedzi używają teraz `safeJsonResponse()` helper function
   - Każda odpowiedź przechodzi przez custom JSON.stringify z BigInt replacerem

4. **Bezpieczne logowanie:**
   - Wszystkie wartości w logach są konwertowane na stringi/liczby przed logowaniem
   - Usunięto logowanie całych obiektów błędów

### Aktualny stan:
**Problem nadal występuje** - błąd BigInt serialization pojawia się w Vercel Logs mimo wszystkich powyższych zmian.

### Kod endpointu:
Plik: `app/api/sign-score/route.ts`

```typescript
// Używa viem do podpisywania:
import { sign } from "viem/accounts";
const signature = await sign({
  hash: ethSignedMessageHash as `0x${string}`,
  privateKey: VALIDATOR_PRIVATE_KEY as `0x${string}`,
});
```

### Pytania do analizy:
- Czy `sign()` z viem zwraca obiekt zawierający BigInt?
- Czy problem może być w `hashMessage()` lub `toBytes()` z viem?
- Czy Next.js 15 ma problemy z serializacją BigInt w API Routes?

---

## ❌ PROBLEM 2: Weryfikacja kontraktu na Basescan

### Opis problemu:
Kontrakt używa importów OpenZeppelin:
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
```

Basescan nie może zweryfikować kontraktu - brakuje zależności.

### Co próbowaliśmy:

1. **Multi-Part Files verification:**
   - Dodaliśmy główne pliki OpenZeppelin (Ownable, ECDSA, MessageHashUtils, Pausable)
   - Błąd: brakuje zależności (`Context.sol`, `Strings.sol`)
   - Dodaliśmy zależności
   - Błąd: brakuje kolejnych zależności (`Math.sol`, `SafeCast.sol`, `SignedMath.sol`, `Bytes.sol`)

2. **Single File (Flattened):**
   - Próba użycia `@poanet/solidity-flattener` - nie dodał definicji OpenZeppelin
   - Próba użycia `hardhat flatten` - wymaga konfiguracji Hardhat

3. **Standard JSON Input:**
   - Nie znaleziono tej opcji w Remix

### Aktualny stan:
**Kontrakt nie jest zweryfikowany** - Basescan wymaga wszystkich zależności OpenZeppelin (łącznie ~15+ plików).

### Pytania do analizy:
- Czy jest prostszy sposób na weryfikację kontraktów z OpenZeppelin na Basescan?
- Czy można użyć Sourcify zamiast Basescan?
- Czy kontrakt bez weryfikacji może działać poprawnie?

---

## ❌ PROBLEM 3: Transakcje nie działają w grze

### Opis problemu:
Po kliknięciu "Prepare mint" → "Mint score" transakcja nie działa.

### Co wiemy:
- Kontrakt jest wdrożony: `0x558D104f4CB3DF32767b806E4f1Ecd751a397C4C`
- `VALIDATOR_PRIVATE_KEY` jest ustawiony w Vercel
- `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS` jest ustawiony w Vercel
- Frontend używa `@coinbase/onchainkit` do transakcji

### Możliwe przyczyny:
1. **Backend `/api/sign-score` zwraca błąd 500** (Problem 1) → frontend nie może dostać podpisu
2. **Błędny adres validatora** w kontrakcie vs `VALIDATOR_PRIVATE_KEY` w Vercel
3. **Problem z network** - frontend łączy się z testnetem zamiast mainnetem
4. **Problem z ABI** - może być niezgodność między kontraktem a frontendem

### Kod frontendu:
Plik: `components/MintScore.tsx`

```typescript
// 1. Pobiera podpis z backendu
const res = await fetch("/api/sign-score", {
  method: "POST",
  body: JSON.stringify({ gameId, score, player: address.toLowerCase() }),
});

// 2. Tworzy transakcję
const calls = [{
  to: SCORE_CONTRACT_ADDRESS,
  data: encodeFunctionData({
    abi: SCORE_CONTRACT_ABI,
    functionName: "mintScore",
    args: [gameId, BigInt(score), signature],
  }),
}];

// 3. Wywołuje transakcję przez OnchainKit
<Transaction chainId={base.id} calls={calls}>
  <TransactionButton text="Mint score" />
</Transaction>
```

### Pytania do analizy:
- Czy błąd BigInt w `/api/sign-score` blokuje cały flow?
- Czy `sign()` z viem zwraca poprawny format podpisu?
- Czy `encodeFunctionData` z viem poprawnie koduje argumenty?

---

## 📝 Smart Contract

### Adres kontraktu:
`0x558D104f4CB3DF32767b806E4f1Ecd751a397C4C` (Base Mainnet)

### Funkcja `mintScore`:
```solidity
function mintScore(
    string memory gameId,
    uint256 score,
    bytes memory signature
) external whenNotPaused {
    // Weryfikacja podpisu
    bytes32 messageHash = keccak256(abi.encodePacked(gameId, score, player));
    bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
    require(
        ethSignedMessageHash.recover(signature) == validatorAddress,
        "Invalid signature"
    );
    // ...
}
```

### Backend signature generation:
```typescript
// app/api/sign-score/route.ts
const messageHash = keccak256(
  encodePacked(
    ["string", "uint256", "address"],
    [gameId, BigInt(Math.floor(score)), normalizedPlayer]
  )
);
const ethSignedMessageHash = hashMessage({ raw: toBytes(messageHash) });
const signature = await sign({
  hash: ethSignedMessageHash,
  privateKey: VALIDATOR_PRIVATE_KEY as `0x${string}`,
});
```

---

## 🔍 Kluczowe pytania do analizy:

1. **BigInt Serialization:**
   - Dlaczego `JSON.stringify` próbuje serializować BigInt mimo konwersji na stringi?
   - Czy problem jest w `sign()` z viem, czy w `hashMessage()`?
   - Czy Next.js 15 ma znane problemy z BigInt w API Routes?

2. **Weryfikacja kontraktu:**
   - Czy kontrakt bez weryfikacji może działać poprawnie?
   - Jaki jest najprostszy sposób na weryfikację kontraktów z OpenZeppelin na Basescan?

3. **Transakcje:**
   - Czy błąd BigInt w `/api/sign-score` blokuje cały flow?
   - Czy `sign()` z viem zwraca poprawny format podpisu dla Solidity `recover()`?

---

## 📦 Wersje pakietów:

```json
{
  "next": "15.1.4",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "@coinbase/onchainkit": "0.33.0",
  "wagmi": "2.12.0",
  "viem": "2.21.0",
  "@openzeppelin/contracts": "^5.0.0"
}
```

---

## 🎯 Priorytety:

1. **NAPRAW BigInt serialization** - bez tego transakcje nie działają
2. **Zweryfikuj kontrakt** - opcjonalne, ale ważne dla zaufania
3. **Przetestuj pełny flow** - od gry do mintowania wyniku

---

**Data:** 2026-02-04
**Status:** Blocked - BigInt serialization error unblocking transactions
