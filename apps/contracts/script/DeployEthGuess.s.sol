// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {EthGuess} from "../src/EthGuess.sol";

contract DeployEthGuess is Script {
    function run() external returns (EthGuess) {
        uint256 ownerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address operator = vm.envAddress("OPERATOR_ADDRESS");

        vm.startBroadcast(ownerPrivateKey);

        EthGuess ethGuess = new EthGuess(operator);

        console.log("EthGuess deployed to:", address(ethGuess));
        console.log("Owner:", vm.addr(ownerPrivateKey));
        console.log("Operator:", operator);

        vm.stopBroadcast();
        return ethGuess;
    }
}
