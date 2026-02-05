# 📋 LISTA PLIKÓW DO WERYFIKACJI KONTRAKTU

## Problem
Flattener nie dodał definicji OpenZeppelin do flattened kodu.

## Rozwiązanie: Dodaj wszystkie pliki ręcznie w Multi-Part

### Pliki do pobrania z GitHub OpenZeppelin v5.0.0:

1. **Twój kontrakt:**
   - `TimeGuesserRanking.sol` (z Remix/Cursor)

2. **OpenZeppelin - Główne pliki:**
   - `@openzeppelin/contracts/access/Ownable.sol`
   - `@openzeppelin/contracts/utils/cryptography/ECDSA.sol`
   - `@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol`
   - `@openzeppelin/contracts/utils/Pausable.sol`

3. **OpenZeppelin - Zależności (też potrzebne!):**
   - `@openzeppelin/contracts/utils/Context.sol` (używane przez Ownable i Pausable)
   - `@openzeppelin/contracts/utils/Strings.sol` (używane przez MessageHashUtils)

### Linki do pobrania:

**Główne pliki:**
- Ownable: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/access/Ownable.sol
- ECDSA: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/cryptography/ECDSA.sol
- MessageHashUtils: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/cryptography/MessageHashUtils.sol
- Pausable: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/Pausable.sol

**Zależności:**
- Context: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/Context.sol
- Strings: https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.0/contracts/utils/Strings.sol

### Jak dodać na Basescan:

1. Wróć do formularza weryfikacji
2. Wybierz **"Solidity (Multi-Part files)"**
3. Kliknij **"Upload File"**
4. Dodaj **wszystkie 7 plików** (Twój kontrakt + 6 plików OpenZeppelin)
5. Upewnij się, że ścieżki plików są poprawne:
   - Twój kontrakt: `contracts/TimeGuesserRanking.sol` (lub po prostu `TimeGuesserRanking.sol`)
   - OpenZeppelin: `@openzeppelin/contracts/access/Ownable.sol` itd.
6. Kliknij **"Verify and Publish"**

### Ważne:
- Wszystkie pliki muszą mieć rozszerzenie `.sol` (nie `.txt`!)
- Ścieżki plików muszą dokładnie odpowiadać importom w kodzie
