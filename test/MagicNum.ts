import { expect } from "chai";
import { ethers } from "hardhat";

describe("MagicNum", async function () {

  it("Should deploy a Solver contract with less than 10 bytes that returns 42", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()

    const MagicNum = await ethers.getContractFactory("MagicNum");
    const magicNum = await MagicNum.deploy();
    await magicNum.deployed();
    //setup-

    //1.Create bytecode
    //a.Creation code
    /*
    00 0x60 PUSH1 0x0a (dec 10) //length in bytes
    02 0x60 PUSH1 0x0c (dec 12) //start position from instructions
    00 0x60 PUSH1 0x00 (dec 0) //memorty position
    00 0x39 CODECOPY //copy code from instructions
    00 x60 PUSH1 0x0a (dec 12)
    00 x60 PUSH1 0x00 (dec 0)
    00 f3 RETURN // returns 12 bytes from position 0
    //b.Creation code
    //store 42 in memory
    00 PUSH1 0x2a (dec 42) //what to store
    00 PUSH1 0x80 (dec 128)//position in memory
    00 MSTORE
    //returns 42 from memory
    00 PUSH1 0x20 (dec 32)
    00 PUSH1 0x80 (dec 128) 
    00 RETURN
    */
    const data = "0x600a600c600039600a6000f3602a60005260206000f3"

    //2.Send transaction to address 0x0
    const tx = await attacker.sendTransaction({
      data,
    })
    const { creates } = tx as { creates?: string }

    //3.Set solver
    await magicNum.setSolver(creates!)

    // console.log(await attacker.call({ to: creates }))
    const bytecode = await ethers.provider.getCode(creates!);

    const sizeInBytes = (bytecode.length - 2) / 2;
    expect(sizeInBytes).to.lessThanOrEqual(10)

    const solver = await ethers.getContractAt('Solver', creates!)
    expect(await solver.connect(attacker).whatIsTheMeaningOfLife()).to.eq(42)
  });

});
