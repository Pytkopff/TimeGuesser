// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;






/**
 * @title TimeGuesserRanking
 * @notice Professional event-based score contract with signature verification
 * @dev Uses event-based architecture: contract only emits events, leaderboard is built off-chain
 * @dev Minimal on-chain storage: only best score per player (gas efficient)
 * @dev Security: Backend signature verification prevents score manipulation
 * @dev Ready for The Graph indexing and Supabase off-chain leaderboard
 */
contract TimeGuesserRanking is Ownable, Pausable {
    using ECDSA for bytes32;
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

    /**
     * @notice Mapping: gameId => whether it has been used
     * @dev Prevents replay attacks - same gameId cannot be minted twice
     */
    mapping(string => bool) public usedGameIds;

    /**
     * @notice Address of the backend validator that signs scores
     * @dev Only scores signed by this address will be accepted
     */
    address public validatorAddress;

    // ============ CONSTRUCTOR ============

    /**
     * @notice Deploy contract with initial validator address
     * @param _initialValidator Address of backend server that will sign scores
     */
    constructor(address _initialValidator) Ownable(msg.sender) {
        validatorAddress = _initialValidator;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Update validator address (only owner)
     * @param _newValidator New validator address
     */
    function setValidatorAddress(address _newValidator) external onlyOwner {
        validatorAddress = _newValidator;
    }

    /**
     * @notice Pause contract in case of emergency (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ FUNCTIONS ============

    /**
     * @notice Mint a score after completing 5 rounds (with signature verification)
     * @param gameId Unique game identifier (UUID from frontend)
     * @param score Total points earned in the game (0-5000 max)
     * @param signature Backend signature proving score validity
     * @dev Backend must sign: keccak256(gameId, score, player) before calling
     * @dev Emits ScoreMinted event which is indexed off-chain for leaderboard
     * @dev Only updates bestScore if current score is better (gas efficient)
     * @dev All score history is available via events, not stored on-chain
     */
    function mintScore(
        string memory gameId,
        uint256 score,
        bytes memory signature
    ) external whenNotPaused {
        require(score <= 5000, "Score exceeds maximum");
        require(bytes(gameId).length > 0, "GameId cannot be empty");
        require(!usedGameIds[gameId], "Game ID already used");

        address player = msg.sender;

        // Verify signature: backend must sign keccak256(gameId, score, player)
        bytes32 messageHash = keccak256(abi.encodePacked(gameId, score, player));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(
            ethSignedMessageHash.recover(signature) == validatorAddress,
            "Invalid signature"
        );

        // Mark gameId as used (prevent replay)
        usedGameIds[gameId] = true;

        bool isNewBest = false;

        // Update best score only if current is better (minimal storage write)
        if (score > bestScore[player]) {
            bestScore[player] = score;
            isNewBest = true;
        }

        // Increment total games counter
        totalGames[player] += 1;

        // Emit event - this is the source of truth for leaderboard (off-chain indexing)
        emit ScoreMinted(player, gameId, score, block.timestamp, isNewBest);
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



