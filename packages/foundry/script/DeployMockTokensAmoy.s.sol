// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/MockUSDT.sol";
import "../contracts/LyraToken.sol";

contract DeployMockTokensAmoy is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Deploy Mock USDT
        MockUSDT mockUSDT = new MockUSDT();
        
        // Deploy Mock LYRA
        LyraToken mockLYRA = new LyraToken("Lyra Token", "LYRA", deployer);

        console.log("=== Mock Tokens Deployed ===");
        console.log("Mock USDT:", address(mockUSDT));
        console.log("Mock LYRA:", address(mockLYRA));
        console.log("Owner:", deployer);
        console.log("");
        console.log("💡 Use these addresses in your LyraOtcSeller deployment!");
    }
} 