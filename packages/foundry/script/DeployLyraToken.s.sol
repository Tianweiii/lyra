// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {LyraToken} from "../contracts/LyraToken.sol";
import {ScaffoldETHDeploy} from "./DeployHelpers.s.sol";

contract DeployLyraToken is Script, ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy LyraToken with initial supply (e.g., 1,000,000,00 tokens with 18 decimals)
        // 1,000,000 * 10^18 = 1,000,000,000,000,000,000,000,000
        uint256 initialSupply = 1_000_000_00 * 10**18;
        LyraToken lyraToken = new LyraToken(initialSupply);

        // Add to deployments array for export
        deployments.push(Deployment({
            name: "LyraToken",
            addr: address(lyraToken)
        }));
    }
} 