import { expect } from "chai";
import { ethers } from "hardhat";

describe.only("Dex", async function () {

  it("Should deplete one of the tokens", async function () {
    const [signer] = await ethers.getSigners()

    const Dex = await ethers.getContractFactory("Dex");
    const dex = await Dex.deploy();
    await dex.deployed();

    const SwappableToken = await ethers.getContractFactory("SwappableToken");
    const token1 = await SwappableToken.deploy(dex.address, "TOKEN1", "TK1", 1000);
    await token1.deployed();

    const token2 = await SwappableToken.deploy(dex.address, "TOKEN2", "TK2", 1000);
    await token2.deployed();

    const DexAttacker = await ethers.getContractFactory("DexAttacker");
    const dexAttacker = await DexAttacker.deploy(dex.address, token1.address, token2.address);
    await dexAttacker.deployed();

    await dex.setTokens(token1.address, token2.address)

    await token1.transfer(dex.address, 100)
    await token2.transfer(dex.address, 100)


    await token1.transfer(dexAttacker.address, 10)
    await token2.transfer(dexAttacker.address, 10)

    await dexAttacker.callSwap()

    expect(await token1.balanceOf(dex.address)).to.be.eq(0)
  });
});

