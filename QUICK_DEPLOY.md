# ⚡ Szybki Start - Wdrożenie w 5 krokach

## 🎯 **TL;DR:**
1. Skopiuj private key z MetaMask
2. Wdróż kontrakt przez Remix (podaj swój adres w konstruktorze)
3. Dodaj env vars do Vercel
4. Gotowe! 🎉

---

## 📝 **KROK 1: Pobierz Private Key**

**MetaMask:**
1. Otwórz MetaMask
2. Menu (3 kropki) → **"Account details"**
3. **"Export Private Key"** → wpisz hasło
4. **SKOPIUJ** (zaczyna się od `0x`)

**Twój adres portfela:**
- To jest ten adres, który widzisz na górze MetaMask
- Skopiuj go też - będziesz go potrzebował

---

## 🚀 **KROK 2: Wdróż Kontrakt**

1. Otwórz [remix.ethereum.org](https://remix.ethereum.org)
2. Wklej kod z `contracts/TimeGuesserRanking.sol`
3. **File Explorer** → **npm** → wpisz `@openzeppelin/contracts@5.0.0`
4. **Compile** (Solidity 0.8.20)
5. **Deploy** → **Injected Provider**
6. **WAŻNE:** Upewnij się, że jesteś na **Base Mainnet**!
7. W **Constructor args** wpisz: **Twój adres z MetaMask** (ten sam, z którego masz private key!)
8. Kliknij **"Deploy"**
9. **SKOPIUJ ADRES KONTRAKTU** (pojawi się po wdrożeniu)

---

## ⚙️ **KROK 3: Dodaj do Vercel**

1. [Vercel Dashboard](https://vercel.com/dashboard) → Twój projekt
2. **Settings** → **Environment Variables**
3. Dodaj:

```
VALIDATOR_PRIVATE_KEY=0xTWÓJ_PRIVATE_KEY_Z_METAMASK
NEXT_PUBLIC_SCORE_CONTRACT_ADDRESS=0xADRES_KONTRAKTU_Z_REMIX
```

4. **Save**
5. **Redeploy** (lub poczekaj na auto-deploy)

---

## ✅ **KROK 4: Zweryfikuj na BaseScan (opcjonalne)**

1. [basescan.org](https://basescan.org) → wklej adres kontraktu
2. **Contract** → **"Verify and Publish"**
3. Wypełnij formularz (patrz `DEPLOYMENT_GUIDE.md`)

---

## 🧪 **KROK 5: Przetestuj**

1. Otwórz aplikację na Vercel
2. Zagraj 5 rund
3. Kliknij **"Prepare mint"** → **"Mint score"**
4. ✅ Powinno działać!

---

## ❓ **FAQ**

**Q: Czy muszę tworzyć nowy portfel?**  
A: **NIE!** Możesz użyć swojego głównego portfela z MetaMask.

**Q: Czy ten portfel potrzebuje ETH?**  
A: **TAK** - potrzebujesz ETH na Base do wdrożenia kontraktu (jednorazowo ~0.01 ETH). Potem portfel nie wysyła transakcji, tylko podpisuje wiadomości (darmowe).

**Q: Czy private key jest bezpieczny w Vercel?**  
A: **TAK** - Vercel env vars są szyfrowane i dostępne tylko na serwerze. NIE commituj do gita!

**Q: Co jeśli zgubię private key?**  
A: Możesz zmienić validatora w kontrakcie (funkcja `setValidatorAddress`), ale musisz być ownerem kontraktu.

---

**Gotowe! 🎉 Teraz jest prościej!**
