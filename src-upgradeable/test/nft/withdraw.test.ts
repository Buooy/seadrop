import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { baseContract } from "./__fixtures__";

describe("Token (Withdraw)", function () {
  it("only allows contract owner", async () => {
    const { nft, dev } = await loadFixture(baseContract);
    await expect(nft.connect(dev).withdraw()).to.be.reverted;
  });
  it("withdraws", async () => {
    const { nft, owner, externalAccount } = await loadFixture(baseContract);
    const MINTER_ROLE = await nft.MINTER_ROLE();
    await nft.grantRole(MINTER_ROLE, externalAccount.address);
    await nft.connect(externalAccount).mint([1], [externalAccount.address], {
      value: ethers.utils.parseEther("10"),
    });
    const currentBalance = await owner.getBalance();
    await nft.withdraw();
    expect(await owner.getBalance()).to.be.greaterThanOrEqual(currentBalance);
  });
});
