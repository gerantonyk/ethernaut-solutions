import { expect } from "chai";
import { ethers } from "hardhat";

describe("GatekeeperTwo", async function () {

  it("Should become the entrant", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const GatekeeperTwo = await ethers.getContractFactory("GatekeeperTwo");
    const gatekeeperTwo = await GatekeeperTwo.deploy();
    await gatekeeperTwo.deployed();
    //setup-

    //1. Deploy the attacker (the logic is in the constructor)
    const GatekeeperTwoAttacker = await ethers.getContractFactory("GatekeeperTwoAttacker");
    const gatekeeperTwoAttacker = await GatekeeperTwoAttacker.connect(attacker).deploy(gatekeeperTwo.address);
    await gatekeeperTwoAttacker.deployed();

    expect(await gatekeeperTwo.entrant()).to.eq(attacker.address)
  });

});
