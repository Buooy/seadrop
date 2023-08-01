import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { baseContract } from "./__fixtures__";

describe("Token (Withdraw)", function () {
  let nft;
  let owner;
  let ownerAddress;
  let externalAccount;
  let externalAccountAddress;
  const mintPrice = ethers.utils.parseEther("0.1");

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

    //  Mint tokens
    await nft.connect(owner).setDirectMint(true);
    await nft.connect(owner).setMaxSupply(100);
  });

  it("only allows contract owner to set finance wallet", async () => {
    await expect(
      nft.connect(externalAccount).setFinanceWallet(ownerAddress)
    ).to.be.revertedWith("OnlyOwner()");

    await nft.connect(owner).setFinanceWallet(ownerAddress);
    expect(await nft.financeWallet()).to.equal(ownerAddress);
  });

  it("only allows contract owner to withdraw", async () => {
    await expect(nft.connect(externalAccount).withdraw()).to.be.revertedWith(
      "OnlyOwner()"
    );
  });

  it("withdraws", async () => {
    const currentBalance = await owner.getBalance();

    await nft
      .connect(externalAccount)
      .mint(5, externalAccountAddress, { value: mintPrice.mul(5).toString() });

    await nft.connect(owner).withdraw();

    const newBalance = await owner.getBalance();
    const minNewBalance = currentBalance.add(mintPrice.mul(4));

    expect(newBalance.gte(minNewBalance)).to.be.true;
  });
});
