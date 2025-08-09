// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/LyraOtcSeller.sol";

contract DeployLyraOtcSellerMainnet is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Polygon Mainnet addresses
        address USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F; // Polygon USDT
        address LYRA = 0xC0C2bB5A6F141733C317547E1c0Dc514D425141b; // Your LYRA token address
        
        // Deploy the OTC seller contract
        LyraOtcSeller otcSeller = new LyraOtcSeller(USDT, LYRA, deployer);

        console.log("=== LyraOtcSeller Deployed on Polygon Mainnet ===");
        console.log("Contract Address:", address(otcSeller));
        console.log("Network: Polygon Mainnet");
        console.log("Owner:", deployer);
        console.log("USDT:", USDT);
        console.log("LYRA:", LYRA);
        console.log("MATIC Price (USDT):", otcSeller.priceUsdtPerNative() / 1e6, "USDT per MATIC");
        console.log("Fee Percentage:", otcSeller.FEE_PERCENTAGE(), "(0.1%)");
        console.log("");
        console.log("View on Polygonscan:");
        console.log("https://polygonscan.com/address/", address(otcSeller));
        console.log("");
        console.log("IMPORTANT: Fund the contract with LYRA tokens before use!");
    }
} 

