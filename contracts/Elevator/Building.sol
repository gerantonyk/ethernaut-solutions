// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface EvelatorI {
    function goTo(uint _floor) external;
}

contract Building {
    EvelatorI elevator;
    bool top;

    constructor(address _elevator) {
        elevator = EvelatorI(_elevator);
    }

    function callGoTo(uint _floor) external {
        elevator.goTo(_floor);
    }

    function isLastFloor(uint) external returns (bool) {
        top = !top;
        return !top;
    }
}
