// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

interface CoinFlipI {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipAttacker {
    CoinFlipI coinflip;

    constructor(address _coinflip) {
        coinflip = CoinFlipI(_coinflip);
    }

    function flippitGood() external {
        bool result = coinflip.flip(true);
        require(result == true, "not the expected result");
    }
}
