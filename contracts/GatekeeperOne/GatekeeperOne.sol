// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract GatekeeperOne {
    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        require(gasleft() % 8191 == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        console.log("Paso el dos");
        console.logBytes8(_gateKey);
        console.logBytes8(bytes2(uint16(uint64(_gateKey))));
        console.log(tx.origin);
        console.log("1", uint32(uint64(_gateKey)), uint16(uint64(_gateKey)));
        console.log("2", uint32(uint64(_gateKey)), uint64(_gateKey));
        console.log("3", uint32(uint64(_gateKey)), uint16(uint160(tx.origin)));

        require(
            //necesito que los ultimos 4 bytes sean iguales a los ultimos 2
            uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
            "GatekeeperOne: invalid gateThree part one"
        );
        require(
            //necesito que los ultimos 4 bytes sean distintos a los ultimos 8
            uint32(uint64(_gateKey)) != uint64(_gateKey),
            "GatekeeperOne: invalid gateThree part two"
        );
        require(
            //que los ultimos 4 sean iguales los ultimas 2 de los ultimos 2 de la tx.origin
            uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)),
            "GatekeeperOne: invalid gateThree part three"
        );
        _;
    }

    function enter(
        bytes8 _gateKey
    ) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}
