// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract LyraToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Lyra", "LYRA") {
        _mint(msg.sender, initialSupply);
    }
}
