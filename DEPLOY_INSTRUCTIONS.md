# 🚀 Instrukcja wdrożenia kontraktu TimeGuesserRanking na Base Mainnet

## 📋 PRZED WDROŻENIEM

### 1. Przygotuj środki na Base Mainnet
- Potrzebujesz **~0.01 ETH na Base** (na gas fees)
- Jak zdobyć ETH na Base:
  - Bridge z Ethereum Mainnet przez [Base Bridge](https://bridge.base.org)
  - Kup na giełdzie i wyślij na Base (taniej niż na Ethereum!)
  - Użyj [Coinbase](https://www.coinbase.com) - automatyczny bridge

### 2. Przygotuj portfel
- **Coinbase Wallet** (zalecane dla Base)
- **MetaMask** (z dodaną siecią Base)
- **Rainbow Wallet**

---

## 🔧 KROK 1: Dodaj Base Network do portfela

### Dla MetaMask:
1. Otwórz MetaMask → Settings → Networks → Add Network
2. Wpisz ręcznie:
   - **Network Name:** Base Mainnet
   - **RPC URL:** `https://mainnet.base.org`
   - **Chain ID:** `8453`
   - **Currency Symbol:** `ETH`
   - **Block Explorer:** `https://basescan.org`

### Dla Coinbase Wallet:
- Base jest już wbudowany! Wystarczy wybrać "Base" z listy sieci.

---

## 📝 KROK 2: Wdrożenie przez Remix IDE

### 2.1 Otwórz Remix
1. Idź na [remix.ethereum.org](https://remix.ethereum.org)
2. Stwórz nowy plik: `TimeGuesserRanking.sol`
3. Skopiuj zawartość z `contracts/TimeGuesserRanking.sol` i wklej do Remix

### 2.2 Skompiluj kontrakt
1. Przejdź do zakładki **"Solidity Compiler"** (ikona z literą "S")
2. Ustaw:
   - **Compiler:** `0.8.20` (lub najnowsza 0.8.x)
   - **EVM Version:** `default` lub `london`
3. Kliknij **"Compile TimeGuesserRanking.sol"**
4. ✅ Powinieneś zobaczyć zielony checkmark

### 2.3 Wdróż kontrakt
1. Przejdź do zakładki **"Deploy & Run Transactions"** (ikona z literą "D")
2. W sekcji **"Environment"** wybierz: **"Injected Provider - MetaMask"** (lub "Injected Provider - WalletConnect" dla Coinbase Wallet)
3. **WAŻNE:** Upewnij się, że w portfelu wybrałeś **Base Mainnet** (nie Ethereum!)
4. W sekcji **"Contract"** wybierz: `TimeGuesserRanking - contracts/TimeGuesserRanking.sol`
5. **Kontrakt nie ma konstruktora**, więc nie musisz podawać parametrów
6. Kliknij **"Deploy"**
7. Potwierdź transakcję w portfelu
8. ⏳ Poczekaj na potwierdzenie (zwykle 1-2 sekundy na Base!)

### 2.4 Zapisz adres kontraktu
1. Po wdrożeniu zobaczysz adres kontraktu w sekcji **"Deployed Contracts"**
2. **SKOPIUJ TEN ADRES!** (będzie wyglądał jak `0x1234...5678`)
3. Zapisz go w pliku `.env.local`:
   ```
   NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS=0xTwójAdresTutaj
   ```

---

## ✅ KROK 3: Weryfikacja kontraktu na BaseScan

### 3.1 Otwórz BaseScan
1. Idź na [basescan.org](https://basescan.org)
2. Wklej adres kontraktu w wyszukiwarkę
3. Kliknij na zakładkę **"Contract"**
4. Kliknij **"Verify and Publish"**

### 3.2 Wypełnij formularz weryfikacji
1. **Compiler Type:** `Solidity (Single file)`
2. **Compiler Version:** `v0.8.20+commit.a1b79de6` (lub najnowsza 0.8.20)
3. **License:** `MIT`
4. **Optimization:** `No` (lub `Yes` jeśli kompilowałeś z optimization)
5. Wklej **cały kod kontraktu** z `contracts/TimeGuesserRanking.sol`
6. Kliknij **"Verify and Publish"**

### 3.3 Sprawdź weryfikację
- Po ~30 sekundach powinieneś zobaczyć zielony checkmark ✅
- Kod źródłowy będzie widoczny publicznie na BaseScan

---

## 🧪 KROK 4: Test kontraktu

### 4.1 Przetestuj przez Remix
1. W Remix, w sekcji **"Deployed Contracts"**, rozwiń `TIMEGUESSERRANKING`
2. Kliknij na funkcję `mintScore`
3. Wpisz:
   - **gameId:** `"test-game-123"` (w cudzysłowach!)
   - **score:** `4500`
4. Kliknij **"transact"**
5. Potwierdź w portfelu
6. ✅ Sprawdź, czy transakcja przeszła na BaseScan

### 4.2 Sprawdź event
1. Na BaseScan, w zakładce **"Events"** powinieneś zobaczyć `ScoreMinted`
2. Sprawdź, czy dane są poprawne

---

## 🔗 KROK 5: Podłącz do aplikacji

### 5.1 Dodaj adres do Vercel
1. Idź do [Vercel Dashboard](https://vercel.com/dashboard)
2. Wybierz projekt **TimeGuesser**
3. Settings → Environment Variables
4. Dodaj:
   - **Key:** `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS`
   - **Value:** `0xTwójAdresKontraktu`
5. Kliknij **"Save"**
6. **Redeploy** aplikację (lub poczekaj na auto-deploy)

### 5.2 Przetestuj w aplikacji
1. Otwórz aplikację na Vercel
2. Zagraj 5 rund
3. Po zakończeniu powinieneś zobaczyć przycisk **"Mint score"**
4. Połącz portfel i zmintuj wynik
5. ✅ Sprawdź na BaseScan, czy transakcja przeszła!

---

## 🆘 TROUBLESHOOTING

### Problem: "Insufficient funds"
- **Rozwiązanie:** Dodaj więcej ETH na Base (minimum 0.01 ETH)

### Problem: "Contract deployment failed"
- **Rozwiązanie:** 
  - Sprawdź, czy jesteś na Base Mainnet (nie testnet!)
  - Sprawdź, czy kompilacja przeszła bez błędów
  - Zwiększ gas limit w Remix

### Problem: "Verification failed on BaseScan"
- **Rozwiązanie:**
  - Upewnij się, że używasz tej samej wersji kompilatora
  - Sprawdź, czy wkleiłeś cały kod (łącznie z `// SPDX-License-Identifier: MIT`)
  - Spróbuj z `Optimization: Yes` jeśli kompilowałeś z optimization

### Problem: "mintScore nie działa w aplikacji"
- **Rozwiązanie:**
  - Sprawdź, czy `NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS` jest ustawione w Vercel
  - Sprawdź konsolę przeglądarki (F12) - mogą być błędy
  - Upewnij się, że portfel jest połączony z Base Mainnet

---

## 📚 DODATKOWE ZASOBY

- **Base Docs:** https://docs.base.org
- **Remix Docs:** https://remix-ide.readthedocs.io
- **BaseScan:** https://basescan.org
- **Base Bridge:** https://bridge.base.org

---

**Gotowe! 🎉 Twój kontrakt jest wdrożony i gotowy do użycia!**
