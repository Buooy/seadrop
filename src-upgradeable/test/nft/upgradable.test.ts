import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { baseContract } from "./__fixtures__";

describe("Token (Upgrade)", function () {
  it("allows upgrading", async () => {
    const { nft, addresses } = await loadFixture(baseContract);
    const UpgradedMockContractFactory = await ethers.getContractFactory(
      "UpgradedMock"
    );
    const upgradedNFT = await upgrades.upgradeProxy(
      addresses.proxy,
      UpgradedMockContractFactory
    );
    expect(await upgradedNFT.testUpgrade()).to.equal("Upgraded");
  });
});
