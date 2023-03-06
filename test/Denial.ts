import { expect } from "chai";
import { ethers } from "hardhat";

describe.only("Denial", async function () {

  it("Should be reverted", async function () {
    const [signer, attacker] = await ethers.getSigners()
    const Denial = await ethers.getContractFactory("Denial");
    const denial = await Denial.deploy();
    await denial.deployed();

    const DenialAttacker = await ethers.getContractFactory("DenialAttacker");
    const denialAttacker = await DenialAttacker.deploy();
    await denialAttacker.deployed();

    await denial.setWithdrawPartner(denialAttacker.address)

    await expect(denial.withdraw({ gasLimit: 1000000 })).to.be.reverted
  });
});

