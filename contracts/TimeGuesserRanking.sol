// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TimeGuesserRanking {
    // Zdarzenie, które pozwoli Ci łatwo pobrać historię gier w frontendzie (przez Graph lub logi)
    event GamePlayed(address indexed player, uint256 score, uint256 timestamp);

    struct PlayerScore {
        uint256 highestScore;
        uint256 totalGamesPlayed;
    }

    // Mapa przechowująca wyniki graczy
    mapping(address => PlayerScore) public playerStats;

    // Funkcja zapisująca wynik po 5 rundach
    // _score: ile punktów zdobył gracz
    function saveGameResult(uint256 _score) public {
        PlayerScore storage stats = playerStats[msg.sender];
        
        // Zaktualizuj najwyższy wynik, jeśli obecny jest lepszy
        if (_score > stats.highestScore) {
            stats.highestScore = _score;
        }
        
        // Zwiększ licznik gier
        stats.totalGamesPlayed += 1;

        // Emituj zdarzenie (ważne dla Twojego frontendu i dla analityki Base)
        emit GamePlayed(msg.sender, _score, block.timestamp);
    }

    // Funkcja pomocnicza do pobrania statystyk gracza
    function getPlayerStats(address _player) public view returns (uint256, uint256) {
        return (playerStats[_player].highestScore, playerStats[_player].totalGamesPlayed);
    }
}
