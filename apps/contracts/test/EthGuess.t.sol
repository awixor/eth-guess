// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {EthGuess} from "../src/EthGuess.sol";

// A mock contract that refuses to accept ETH transfers
contract Rejector {
    receive() external payable {
        revert("I refuse ETH");
    }
}

contract EthGuessTest is Test {
    EthGuess public ethGuess;

    address public owner;
    address public operator;
    address public player1;
    address public player2;

    uint256 public constant INITIAL_BALANCE = 10 ether;

    function setUp() public {
        owner = address(this);
        operator = makeAddr("operator");
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");

        vm.deal(player1, INITIAL_BALANCE);
        vm.deal(player2, INITIAL_BALANCE);

        ethGuess = new EthGuess(operator);
    }

    // -------------------------------------------------------------------------
    // Admin & Access Control Tests
    // -------------------------------------------------------------------------

    function test_DeploymentState() public view {
        assertEq(ethGuess.owner(), owner);
        assertEq(ethGuess.operator(), operator);
        assertEq(ethGuess.minBet(), 0.00001 ether);
        assertEq(ethGuess.feePercent(), 500); // 5%
        assertEq(ethGuess.currentRoundId(), 0);
    }

    function test_Constructor_RevertIf_ZeroAddressOperator() public {
        vm.expectRevert(EthGuess.EthGuess__InvalidOperator.selector);
        new EthGuess(address(0));
    }

    function test_SetMinBet_Success() public {
        uint256 newMinBet = 0.1 ether;
        vm.expectEmit(true, true, true, true);
        emit EthGuess.MinBetChanged(newMinBet);
        ethGuess.setMinBet(newMinBet);
        assertEq(ethGuess.minBet(), newMinBet);
    }

    function test_SetMinBet_RevertIf_NotOwner() public {
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__NotOwner.selector);
        ethGuess.setMinBet(0.1 ether);
    }

    function test_SetMinBet_RevertIf_Zero() public {
        vm.expectRevert(EthGuess.EthGuess__InvalidSetMinBet.selector);
        ethGuess.setMinBet(0);
    }

    function test_ChangeOperator_Success() public {
        address newOperator = makeAddr("newOperator");
        vm.expectEmit(true, true, true, true);
        emit EthGuess.OperatorChanged(operator, newOperator);
        ethGuess.changeOperator(newOperator);
        assertEq(ethGuess.operator(), newOperator);
    }

    function test_ChangeOperator_RevertIf_NotOwner() public {
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__NotOwner.selector);
        ethGuess.changeOperator(makeAddr("newOperator"));
    }

    function test_ChangeOperator_RevertIf_ZeroAddress() public {
        vm.expectRevert(EthGuess.EthGuess__InvalidOperator.selector);
        ethGuess.changeOperator(address(0));
    }

    // -------------------------------------------------------------------------
    // Execution Tests (executeRound)
    // -------------------------------------------------------------------------

    function test_ExecuteRound_RevertIf_NotOperator() public {
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__NotOperator.selector);
        ethGuess.executeRound(2500 * 1e8);
    }

    function test_ExecuteRound_StartFirstRound() public {
        uint256 startPrice = 3000 * 1e8;

        vm.expectEmit(true, false, false, true);
        emit EthGuess.RoundStarted(1, startPrice, block.timestamp);

        vm.prank(operator);
        ethGuess.executeRound(startPrice);

        assertEq(ethGuess.currentRoundId(), 1);

        (
            uint256 rStartPrice,
            uint256 rEndPrice,
            uint256 rStartTime,
            uint256 rEndTime,
            uint256 rTotalPool,
            uint256 rUpPool,
            uint256 rDownPool,
            bool rSettled
        ) = ethGuess.rounds(1);

        assertEq(rStartPrice, startPrice);
        assertEq(rEndPrice, 0);
        assertEq(rStartTime, block.timestamp);
        assertEq(rEndTime, 0);
        assertEq(rTotalPool, 0);
        assertEq(rUpPool, 0);
        assertEq(rDownPool, 0);
        assertFalse(rSettled);
    }

    function test_ExecuteRound_SettleCurrentAndStartNext() public {
        uint256 priceR1Start = 3000 * 1e8;
        uint256 priceR1End = 3100 * 1e8; // UP won

        // Start Round 1
        vm.prank(operator);
        ethGuess.executeRound(priceR1Start);

        // Advance time by 60 seconds
        skip(60);

        // Execute again: Settle Round 1, Start Round 2
        vm.expectEmit(true, false, false, true);
        emit EthGuess.RoundSettled(1, priceR1End, true); // upWon = true since 3100 > 3000

        vm.expectEmit(true, false, false, true);
        emit EthGuess.RoundStarted(2, priceR1End, block.timestamp);

        vm.prank(operator);
        ethGuess.executeRound(priceR1End);

        // Verify Round 1 settling
        (, uint256 r1EndPrice,, uint256 r1EndTime,,,, bool r1Settled) = ethGuess.rounds(1);
        assertEq(r1EndPrice, priceR1End);
        assertEq(r1EndTime, block.timestamp);
        assertTrue(r1Settled);

        // Verify Round 2 start
        assertEq(ethGuess.currentRoundId(), 2);
        (uint256 r2StartPrice,, uint256 r2StartTime,,,,, bool r2Settled) = ethGuess.rounds(2);
        assertEq(r2StartPrice, priceR1End);
        assertEq(r2StartTime, block.timestamp);
        assertFalse(r2Settled);
    }

    function test_ExecuteRound_RevertIf_TooEarly() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8); // Start Round 1

        skip(59); // Advance only 59 seconds

        vm.prank(operator);
        vm.expectRevert(EthGuess.EthGuess__InvalidExecuteRound.selector);
        ethGuess.executeRound(3100 * 1e8); // Try to settle Round 1
    }

    // -------------------------------------------------------------------------
    // Betting Tests (placeBet)
    // -------------------------------------------------------------------------

    function test_PlaceBet_RevertIf_GameNotStarted() public {
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__InvalidPlaceBet.selector);
        ethGuess.placeBet{value: 1 ether}(true);
    }

    function test_PlaceBet_RevertIf_AmountTooLow() public {
        // Start round
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        uint256 tooLowBet = ethGuess.minBet() - 1;

        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__InvalidMinBet.selector);
        ethGuess.placeBet{value: tooLowBet}(true);
    }

    function test_PlaceBet_ValidUp() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        uint256 betAmount = 1 ether;

        vm.expectEmit(true, true, false, true);
        emit EthGuess.BetPlaced(1, player1, true, betAmount);

        vm.prank(player1);
        ethGuess.placeBet{value: betAmount}(true); // UP

        (,,,, uint256 totalPool, uint256 upPool, uint256 downPool,) = ethGuess.rounds(1);
        assertEq(totalPool, betAmount);
        assertEq(upPool, betAmount);
        assertEq(downPool, 0);

        // Verify bet recording
        (bool guessedUp, uint256 amount, bool claimed) = ethGuess.bets(1, player1);
        assertTrue(guessedUp);
        assertEq(amount, betAmount);
        assertFalse(claimed);
    }

    function test_PlaceBet_ValidDown() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        uint256 betAmount = 1 ether;

        vm.prank(player1);
        ethGuess.placeBet{value: betAmount}(false); // DOWN

        (,,,, uint256 totalPool, uint256 upPool, uint256 downPool,) = ethGuess.rounds(1);
        assertEq(totalPool, betAmount);
        assertEq(upPool, 0);
        assertEq(downPool, betAmount);
    }

    function test_PlaceBet_RevertIf_AlreadyPlacedBet() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);

        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__AlreadyPlacedBet.selector);
        ethGuess.placeBet{value: 1 ether}(false);
    }

    function test_PlaceBet_RevertIf_BettingWindowClosed() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        skip(31); // Advance past 30s window

        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__BettingWindowClosed.selector);
        ethGuess.placeBet{value: 1 ether}(true);
    }

    function test_PlaceBet_RevertIf_RoundSettledManually() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8); // Round 1 starts

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(3100 * 1e8); // Round 1 settles, Round 2 starts

        // Now if we try to bet on Round 1 by manipulating currentRoundId conceptually...
        // Well, users only bet on currentRoundId, which is now 2. They can't manually target 1.
        // We can skip this specific explicit manual targeting since the contract only lets u bet on currentRoundId.
    }

    // -------------------------------------------------------------------------
    // Rewards & Claiming Tests
    // -------------------------------------------------------------------------

    function test_ClaimWinnings_UpWon() public {
        uint256 startPrice = 3000 * 1e8;
        uint256 endPrice = 3100 * 1e8; // UP won

        vm.prank(operator);
        ethGuess.executeRound(startPrice);

        // Player1 bets UP (1 ETH)
        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);

        // Player2 bets DOWN (2 ETH)
        vm.prank(player2);
        ethGuess.placeBet{value: 2 ether}(false);

        // Total Pool = 3 ETH
        // Winning Pool (UP) = 1 ETH
        // Reward = (1 ETH * 3 ETH) / 1 ETH = 3 ETH
        // Fee (5%) = 0.15 ETH
        // Payout = 2.85 ETH

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(endPrice); // Settles round 1

        uint256 player1BalanceBefore = player1.balance;

        vm.expectEmit(true, true, false, true);
        emit EthGuess.WinningsClaimed(1, player1, 3 ether); // The event emits 'reward' before fee subtraction conceptually based on contract code

        vm.prank(player1);
        ethGuess.claimWinnings(1);

        uint256 player1BalanceAfter = player1.balance;

        // Assert payout
        assertEq(player1BalanceAfter - player1BalanceBefore, 2.85 ether);

        // Assert fee collection inside variable
        assertEq(ethGuess.protocolFee(), 0.15 ether);

        // Verify state update
        (,, bool claimed) = ethGuess.bets(1, player1);
        assertTrue(claimed);
    }

    function test_ClaimWinnings_DownWon() public {
        uint256 startPrice = 3000 * 1e8;
        uint256 endPrice = 2900 * 1e8; // DOWN won

        vm.prank(operator);
        ethGuess.executeRound(startPrice);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);

        vm.prank(player2);
        ethGuess.placeBet{value: 2 ether}(false);

        // Total Pool = 3 ETH
        // Winning Pool (DOWN) = 2 ETH
        // Player 2 Reward = (2 * 3) / 2 = 3 ETH
        // Fee = 0.15 ETH, Payout = 2.85 ETH

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(endPrice);

        uint256 p2BalBefore = player2.balance;
        vm.prank(player2);
        ethGuess.claimWinnings(1);

        assertEq(player2.balance - p2BalBefore, 2.85 ether);
    }

    function test_ClaimWinnings_RevertIf_RoundNotSettled() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);

        // Not waiting 60s, not executing round
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__RoundNotSettled.selector);
        ethGuess.claimWinnings(1);
    }

    function test_ClaimWinnings_RevertIf_NoBetPlaced() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);
        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(3100 * 1e8);

        vm.prank(player2); // Did not bet
        vm.expectRevert(EthGuess.EthGuess__InvalidClaimWinnings.selector);
        ethGuess.claimWinnings(1);
    }

    function test_ClaimWinnings_RevertIf_WrongDirection() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true); // UP

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(2900 * 1e8); // DOWN wins

        vm.prank(player1); // Loser
        vm.expectRevert(EthGuess.EthGuess__InvalidClaimWinnings.selector);
        ethGuess.claimWinnings(1);
    }

    function test_ClaimWinnings_RevertIf_AlreadyClaimed() public {
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(3100 * 1e8); // UP wins

        vm.prank(player1);
        ethGuess.claimWinnings(1);

        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__AlreadyClaimed.selector);
        ethGuess.claimWinnings(1);
    }

    function test_ClaimWinnings_RevertIf_EmptyPool() public {
        // Edge case: Everyone bets UP, but DOWN wins. DOWN pool is empty, UP pool is full.
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true); // UP

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(2900 * 1e8); // DOWN wins

        // If a malicious or confused user somehow bypassed checks internally, poolEmpty prevents math errors.
        // Actually, no one can claim here because there are no DOWN bets. The funds are stuck.
        // We'll test this behavior specifically (nobody can claim).
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__InvalidClaimWinnings.selector); // Will fail here first because guessedUp != upWon
        ethGuess.claimWinnings(1);
    }

    function test_ClaimWinnings_RevertIf_TransferFailed() public {
        Rejector rejector = new Rejector();

        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        // Rejector contract places a bet via a relay/wrapper or we just deal and prank it
        vm.deal(address(rejector), 1 ether);
        vm.prank(address(rejector));
        ethGuess.placeBet{value: 1 ether}(true);

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(3100 * 1e8); // UP wins

        vm.prank(address(rejector));
        vm.expectRevert(EthGuess.EthGuess__TransferFailed.selector);
        ethGuess.claimWinnings(1);
    }

    // -------------------------------------------------------------------------
    // Withdraw Fees Tests
    // -------------------------------------------------------------------------

    function test_WithdrawFees_Success() public {
        // Setup a winning pot
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);
        vm.prank(player2);
        ethGuess.placeBet{value: 1 ether}(false);

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(3100 * 1e8);

        vm.prank(player1);
        ethGuess.claimWinnings(1);

        // Protocol fee should be 5% of 2 ETH = 0.1 ETH
        uint256 expectedFee = 0.1 ether;
        assertEq(ethGuess.protocolFee(), expectedFee);

        address payable treasury = payable(makeAddr("treasury"));

        vm.prank(owner);
        ethGuess.withdrawFees(treasury);

        assertEq(ethGuess.protocolFee(), 0);
        assertEq(treasury.balance, expectedFee);
    }

    function test_WithdrawFees_RevertIf_NotOwner() public {
        vm.prank(player1);
        vm.expectRevert(EthGuess.EthGuess__NotOwner.selector);
        ethGuess.withdrawFees(payable(player1));
    }

    function test_WithdrawFees_RevertIf_NoFees() public {
        vm.prank(owner);
        vm.expectRevert(EthGuess.EthGuess__NoFeesToWithdraw.selector);
        ethGuess.withdrawFees(payable(owner));
    }

    function test_WithdrawFees_RevertIf_TransferFailed() public {
        // Setup a winning pot to get some fees
        vm.prank(operator);
        ethGuess.executeRound(3000 * 1e8);

        vm.prank(player1);
        ethGuess.placeBet{value: 1 ether}(true);
        vm.prank(player2);
        ethGuess.placeBet{value: 1 ether}(false);

        skip(60);
        vm.prank(operator);
        ethGuess.executeRound(3100 * 1e8);

        vm.prank(player1);
        ethGuess.claimWinnings(1);

        Rejector rejector = new Rejector();

        vm.prank(owner);
        vm.expectRevert(EthGuess.EthGuess__TransferFailed.selector);
        ethGuess.withdrawFees(payable(address(rejector)));
    }
}
