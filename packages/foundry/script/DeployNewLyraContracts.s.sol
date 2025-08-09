// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/NewLyraToken.sol";
import "../contracts/NewLyraOtcSeller.sol";

contract DeployNewLyraContracts is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Polygon Mainnet addresses
        address USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; // USDT on Polygon
        address LYRA = 0xC0C2bB5A6F141733C317547E1c0Dc514D425141b; // LYRA token (placeholder - replace with actual address)

        // Deploy LyraToken first
        LyraToken lyraToken = new LyraToken(deployer, 1000000 * 10**18); // 1M LYRA initial supply

        console.log("LyraToken deployed at:", address(lyraToken));
        console.log("Initial supply:", 1000000 * 10**18, "LYRA");
        console.log("Owner:", deployer);

        // Deploy LyraOtcSeller with initial prices
        uint256 priceUsdtPerNative = 236_800; // 0.2368 USDT per MATIC (current market price)
        uint256 lyraPerUsdtHuman = 1; // 1 LYRA = 1 USDT

        LyraOtcSeller otcSeller = new LyraOtcSeller(
            USDT,
            address(lyraToken), // Use the newly deployed LYRA token
            priceUsdtPerNative,
            lyraPerUsdtHuman,
            deployer
        );

        console.log("LyraOtcSeller deployed at:", address(otcSeller));
        console.log("USDT:", USDT);
        console.log("LYRA:", address(lyraToken));
        console.log("MATIC Price (USDT):", priceUsdtPerNative / 1e6, "USDT per MATIC");
        console.log("LYRA Price (USDT):", lyraPerUsdtHuman, "USDT per LYRA");
        console.log("Owner:", deployer);

        // Set up initial roles
        // Set OTC seller as merchant in LyraToken
        lyraToken.setMerchant(address(otcSeller), true);
        console.log("OTC Seller set as merchant in LyraToken");

        // Fund OTC seller with initial LYRA
        lyraToken.transfer(address(otcSeller), 500000 * 10**18); // 500K LYRA
        console.log("Funded OTC Seller with 500,000 LYRA");

        console.log("");
        console.log("=== DEPLOYMENT SUMMARY ===");
        console.log("Network: Polygon Mainnet");
        console.log("LyraToken:", address(lyraToken));
        console.log("LyraOtcSeller:", address(otcSeller));
        console.log("Owner:", deployer);
        console.log("Initial LYRA Supply: 1,000,000");
        console.log("OTC Funded: 500,000 LYRA");
        console.log("");
        console.log("Next steps:");
        console.log("1. Fund OTC seller with USDT and MATIC");
        console.log("2. Set government and merchant addresses");
        console.log("3. Update frontend contract addresses");
        console.log("4. Verify contracts on Polygonscan");
    }
} 