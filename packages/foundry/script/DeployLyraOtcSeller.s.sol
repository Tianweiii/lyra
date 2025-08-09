// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/LyraOtcSeller.sol";

contract DeployLyraOtcSeller is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        // Polygon Mainnet addresses
        address USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
        address LYRA = 0xC0C2bB5A6F141733C317547E1c0Dc514D425141b;

        LyraOtcSeller otcSeller = new LyraOtcSeller(USDT, LYRA, deployer);

        console.log("LyraOtcSeller deployed at:", address(otcSeller));
        console.log("Owner:", deployer);
        console.log("USDT:", USDT);
        console.log("LYRA:", LYRA);
        console.log("POL Price (USDT):", otcSeller.priceUsdtPerNative() / 1e6, "USDT per POL");
        console.log("Fee Percentage:", otcSeller.FEE_PERCENTAGE(), "(0.1%)");
    }
} 