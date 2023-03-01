import { expect } from "chai";
import { ethers } from "hardhat";

describe("MagicNumber", async function () {

  it("Should complete the function with no error", async function () {
    const [signer] = await ethers.getSigners()
    /*
    00 0x60 PUSH1 0xa0 (dec 17)
    02 0x60 PUSH1 0x0c (dec 0)
    00 0x60 PUSH1 0x00 (dec 0)
    00 0x39 CODECOPY
    00 x60 PUSH1 0x0a (dec 0)
    00 x60 PUSH1 0x00 (dec 0)
    00 f3 RETURN
    00 PUSH1 0x2a (dec 0)
    00 PUSH1 0x80 (dec 128)
    00 MSTORE
    00 PUSH1 0x20 (dec 32)
    00 PUSH1 0x80 (dec 128)
    00 RETURN


    */


    const data = "0x600a600c600039600a6000f3602a60805260206080f3"
    const tx = await signer.sendTransaction({
      data,
    })
    const { creates } = tx as { creates?: string }

    const tx2 = await signer.call({ to: creates })



    console.log(tx2)
  });

});
