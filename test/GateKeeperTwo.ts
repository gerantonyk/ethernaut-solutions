import { expect } from "chai";
import { ethers } from "hardhat";

describe("GatekeeperTwo", async function () {
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
    const GatekeeperTwo = await ethers.getContractFactory("GatekeeperTwo");
    const gatekeeperTwo = await GatekeeperTwo.deploy();
    await gatekeeperTwo.deployed();

    const GatekeeperTwoAttacker = await ethers.getContractFactory("GatekeeperTwoAttacker");
    const gatekeeperTwoAttacker = await GatekeeperTwoAttacker.deploy(gatekeeperTwo.address);

    await gatekeeperTwoAttacker.deployed();

    expect(await gatekeeperTwo.entrant()).to.eq(signer.address)
  });

});
