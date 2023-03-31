import { expect } from "chai";
import { ethers } from "hardhat";

describe("Dex", async function () {

  it("Should deplete one of the tokens", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()

    const Dex = await ethers.getContractFactory("Dex");
    const dex = await Dex.deploy();
    await dex.deployed();

    const SwappableToken = await ethers.getContractFactory("SwappableToken");
    const token1 = await SwappableToken.deploy(dex.address, "TOKEN1", "TK1", 1000);
    await token1.deployed();

    const token2 = await SwappableToken.deploy(dex.address, "TOKEN2", "TK2", 1000);
    await token2.deployed();

    await dex.setTokens(token1.address, token2.address)

    token1["approve(address,uint256)"](dex.address, 100);
    token2["approve(address,uint256)"](dex.address, 100);

    dex.addLiquidity(token1.address, 100);
    dex.addLiquidity(token2.address, 100);

    await token1.transfer(attacker.address, 10)
    await token2.transfer(attacker.address, 10)
    //setup-

    //1.Deploy attacker
    const DexAttacker = await ethers.getContractFactory("DexAttacker");
    const dexAttacker = await DexAttacker.connect(attacker).deploy(dex.address, token1.address, token2.address);
    await dexAttacker.deployed();

    //2.Send tokens to attacker
    await token1.transfer(attacker.address, 10)
    await token2.transfer(attacker.address, 10)

    //3.Call attacker
    await dexAttacker.callSwap()

    expect(await token1.balanceOf(dex.address)).to.be.eq(0)
  });
});

