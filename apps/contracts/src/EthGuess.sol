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
    uint16 public feePercent = 500; // Protocol fee percentage (e.g. 500 = 5%) - denominator 10000

    uint256 public currentRoundId;

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => Prediction)) public bets;

    // A simple reentrancy lock status (1 = unlocked, 2 = locked)
    uint256 private _status;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error EthGuess__NotOwner();
    error EthGuess__NotOperator();
    error EthGuess__PoolEmpty();
    error EthGuess__ReentrancyGuard();
    error EthGuess__NoFeesToWithdraw();
    error EthGuess__RoundAlreadySettled();
    error EthGuess__TransferFailed();
    error EthGuess__RoundNotSettled();
    error EthGuess__BettingWindowClosed();
    error EthGuess__AlreadyPlacedBet();
    error EthGuess__AlreadyClaimed();
    error EthGuess__InvalidOperator();
    error EthGuess__InvalidMinBet();
    error EthGuess__InvalidExecuteRound();
    error EthGuess__InvalidPlaceBet();
    error EthGuess__InvalidClaimWinnings();
    error EthGuess__InvalidSetMinBet();

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event RoundStarted(uint256 indexed roundId, uint256 startPrice, uint256 startTime);
    event BetPlaced(uint256 indexed roundId, address indexed player, bool guessedUp, uint256 amount);
    event RoundSettled(uint256 indexed roundId, uint256 endPrice, bool upWon);
    event WinningsClaimed(uint256 indexed roundId, address indexed player, uint256 amount);
    event OperatorChanged(address indexed previousOperator, address indexed newOperator);
    event MinBetChanged(uint256 newMinBet);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    modifier onlyOperator() {
        _onlyOperator();
        _;
    }

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address _operator) {
        if (_operator == address(0)) revert EthGuess__InvalidOperator();
        owner = msg.sender;
        operator = _operator;
        minBet = 0.00001 ether;
        feePercent = 500; // Default 5% protocol fee
        _status = 1;
    }

    // -------------------------------------------------------------------------
    // Operator Functions
    // -------------------------------------------------------------------------

    /**
     * @dev Called by backend oracle every minute to settle the current round and start a new one.
     */
    function executeRound(uint256 _currentPrice) external onlyOperator {
        // 1. Settle the current active round
        if (currentRoundId > 0) {
            Round storage currentRound = rounds[currentRoundId];
            if (currentRound.settled) revert EthGuess__InvalidExecuteRound();
            if (block.timestamp - currentRound.startTime < 60) {
                revert EthGuess__InvalidExecuteRound();
            }

            currentRound.endPrice = _currentPrice;
            currentRound.endTime = block.timestamp;
            currentRound.settled = true;

            bool upWon = _currentPrice > currentRound.startPrice;
            emit RoundSettled(currentRoundId, _currentPrice, upWon);
        }

        // 2. Start the next round
        currentRoundId++;
        rounds[currentRoundId] = Round({
            startPrice: _currentPrice,
            endPrice: 0,
            startTime: block.timestamp,
            endTime: 0,
            totalPool: 0,
            upPool: 0,
            downPool: 0,
            settled: false
        });

        emit RoundStarted(currentRoundId, _currentPrice, block.timestamp);
    }

    // -------------------------------------------------------------------------
    // Player Functions
    // -------------------------------------------------------------------------

    /**
     * @dev User actively places a wager on the current active round.
     */
    function placeBet(bool _guessUp) external payable nonReentrant {
        if (msg.value < minBet) revert EthGuess__InvalidMinBet();
        if (currentRoundId == 0) revert EthGuess__InvalidPlaceBet();
        Round storage round = rounds[currentRoundId];
        if (round.settled == true) revert EthGuess__RoundAlreadySettled();
        if (block.timestamp - round.startTime > 30) {
            revert EthGuess__BettingWindowClosed();
        }
        if (bets[currentRoundId][msg.sender].amount > 0) {
            revert EthGuess__AlreadyPlacedBet();
        }
        bets[currentRoundId][msg.sender] = Prediction({guessedUp: _guessUp, amount: msg.value, claimed: false});
        round.totalPool += msg.value;

        if (_guessUp) {
            round.upPool += msg.value;
        } else {
            round.downPool += msg.value;
        }
        emit BetPlaced(currentRoundId, msg.sender, _guessUp, msg.value);
    }

    /**
     * @dev Winners call this to withdraw their share of the prize pool.
     */
    function claimWinnings(uint256 _roundId) external nonReentrant {
        Round storage round = rounds[_roundId];
        if (round.settled == false) revert EthGuess__RoundNotSettled();

        Prediction storage prediction = bets[_roundId][msg.sender];
        if (prediction.amount == 0) revert EthGuess__InvalidClaimWinnings();
        if (prediction.claimed == true) revert EthGuess__AlreadyClaimed();

        bool upWon = round.endPrice > round.startPrice;
        if (prediction.guessedUp != upWon) {
            revert EthGuess__InvalidClaimWinnings();
        }

        uint256 winningPool = upWon ? round.upPool : round.downPool;
        if (winningPool == 0) revert EthGuess__PoolEmpty();

        uint256 reward = (prediction.amount * round.totalPool) / winningPool;
        uint256 feeToTake = (reward * feePercent) / 10000;
        uint256 payout = reward - feeToTake;

        protocolFee += feeToTake;
        prediction.claimed = true;

        (bool success,) = payable(msg.sender).call{value: payout}("");
        if (!success) revert EthGuess__TransferFailed();
        emit WinningsClaimed(_roundId, msg.sender, reward);
    }

    // -------------------------------------------------------------------------
    // Admin Functions
    // -------------------------------------------------------------------------

    function setMinBet(uint256 _newMinBet) external onlyOwner {
        if (_newMinBet == 0) revert EthGuess__InvalidSetMinBet();
        minBet = _newMinBet;
        emit MinBetChanged(_newMinBet);
    }

    function changeOperator(address _newOperator) external onlyOwner {
        if (_newOperator == address(0)) revert EthGuess__InvalidOperator();
        emit OperatorChanged(operator, _newOperator);
        operator = _newOperator;
    }

    function withdrawFees(address payable _to) external onlyOwner nonReentrant {
        uint256 toTransfer = protocolFee;
        if (toTransfer == 0) revert EthGuess__NoFeesToWithdraw();

        protocolFee = 0;
        (bool success,) = _to.call{value: toTransfer}("");
        if (!success) revert EthGuess__TransferFailed();
    }

    function _onlyOwner() internal view {
        if (msg.sender != owner) revert EthGuess__NotOwner();
    }

    function _onlyOperator() internal view {
        if (msg.sender != operator) revert EthGuess__NotOperator();
    }

    function _nonReentrantBefore() internal {
        if (_status == 2) revert EthGuess__ReentrancyGuard();
        _status = 2;
    }

    function _nonReentrantAfter() internal {
        _status = 1;
    }
}
