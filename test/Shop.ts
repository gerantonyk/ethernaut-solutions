import { expect } from "chai";
import { ethers } from "hardhat";

describe("Shop", async function () {

  it("Should call a view function ven thougth isn't view", async function () {
    //setup+
    const [deployer, attacker] = await ethers.getSigners()
    const Shop = await ethers.getContractFactory("Shop");
    const shop = await Shop.deploy();
    await shop.deployed();
    //setup-

    //1.Deploy attacker
    const ShopAttacker = await ethers.getContractFactory("ShopAttacker");
    const shopAttacker = await ShopAttacker.connect(attacker).deploy(shop.address);
    await shopAttacker.deployed();

    //2.Call buy through the attacker
    await shopAttacker.callBuy()

    expect(await shop.price()).to.be.lessThan(100)
  });
});

