import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, ethers } from "ethers";
import { baseContract } from "./__fixtures__";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token (Update Staking)", function () {
  let nft;
  let owner;
  let ownerAddress;
  let holder;
  let holderAddress;
  let nonHolder;
  let nonHolderAddress;
  const mintPrice = ethers.utils.parseEther("0.1");

  before(async () => {
    const {
      nft: _nft,
      owner: _owner,
      ownerAddress: _ownerAddress,
      externalAccountAddress: _externalAccountAddress,
      externalAccount: _externalAccount,
      nonHolder: _nonHolder,
      nonHolderAddress: _nonHolderAddress,
    } = await loadFixture(baseContract);

    nft = _nft;
    owner = _owner;
    ownerAddress = _ownerAddress;
    holderAddress = _externalAccountAddress;
    holder = _externalAccount;
    nonHolder = _nonHolder;
    nonHolderAddress = _nonHolderAddress;

    await nft.connect(owner).setDirectMint(true);
    await nft.connect(owner).setMaxSupply(10);
    await nft
      .connect(holder)
      .mint(3, holderAddress, { value: mintPrice.mul(3).toString() });
  });

  it("only allows owner role to update staking", async () => {
    await expect(
      nft.connect(nonHolder).updateStaking([1], [100])
    ).to.be.revertedWith("OnlyOwner()");

    await expect(
      nft.connect(holder).updateStaking([1], [100])
    ).to.be.revertedWith("OnlyOwner()");

    await nft.connect(owner).updateStaking([1, 2, 3], [100, 100, 100]);
    expect(await nft.tokenStakeStatus(1)).to.gte(0);
    expect(await nft.tokenStakeStatus(2)).to.gte(0);
    expect(await nft.tokenStakeStatus(3)).to.gte(0);
  });

  it("gets total tokens staked", async () => {
    await expect(nft.connect(nonHolder).getTotalStaked()).to.be.revertedWith(
      "OnlyOwner()"
    );

    const totalStaked = await nft.connect(owner).getTotalStaked();
    expect(totalStaked).to.equal(2);
  });
});
