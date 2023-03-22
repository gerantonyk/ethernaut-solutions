// address legacyToken,
// address vaultAddress,
// address fortaAddress,
// address playerAddress


import { expect } from "chai";
import { ethers } from "hardhat";

describe("DoubleEntryPoint", async function () {

  it("Should avoid the exploit", async function () {
    const [deployer, player] = await ethers.getSigners()

    const Forta = await ethers.getContractFactory("Forta");
    const forta = await Forta.deploy();
    await forta.deployed();

    const LegacyToken = await ethers.getContractFactory("LegacyToken");
    const legacyToken = await LegacyToken.deploy();
    await legacyToken.deployed();

    const CryptoVault = await ethers.getContractFactory("CryptoVault");
    const cryptoVault = await CryptoVault.deploy(player.address);
    await cryptoVault.deployed();

    const DoubleEntryPoint = await ethers.getContractFactory("DoubleEntryPoint");
    const doubleEntryPoint = await DoubleEntryPoint.deploy(legacyToken.address, cryptoVault.address, forta.address, player.address);
    await doubleEntryPoint.deployed();

    //legayToken
    await legacyToken.delegateToNewContract(doubleEntryPoint.address)


    await cryptoVault.setUnderlying(doubleEntryPoint.address)

    //la vault tiene 100000000000000000000
    await legacyToken.mint(cryptoVault.address, ethers.utils.parseEther('100'))

    expect(await legacyToken.balanceOf(cryptoVault.address)).to.eq(ethers.utils.parseEther('100'))
    expect(await doubleEntryPoint.balanceOf(cryptoVault.address)).to.eq(ethers.utils.parseEther('100'))

    //if we run sweep we will take the doubleEntryPoint because the delegatetransferfuntion in legacyToken
    // cryptoVault.sweepToken(legacyToken.address)
    // expect(await doubleEntryPoint.balanceOf(cryptoVault.address)).to.eq(ethers.utils.parseEther('0'))

    //We need to add a boot to be called before the execution to revert
    //si se llama a la funcion delegateTransfer y ademas el original sender es el cryptovault 
    const DoubleEntryPointDetectionBot = await ethers.getContractFactory("DoubleEntryPointDetectionBot");
    const doubleEntryPointDetectionBot = await DoubleEntryPointDetectionBot.deploy(cryptoVault.address, forta.address);
    await doubleEntryPointDetectionBot.deployed();

    await forta.connect(player).setDetectionBot(doubleEntryPointDetectionBot.address)

    await expect(cryptoVault.sweepToken(legacyToken.address)).to.be.revertedWith('Alert has been triggered, reverting')
  });
});

