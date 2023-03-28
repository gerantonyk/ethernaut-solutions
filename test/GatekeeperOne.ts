import { expect } from "chai";
import { ethers } from "hardhat";

describe("GatekeeperOne", async function () {


  it("Should become the entrant", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
    const gatekeeperOne = await GatekeeperOne.deploy();
    await gatekeeperOne.deployed();
    //setup-

    //1.Deploy attacker
    const GatekeeperOneAttacker = await ethers.getContractFactory("GatekeeperOneAttacker");
    const gatekeeperOneAttacker = await GatekeeperOneAttacker.connect(attacker).deploy(gatekeeperOne.address);
    await gatekeeperOneAttacker.deployed();

    //2.Guess gas
    for (let i = 5 * 8191; i < 5 * 8191 + 8191; i++) {

      try {
        await gatekeeperOneAttacker.calling(i)
        // console.log('gas:' + i)
        break;
      } catch (error) {

      }
    }

    expect(await gatekeeperOne.entrant()).to.eq(attacker.address)
  });

});
