import { expect } from "chai";
import { ethers } from "hardhat";

describe("CoinFlip", async function () {

  it("Should win 10 in a row", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const CoinFlip = await ethers.getContractFactory("CoinFlip");
    const coinFlip = await CoinFlip.deploy();
    await coinFlip.deployed();
    //setup-

    //1. Deploy CoinFlipAttacker
    const CoinFlipAttacker = await ethers.getContractFactory("CoinFlipAttacker");
    const coinFlipAttacker = await CoinFlipAttacker.connect(attacker).deploy(coinFlip.address);
    await coinFlipAttacker.deployed();


    //2.Call CoinFlipAttacker until we get the 10th win
    let wins = 0;
    while (wins < 10) {
      try {
        await coinFlipAttacker.flippitGood()
        wins++
      } catch (error) {
      }
    }

    expect(await coinFlip.consecutiveWins()).to.eq(10)

  });
});