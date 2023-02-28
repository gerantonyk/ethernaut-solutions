// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Solver {
    function whatIsTheMeaningOfLife() external pure returns (uint) {
        assembly {
            mstore(0x0, 42)
            return(0x0, 4)
        }
    }
}
