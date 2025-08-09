// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev LYRA ERC20 with simple role flags:
 * - isGovernment: addresses allowed to distribute LYRA freely (gov can fund residents)
 * - isMerchant: addresses allowed to receive LYRA from residents & freely transfer
 *
 * Transfers are allowed normally when:
 * - minting/burning (from==address(0) || to==address(0))
 * - sender is government (they can send anywhere)
 * - recipient is merchant
 * - sender is merchant (merchants can freely send/swap)
 *
 * All other transfers (i.e., resident -> arbitrary address) will revert.
 */
contract LyraToken is ERC20, Ownable {
    mapping(address => bool) public isMerchant;
    mapping(address => bool) public isGovernment;

    event MerchantUpdated(address indexed who, bool enabled);
    event GovernmentUpdated(address indexed who, bool enabled);

    constructor(address initialOwner, uint256 initialSupply) ERC20("Lyra", "LYRA") Ownable(initialOwner) {
        require(initialOwner != address(0), "zero owner");
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
        // mark initial owner as government by default (optional)
        isGovernment[initialOwner] = true;
        emit GovernmentUpdated(initialOwner, true);
    }

    /// owner manages merchants
    function setMerchant(address who, bool enabled) external onlyOwner {
        isMerchant[who] = enabled;
        emit MerchantUpdated(who, enabled);
    }

    /// owner manages governments
    function setGovernment(address who, bool enabled) external onlyOwner {
        isGovernment[who] = enabled;
        emit GovernmentUpdated(who, enabled);
    }

    /// batch helpers
    function setMerchants(address[] calldata who, bool enabled) external onlyOwner {
        for (uint i = 0; i < who.length; i++) {
            isMerchant[who[i]] = enabled;
            emit MerchantUpdated(who[i], enabled);
        }
    }
    function setGovernments(address[] calldata who, bool enabled) external onlyOwner {
        for (uint i = 0; i < who.length; i++) {
            isGovernment[who[i]] = enabled;
            emit GovernmentUpdated(who[i], enabled);
        }
    }

    /// core transfer gate
    function _update(address from, address to, uint256 amount) internal virtual override {
        // allow mint/burn
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        // if sender is government => allowed
        if (isGovernment[from]) {
            super._update(from, to, amount);
            return;
        }

        // if sender is merchant => allowed
        if (isMerchant[from]) {
            super._update(from, to, amount);
            return;
        }

        // Resident sending: only allow sending to merchant addresses
        if (isMerchant[to]) {
            super._update(from, to, amount);
            return;
        }

        revert("LYRA: transfers restricted to merchants");
    }
}
