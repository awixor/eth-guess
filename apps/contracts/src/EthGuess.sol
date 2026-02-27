// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EthGuess
 * @dev A simple 60-second UP/DOWN price prediction game on ETH/USD.
 * @notice An Oracle (the backend operator) regulates the start and resolution of rounds.
 */
contract EthGuess {
    // -------------------------------------------------------------------------
    // Structs
    // -------------------------------------------------------------------------

    struct Round {
        uint256 startPrice; // The price of ETH at T=0
        uint256 endPrice; // The price of ETH at T=60
        uint256 startTime; // Timestamp when the round started
        uint256 endTime; // Timestamp when the round ended/resolves
        uint256 totalPool; // Total amount of ETH wagered
        uint256 upPool; // Total amount of ETH wagered on UP
        uint256 downPool; // Total amount of ETH wagered on DOWN
        bool settled; // True if the round has been resolved by operator
    }

    struct Prediction {
        bool guessedUp; // true = UP, false = DOWN
        uint256 amount; // Wei wagered
        bool claimed; // True if winnings have been withdrawn
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------

    address public owner;
    address public operator; // The backend service wallet that sets prices
    uint256 public minBet; // Minimum wager allowed (in wei)
    uint256 public protocolFee; // Total accumulated fees pending withdrawal
    uint16 public feePercent; // Protocol fee percentage (e.g. 500 = 5%) - denominator 10000

    uint256 public currentRoundId;

    // TODO: Add mapping for storing rounds (roundId => Round)

    // TODO: Add mapping for storing bets (roundId => (player => Prediction))

    // A simple reentrancy lock status (1 = unlocked, 2 = locked)
    uint256 private _status;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event RoundStarted(
        uint256 indexed roundId,
        uint256 startPrice,
        uint256 startTime
    );
    event BetPlaced(
        uint256 indexed roundId,
        address indexed player,
        bool guessedUp,
        uint256 amount
    );
    event RoundSettled(uint256 indexed roundId, uint256 endPrice, bool upWon);
    event WinningsClaimed(
        uint256 indexed roundId,
        address indexed player,
        uint256 amount
    );
    event OperatorChanged(
        address indexed previousOperator,
        address indexed newOperator
    );
    event MinBetChanged(uint256 newMinBet);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        require(msg.sender == owner, "EthGuess: Caller is not owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "EthGuess: Caller is not operator");
        _;
    }

    modifier nonReentrant() {
        require(_status != 2, "EthGuess: ReentrancyGuard: reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address _operator) {
        require(_operator != address(0), "EthGuess: Invalid operator");
        owner = msg.sender;
        operator = _operator;
        minBet = 0.001 ether; // Default min bet
        feePercent = 500; // Default 5% protocol fee
        _status = 1;
    }

    // -------------------------------------------------------------------------
    // Operator Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Called by backend oracle every minute to start a new round.
     */
    function startRound(uint256 _startPrice) external onlyOperator {
        // TODO: Implement start round logic
        // 1. Check if there's a previous round, ensure it was settled.
        // 2. Increment currentRoundId
        // 3. Set the Round struct logic (startPrice, startTime = block.timestamp)
        // 4. Emit RoundStarted event
    }

    /**
     * @dev Called by backend operator to conclude the round and set the final price.
     */
    function settleRound(
        uint256 _roundId,
        uint256 _endPrice
    ) external onlyOperator {
        // TODO: Implement settling logic
        // 1. Get the round from mapping
        // 2. Ensure it hasn't been settled yet and it has actually started
        // 3. Ensure at least 60 seconds have passed since start time
        // 4. Update the round properties (endPrice, endTime = block.timestamp, settled = true)
        // 5. Determine if UP won (_endPrice > r.startPrice)
        // 6. Emit RoundSettled event
    }

    // -------------------------------------------------------------------------
    // Player Functions
    // -------------------------------------------------------------------------

    /**
     * @dev User actively places a wager on the current active round.
     */
    function placeBet(bool _guessUp) external payable nonReentrant {
        // TODO: Implement betting logic
        // 1. Require msg.value >= minBet
        // 2. Require currentRoundId > 0
        // 3. Require the current round is not settled
        // 4. Require the block.timestamp is within 30 seconds of the round's startTime
        // 5. Ensure user hasn't already bet on this round
        // 6. Store the prediction
        // 7. Update totalPool, upPool, or downPool depending on guess
        // 8. Emit BetPlaced event
    }

    /**
     * @dev Winners call this to withdraw their share of the prize pool.
     */
    function claimWinnings(uint256 _roundId) external nonReentrant {
        // TODO: Implement claiming logic
        // 1. Require the round is settled
        // 2. Require user has placed a bet and hasn't already claimed
        // 3. Determine if the user guessed correctly (upWon = r.endPrice > r.startPrice)
        // 4. Calculate the reward based on pool size (pari-mutuel payout)
        //    Formula: (user.amount * totalPool) / winningPool (watch out for edge cases like everyone winning)
        // 5. Calculate protocol fee (5% of reward)
        // 6. Deduct fee, add to protocolFee state var
        // 7. Mark user prediction as claimed
        // 8. Transfer payout to user
        // 9. Emit WinningsClaimed event
    }

    // -------------------------------------------------------------------------
    // Admin Functions
    // -------------------------------------------------------------------------

    function setMinBet(uint256 _newMinBet) external onlyOwner {
        minBet = _newMinBet;
        emit MinBetChanged(_newMinBet);
    }

    function changeOperator(address _newOperator) external onlyOwner {
        require(_newOperator != address(0), "EthGuess: Invalid operator");
        emit OperatorChanged(operator, _newOperator);
        operator = _newOperator;
    }

    function withdrawFees(address payable _to) external onlyOwner nonReentrant {
        uint256 toTransfer = protocolFee;
        require(toTransfer > 0, "EthGuess: No fees to withdraw");

        protocolFee = 0;
        (bool success, ) = _to.call{value: toTransfer}("");
        require(success, "EthGuess: Transfer failed");
    }
}
