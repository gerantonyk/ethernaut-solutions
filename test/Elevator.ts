import { expect } from "chai";
import { ethers } from "hardhat";

describe("Evelevator", async function () {

  it("Should reach the top", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Elevator = await ethers.getContractFactory("Elevator");
    const elevator = await Elevator.deploy();
    await elevator.deployed();
    //setup-

    //1.Deploy our custom Building
    const Building = await ethers.getContractFactory("Building");
    const building = await Building.connect(attacker).deploy(elevator.address);
    await building.deployed();

    //2.Call goTo through Building
    await building.callGoTo(1);

    expect(await elevator.top()).to.eq(true)
  });
});