import { expect } from "chai";
import { ethers } from "hardhat";

describe("NaughtCoin", async function () {

  it("Should complete the function with no error", async function () {
    const [signer] = await ethers.getSigners()
    const NaughtCoin = await ethers.getContractFactory("NaughtCoin");
    const naughtCoin = await NaughtCoin.deploy(signer.address);
    await naughtCoin.deployed();

    const NaughtCoinAttacker = await ethers.getContractFactory("NaughtCoinAttacker");
    const naughtCoinAttacker = await NaughtCoinAttacker.deploy(naughtCoin.address);

    await naughtCoinAttacker.deployed();
    expect(await naughtCoin.balanceOf(signer.address)).to.gt(0)
    await naughtCoin.approve(naughtCoinAttacker.address, await naughtCoin.balanceOf(signer.address))
    await naughtCoinAttacker.attack()
    expect(await naughtCoin.balanceOf(signer.address)).to.eq(0)
  });

});
