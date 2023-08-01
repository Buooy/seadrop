import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { baseContract } from "./__fixtures__";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token (Staking)", function () {
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
      .mint(4, holderAddress, { value: mintPrice.mul(4).toString() });
  });

  it("emits staked event on stake", async () => {
    await expect(nft.connect(holder).stake([1, 2, 3, 4]))
      .to.emit(nft, "Lock")
      .withArgs(holderAddress, 1)
      .withArgs(holderAddress, 2)
      .withArgs(holderAddress, 3)
      .withArgs(holderAddress, 4);
  });

  it("prevents transfer on staking", async () => {
    await expect(
      nft.transferFrom(holderAddress, ownerAddress, 1)
    ).to.be.revertedWith("Token is Staked");
  });

  it("prevents users from re-staking their tokens", async () => {
    await expect(nft.connect(holder).stake([1, 2, 3])).to.be.revertedWith(
      "Already Staked"
    );

    const stakedFrom = await nft.tokenStakeStatus(1);
    expect(stakedFrom.gte(0)).to.be.true;
  });

  it("fails if user stakes another users token", async () => {
    await expect(nft.connect(nonHolder).stake([1])).to.be.revertedWith(
      "Not Token Owner"
    );
  });

  it("emits unstaked event on unstake", async () => {
    await expect(nft.connect(holder).unstake([1, 2]))
      .to.emit(nft, "Unlock")
      .withArgs(1)
      .withArgs(2);
    let stakedFrom = await nft.tokenStakeStatus(1);
    expect(stakedFrom).to.be.eq(0);

    stakedFrom = await nft.tokenStakeStatus(2);
    expect(stakedFrom).to.be.eq(0);

    stakedFrom = await nft.tokenStakeStatus(3);
    expect(stakedFrom.gte(0)).to.be.true;
  });

  it("fails if user unstakes an unstaked token", async () => {
    await expect(nft.connect(holder).unstake([1])).to.be.revertedWith(
      "Not Staked"
    );
  });

  it("shows all staked tokens", async () => {
    const allStaked = await nft.connect(owner).getAllStaked();
    expect(allStaked[0]).to.be.eq(0);
    expect(allStaked[3]).to.be.gt(0);
  });

  it("shows number of staked tokens", async () => {
    let numStaked = await nft.connect(owner).getTotalStaked();
    expect(numStaked).to.be.eq(1);
    await nft.connect(holder).stake([1, 2]);
    numStaked = await nft.connect(owner).getTotalStaked();
    expect(numStaked).to.be.eq(3);
  });

  it("allows admin to get all staked tokens statuses", async () => {
    const userStaked = await nft.getUsersStaked([1, 2, 3]);
    expect(userStaked[0]).to.be.gt(0);
    expect(userStaked[3]).to.be.undefined;
  });

  it("does not allow other users to view staked token statuses", async () => {
    await expect(
      nft.connect(nonHolder).getUsersStaked([1, 2, 3])
    ).to.be.revertedWith("Not Token Owner");
  });
});
