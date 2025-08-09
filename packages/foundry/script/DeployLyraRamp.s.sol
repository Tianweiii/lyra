// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import "../contracts/LyraRamp.sol";

/**
 * @notice Deploy script for LyraRamp contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployLyraRamp.s.sol  # local anvil chain
 * yarn deploy --file DeployLyraRamp.s.sol --network scrollSepolia # live network (requires keystore)
 */
contract DeployLyraRamp is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
        // Deploy LyraRamp contract
        LyraRamp lyraRamp = new LyraRamp();
        
        // Add supported stablecoins (Scroll Sepolia addresses)
        // USDT
        lyraRamp.addSupportedStablecoin(0xF086deDf6a89E7B16145B03A6Cb461C97670C5Ce);
        // USDC
        lyraRamp.addSupportedStablecoin(0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4);
        // DAI
        lyraRamp.addSupportedStablecoin(0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97);

        console.log("LyraRamp deployed to:", address(lyraRamp));
        console.log("Contract owner:", lyraRamp.owner());
        console.log("Fee percentage:", lyraRamp.feePercentage());
    }
} 