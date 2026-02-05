# ✅ Sprawdzenie Validator Address

## Problem
Kontrakt wymaga, żeby `validatorAddress` w kontrakcie pasował do adresu portfela, którego `VALIDATOR_PRIVATE_KEY` jest w Vercel.

## Jak sprawdzić:

### 1. Sprawdź validatorAddress w kontrakcie (Remix):

1. Otwórz Remix
2. Przejdź do zakładki **"Deploy & Run Transactions"**
3. W sekcji **"Deployed Contracts"** znajdź swój kontrakt `TimeGuesserRanking`
4. Rozwiń kontrakt i znajdź funkcję **`validatorAddress`** (view function)
5. Kliknij **"validatorAddress"** - zobaczysz adres (np. `0x1234...5678`)

### 2. Sprawdź adres z VALIDATOR_PRIVATE_KEY:

1. Wejdź na: https://www.myetherwallet.com/tools/private-key-to-address
2. Wklej swój `VALIDATOR_PRIVATE_KEY` z Vercel
3. Zobacz wygenerowany adres

### 3. Porównaj:

- **Adres z kontraktu** (Remix) == **Adres z private key** (MEW)
- Jeśli są **RÓŻNE** → musisz użyć `setValidatorAddress()` w Remix

### 4. Jeśli są różne - napraw w Remix:

1. W Remix, w sekcji **"Deployed Contracts"**
2. Znajdź funkcję **`setValidatorAddress`**
3. Wpisz prawidłowy adres (ten z private key)
4. Kliknij **"transact"** i potwierdź w MetaMask

---

## Ważne:

- **Owner kontraktu** = adres, z którego deployowałeś (główny portfel)
- **Validator address** = adres portfela, którego private key jest w `VALIDATOR_PRIVATE_KEY`
- Te dwa adresy mogą być **różne** (i powinny być dla bezpieczeństwa)
