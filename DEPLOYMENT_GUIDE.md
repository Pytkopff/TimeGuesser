# 🚀 Deployment Guide - TimeGuesserRanking with Signature Verification

## 📋 **PRZED WDROŻENIEM**

### 1. **Pobierz Private Key z Twojego Portfela**

Kontrakt wymaga adresu validatora, który będzie podpisywał wyniki. **Możesz użyć swojego głównego portfela!**

**Jak pobrać Private Key:**

**MetaMask:**
1. Otwórz MetaMask
2. Kliknij na 3 kropki (menu) → **"Account details"**
3. Kliknij **"Export Private Key"**
4. Wpisz hasło
5. **SKOPIUJ PRIVATE KEY** (zaczyna się od `0x`)

**Coinbase Wallet:**
1. Otwórz Coinbase Wallet
2. Settings → **"Show Recovery Phrase"** (lub użyj eksportu private key jeśli dostępny)
3. **UWAGA:** Jeśli nie ma opcji eksportu private key, możesz użyć seed phrase do wygenerowania (ale lepiej użyj MetaMask)

**WAŻNE:**
- ✅ **Możesz użyć swojego głównego portfela** - nie musisz tworzyć nowego
- ⚠️ **Zapisz private key bezpiecznie** - tylko w Vercel env vars, NIGDY w kodzie!
- ⚠️ **Ten portfel nie potrzebuje ETH na Base** - tylko podpisuje wiadomości (nie wysyła transakcji)

### 2. **Pobierz Adres z Private Key**

Z private key wygeneruj adres (to jest Twój `validatorAddress`):

**Opcja 1: W przeglądarce (MetaMask)**
- Twój adres to po prostu adres portfela w MetaMask (kopiuj z góry)

**Opcja 2: W Node.js (jeśli chcesz sprawdzić)**
```javascript
const { privateKeyToAccount } = require('viem/accounts');
const account = privateKeyToAccount('0xTWÓJ_PRIVATE_KEY');
console.log(account.address); // To jest validatorAddress
```

---

## 🔧 **KROK 1: Wdrożenie Kontraktu przez Remix**

### 1.1 Przygotuj Remix

1. Otwórz [remix.ethereum.org](https://remix.ethereum.org)
2. W zakładce **"File Explorer"** stwórz folder `contracts`
3. Wklej kod z `contracts/TimeGuesserRanking.sol`

### 1.2 Zainstaluj OpenZeppelin

1. W Remix, kliknij **"Solidity Compiler"**
2. W sekcji **"Advanced Config"** dodaj:
   ```json
   {
     "remappings": {
       "@openzeppelin/contracts": "https://github.com/OpenZeppelin/openzeppelin-contracts/releases/download/v5.0.0/openzeppelin-contracts.zip"
     }
   }
   ```
3. Lub użyj **"File Explorer"** → **"npm"** → wpisz `@openzeppelin/contracts@5.0.0`

### 1.3 Skompiluj

1. **Compiler:** `0.8.20`
2. **EVM Version:** `default`
3. Kliknij **"Compile TimeGuesserRanking.sol"**
4. ✅ Powinieneś zobaczyć zielony checkmark

### 1.4 Wdróż

1. Przejdź do **"Deploy & Run Transactions"**
2. **Environment:** `Injected Provider - MetaMask` (lub Coinbase Wallet)
3. **WAŻNE:** Upewnij się, że portfel jest na **Base Mainnet**!
4. W sekcji **"Deploy"** wpisz:
   - **Constructor args:** `0xTWÓJ_ADRES_PORTFELA` (Twój adres z MetaMask - ten sam, z którego masz private key!)
5. Kliknij **"Deploy"**
6. Potwierdź transakcję w portfelu
7. ⏳ Poczekaj na potwierdzenie (zwykle 1-2 sekundy na Base!)

### 1.5 Zapisz Adres Kontraktu

1. Po wdrożeniu zobaczysz adres w **"Deployed Contracts"**
2. **SKOPIUJ TEN ADRES!**
3. Zapisz go - będziesz go potrzebował

---

## ✅ **KROK 2: Weryfikacja na BaseScan**

1. Idź na [basescan.org](https://basescan.org)
2. Wklej adres kontraktu
3. Kliknij **"Contract"** → **"Verify and Publish"**
4. Wypełnij:
   - **Compiler:** `v0.8.20+commit.a1b79de6`
   - **License:** `MIT`
   - **Optimization:** `No`
   - **Constructor args:** `["0xTWÓJ_VALIDATOR_ADDRESS"]` (w formacie ABI-encoded)
5. Wklej kod z `contracts/TimeGuesserRanking.sol`
6. Kliknij **"Verify and Publish"**

---

## 🔐 **KROK 3: Konfiguracja Backend (Vercel)**

### 3.1 Dodaj Environment Variables

W [Vercel Dashboard](https://vercel.com/dashboard):

1. **Settings** → **Environment Variables**
2. Dodaj:

```
VALIDATOR_PRIVATE_KEY=0xTWÓJ_PRIVATE_KEY_Z_METAMASK
NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS=0xADRES_KONTRAKTU
```

**WAŻNE:**
- ✅ `VALIDATOR_PRIVATE_KEY` - to jest Twój private key z MetaMask (ten sam portfel, który użyłeś w konstruktorze!)
- ✅ `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS` - adres kontraktu z Remix
- ⚠️ To są **SECRETS** - nie commituj do gita!
- ⚠️ Private key musi zaczynać się od `0x` i mieć 66 znaków (0x + 64 hex)

### 3.2 Redeploy

1. Po dodaniu env vars, kliknij **"Redeploy"**
2. Poczekaj na zakończenie deploymentu

---

## 🧪 **KROK 4: Test**

### 4.1 Przetestuj w Remix

1. W Remix, w sekcji **"Deployed Contracts"**
2. Rozwiń `TIMEGUESSERRANKING`
3. Sprawdź:
   - `validatorAddress` - powinien być Twój adres validatora ✅
   - `bestScore` - powinien być 0 dla każdego adresu ✅

### 4.2 Przetestuj w Aplikacji

1. Otwórz aplikację na Vercel
2. Zagraj 5 rund
3. Po zakończeniu kliknij **"Prepare mint"**
4. Powinieneś zobaczyć **"Mint score"** button
5. Kliknij i potwierdź transakcję
6. ✅ Sprawdź na BaseScan, czy transakcja przeszła

---

## 🆘 **TROUBLESHOOTING**

### Problem: "Invalid signature"

**Przyczyna:** Backend generuje podpis inaczej niż kontrakt oczekuje.

**Rozwiązanie:**
- Sprawdź, czy `VALIDATOR_PRIVATE_KEY` w Vercel jest taki sam jak użyty w konstruktorze
- Sprawdź, czy `encodePacked` w backendzie używa tych samych typów co kontrakt
- Sprawdź logi w Vercel Functions (`/api/sign-score`)

### Problem: "Game ID already used"

**Przyczyna:** Próbujesz zmintować ten sam `gameId` dwa razy.

**Rozwiązanie:**
- Każda gra musi mieć unikalny `gameId` (UUID)
- Sprawdź, czy frontend generuje nowy UUID dla każdej gry

### Problem: "Contract is paused"

**Przyczyna:** Kontrakt został zatrzymany przez ownera.

**Rozwiązanie:**
- W Remix, wywołaj `unpause()` jako owner
- Lub sprawdź, czy ktoś nie zatrzymał kontraktu

### Problem: OpenZeppelin import fails in Remix

**Rozwiązanie:**
- Użyj **"File Explorer"** → **"npm"** → wpisz `@openzeppelin/contracts@5.0.0`
- Lub użyj URL w remappings (patrz krok 1.2)

---

## 📚 **DODATKOWE ZASOBY**

- **OpenZeppelin Docs:** https://docs.openzeppelin.com/contracts
- **Remix Docs:** https://remix-ide.readthedocs.io
- **BaseScan:** https://basescan.org
- **Viem Docs:** https://viem.sh/docs

---

## 🔒 **SECURITY CHECKLIST**

- ✅ Validator private key jest w Vercel env vars (nie w kodzie!)
- ✅ Kontrakt używa `Ownable` i `Pausable` (możesz zatrzymać w razie problemów)
- ✅ `usedGameIds` zapobiega replay attacks
- ✅ Signature verification zapobiega manipulacji wyników
- ✅ Kontrakt jest zweryfikowany na BaseScan

---

**Gotowe! 🎉 Twój kontrakt jest wdrożony i zabezpieczony!**
