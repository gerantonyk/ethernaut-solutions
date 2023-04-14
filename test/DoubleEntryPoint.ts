import { expect } from "chai";
import { ethers } from "hardhat";

describe("DoubleEntryPoint", async function () {

  it("Should avoid the exploit", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()

    const Forta = await ethers.getContractFactory("Forta");
    const forta = await Forta.deploy();
    await forta.deployed();

    const LegacyToken = await ethers.getContractFactory("LegacyToken");
    const legacyToken = await LegacyToken.deploy();
    await legacyToken.deployed();

    const CryptoVault = await ethers.getContractFactory("CryptoVault");
    const cryptoVault = await CryptoVault.deploy(attacker.address);
    await cryptoVault.deployed();

    const DoubleEntryPoint = await ethers.getContractFactory("DoubleEntryPoint");
    const doubleEntryPoint = await DoubleEntryPoint.deploy(legacyToken.address, cryptoVault.address, forta.address, attacker.address);
    await doubleEntryPoint.deployed();

    await legacyToken.delegateToNewContract(doubleEntryPoint.address)

    await cryptoVault.setUnderlying(doubleEntryPoint.address)

    //vault has 100000000000000000000
    await legacyToken.mint(cryptoVault.address, ethers.utils.parseEther('100'))

    expect(await legacyToken.balanceOf(cryptoVault.address)).to.eq(ethers.utils.parseEther('100'))
    expect(await doubleEntryPoint.balanceOf(cryptoVault.address)).to.eq(ethers.utils.parseEther('100'))
    //setup-

    //if we run sweep we will take the doubleEntryPoint because the delegatetransferfuntion in legacyToken
    // cryptoVault.sweepToken(legacyToken.address)
    // expect(await doubleEntryPoint.balanceOf(cryptoVault.address)).to.eq(ethers.utils.parseEther('0'))

    //We need to add a bot to be called before the execution to revert

    //1.Deploy bot
    const DoubleEntryPointDetectionBot = await ethers.getContractFactory("DoubleEntryPointDetectionBot");
    const doubleEntryPointDetectionBot = await DoubleEntryPointDetectionBot.deploy(cryptoVault.address, forta.address);
    await doubleEntryPointDetectionBot.deployed();

    //2.Set bot
    await forta.connect(attacker).setDetectionBot(doubleEntryPointDetectionBot.address)

    await expect(cryptoVault.sweepToken(legacyToken.address)).to.be.revertedWith('Alert has been triggered, reverting')
  });
});

