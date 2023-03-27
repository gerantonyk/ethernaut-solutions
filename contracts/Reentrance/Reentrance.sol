// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "../helpers/SafeMath06.sol";
import "hardhat/console.sol";

contract Reentrance {
    using SafeMath for uint256;
    mapping(address => uint) public balances;

    function donate(address _to) public payable {
        balances[_to] = balances[_to].add(msg.value);
    }

    function balanceOf(address _who) public view returns (uint balance) {
        return balances[_who];
    }

    function withdraw(uint _amount) public {
        if (balances[msg.sender] >= _amount) {
            (bool result, ) = msg.sender.call{value: _amount}("");
            console.log("se trata de ejecutar mas de una vez", msg.sender);
            if (result) {
                _amount;
            }
            console.log("antes", balances[msg.sender]);
            balances[msg.sender] -= _amount;
            console.log("despues", balances[msg.sender]);
        }
    }

    receive() external payable {}
}
