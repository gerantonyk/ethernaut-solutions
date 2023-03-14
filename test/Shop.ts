import { expect } from "chai";
import { ethers } from "hardhat";

describe("Shop", async function () {

  it("Should call a view function ven thougth isn't view", async function () {
    const Shop = await ethers.getContractFactory("Shop");
    const shop = await Shop.deploy();
    await shop.deployed();

    const ShopAttacker = await ethers.getContractFactory("ShopAttacker");
    const shopAttacker = await ShopAttacker.deploy(shop.address);
    await shopAttacker.deployed();

    await shopAttacker.callBuy()

    expect(await shop.price()).to.be.eq(1)
  });
});

