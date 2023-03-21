// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

interface IForta {
    function setDetectionBot(address detectionBotAddress) external;

    function notify(address user, bytes calldata msgData) external;

    function raiseAlert(address user) external;
}

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

contract DoubleEntryPointDetectionBot is IDetectionBot {
    address addr;
    IForta forta;

    constructor(address _addr, address _forta) {
        addr = _addr;
        forta = IForta(_forta);
    }

    function handleTransaction(address user, bytes calldata msgData) external {
        // bytes32 log;
        // assembly {
        //     log := calldataload(0)
        // }
        // bytes32 log1;
        // assembly {
        //     log1 := calldataload(32)
        // }
        // bytes32 log2;
        // assembly {
        //     log2 := calldataload(64)
        // }
        // bytes32 log3;
        // assembly {
        //     log3 := calldataload(96)
        // }
        // bytes32 log4;
        // assembly {
        //     log4 := calldataload(128)
        // }
        // bytes32 log5;
        // assembly {
        //     log5 := calldataload(160)
        // }
        // bytes32 log6;
        // assembly {
        //     log6 := calldataload(192)
        // }
        // bytes32 log7;
        // assembly {
        //     log7 := calldataload(224)
        // }
        // console.logBytes32(log);
        // console.logBytes32(log1);
        // console.logBytes32(log2);
        // console.logBytes32(log3);
        // console.logBytes32(log4);
        // console.logBytes32(log5);
        // console.logBytes32(log6);
        // console.logBytes32(log7);
        // console.logBytes(msgData);
        (, , address orig) = abi.decode(
            msgData[4:],
            (address, uint256, address)
        );
        if (
            bytes4(msgData[0:4]) ==
            bytes4(keccak256("delegateTransfer(address,uint256,address)")) &&
            orig == addr
        ) {
            forta.raiseAlert(user);
        }
    }
}
