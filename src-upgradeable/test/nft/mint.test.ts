import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { baseContract } from "./__fixtures__";

describe("Token (Mint)", function () {
  let nft;
  let owner;
  let ownerAddress;
  let externalAccount;
  let externalAccountAddress;

  before(async () => {
    const {
      nft: _nft,
      owner: _owner,
      ownerAddress: _ownerAddress,
      externalAccountAddress: _externalAccountAddress,
      externalAccount: _externalAccount,
    } = await loadFixture(baseContract);

    nft = _nft;
    owner = _owner;
    ownerAddress = _ownerAddress;
    externalAccountAddress = _externalAccountAddress;
    externalAccount = _externalAccount;
  });

  it("fails if direct mint is disabled", async () => {
    await expect(
      nft.connect(externalAccount).mint(1, externalAccountAddress)
    ).to.be.revertedWith("Direct Mint is Disabled");
  });

  it("enable direct mint by owner only", async () => {
    await expect(
      nft.connect(externalAccount).setDirectMint(true)
    ).to.be.revertedWith("OnlyOwner()");

    await nft.connect(owner).setDirectMint(true);
    expect(await nft.directMintEnabled()).to.equal(true);
  });

  it("set max supply by owner only", async () => {
    await expect(
      nft.connect(externalAccount).setMaxSupply(10)
    ).to.be.revertedWith("OnlyOwner()");

    await nft.connect(owner).setMaxSupply(10);
    expect(await nft.maxSupply()).to.equal(10);
  });

  it("mints one token", async () => {
    await nft.connect(externalAccount).mint(1, externalAccountAddress);
    expect(await nft.balanceOf(externalAccountAddress)).to.equal(1);
  });

  it("mint to delegate address", async () => {
    await nft.connect(externalAccount).mint(4, ownerAddress);
    expect(await nft.balanceOf(ownerAddress)).to.equal(4);
  });

  it("fails if exceed max supply", async () => {
    await expect(
      nft.connect(externalAccount).mint(20, externalAccountAddress)
    ).to.be.revertedWith("Exceed Total Supply");
  });
});
