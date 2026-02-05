# 🔍 WERYFIKACJA KONTRAKTU NA BASESCAN

## Problem
Kontrakt używa importów OpenZeppelin, które Basescan nie widzi automatycznie.

## Rozwiązanie: Flattened Code

### Krok 1: Kliknij "Verify and Publish" na Basescan
- Na stronie kontraktu kliknij link "Verify and Publish"
- Zobaczysz formularz weryfikacji

### Krok 2: Wybierz opcję weryfikacji
Na Basescan powinny być dostępne opcje:
- **"Solidity (Single file)"** - dla flattened kodu
- **"Solidity (Multi-file)"** - dla wielu plików
- **"Standard JSON Input"** - dla JSON z Remix

### Krok 3A: Jeśli masz opcję "Multi-file"
1. Dodaj plik 1: Twój kontrakt (`TimeGuesserRanking.sol`)
2. Dodaj pliki OpenZeppelin (pobierz z GitHub):
   - https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/access/Ownable.sol
   - https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/cryptography/ECDSA.sol
   - https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/cryptography/MessageHashUtils.sol
   - https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/Pausable.sol

### Krok 3B: Jeśli masz tylko "Single file"
Użyj online flattener:
1. Wejdź na: https://github.com/poanetwork/solidity-flattener (lub użyj Hardhat)
2. Wklej kod kontraktu
3. Wygeneruj flattened kod
4. Wklej na Basescan

### Krok 4: Ustawienia kompilacji
- **Compiler Version:** `0.8.31` (lub ta, którą użyłeś w Remix)
- **Optimization:** `No` (lub `Yes` z 200 runs, jeśli tak kompilowałeś)
- **Contract Name:** `TimeGuesserRanking`

### Krok 5: Constructor Arguments
Jeśli wdrożyłeś z argumentem `_initialValidator`, musisz go podać:
- Format: `["0xTWÓJ_ADRES_VALIDATORA"]` (bez cudzysłowów wokół adresu)

## Alternatywa: Sourcify
Jeśli Basescan nie działa, możesz zweryfikować przez Sourcify:
- https://sourcify.dev/
- Wybierz Base network
- Wklej adres kontraktu
- Sourcify automatycznie znajdzie kod z Remix (jeśli używałeś Remix)

## Najprostsze rozwiązanie
**Użyj opcji "Multi-file" na Basescan** - to najłatwiejsze, bo nie musisz flattenować kodu.
