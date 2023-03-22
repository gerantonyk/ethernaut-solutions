import { expect } from "chai";
import { ethers } from "hardhat";

describe.only("GoodSamaritan", async function () {

  it("Should empty the GoodSamaritan wallet", async function () {
    const [owner, attacker] = await ethers.getSigners()

    const GoodSamaritan = await ethers.getContractFactory("GoodSamaritan");
    const goodSamaritan = await GoodSamaritan.deploy();
    await goodSamaritan.deployed();
    const walletAddr = await goodSamaritan.wallet();
    const coinAddr = await goodSamaritan.coin();
    console.log(walletAddr)
    console.log(coinAddr)
    const GoodSamaritanAttacker = await ethers.getContractFactory("GoodSamaritanAttacker");
    const goodSamaritanAttacker = await GoodSamaritanAttacker.connect(attacker).deploy(goodSamaritan.address);
    await goodSamaritanAttacker.deployed();


    const wallet = await ethers.getContractAt('Wallet', walletAddr)
    const coin = await ethers.getContractAt('Coin', coinAddr)

    console.log(await coin.balances(walletAddr))

    await goodSamaritanAttacker.connect(attacker).callRequestDonation()

    console.log(await coin.balances(walletAddr))
  });
});
