import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { baseContract } from "./__fixtures__";

describe("Token (Upgrade)", function () {
  it("allows upgrading", async () => {
    const { nft, addresses } = await loadFixture(baseContract);
    const UpgradedUndarkContractFactory = await ethers.getContractFactory(
      "UpgradedUndark"
    );
    const upgradedNFT = await upgrades.upgradeProxy(
      addresses.proxy,
      UpgradedUndarkContractFactory
    );
    expect(await upgradedNFT.testUpgrade()).to.equal("Upgraded");
  });
});
