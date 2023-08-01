import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { mintedContract } from "./__fixtures__";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token (Staking 1)", function () {
  let nft: Contract;
  let owner: SignerWithAddress;
  let externalAccount: SignerWithAddress;
  let mkt: SignerWithAddress;

  before(async () => {
    const {
      nft: _nft,
      owner: _owner,
      externalAccount: _externalAccount,
      mkt: _mkt,
    } = await loadFixture(mintedContract);

    nft = _nft;
    owner = _owner;
    externalAccount = _externalAccount;
    mkt = _mkt;
  });

  it("emits staked event on stake", async () => {
    await expect(nft.stake([1, 2, 3])).to.emit(nft, "Stake");
  });

  it("prevents transfer on staking", async () => {
    await expect(
      nft.transferFrom(owner.address, externalAccount.address, 1)
    ).to.be.revertedWith("Token is Staked");
  });

  it("prevents users from re-staking their tokens", async () => {
    await expect(nft.stake([1, 2, 3])).to.be.revertedWith("Already Staked");

    const stakedFrom = await nft.tokenStakeStatus(1);
    expect(stakedFrom.gte(0)).to.be.true;
  });

  it("fails if user stakes another users token", async () => {
    await expect(nft.stake([10])).to.be.revertedWith("Not Token Owner");
  });

  it("emits unstaked event on unstake", async () => {
    await expect(nft.unstake([1, 2]))
      .to.emit(nft, "Unstake")
      .withArgs([1, 2]);
    let stakedFrom = await nft.tokenStakeStatus(1);
    expect(stakedFrom).to.be.eq(0);

    stakedFrom = await nft.tokenStakeStatus(2);
    expect(stakedFrom).to.be.eq(0);

    stakedFrom = await nft.tokenStakeStatus(3);
    expect(stakedFrom.gte(0)).to.be.true;
  });

  it("fails if user unstakes an unstaked token", async () => {
    await expect(nft.unstake([1])).to.be.revertedWith("Not Staked");
  });

  it("shows all staked tokens", async () => {
    const allStaked = await nft.getAllStaked();
    expect(allStaked[0]).to.be.eq(0);
    expect(allStaked[3]).to.be.gt(0);
  });

  it("shows number of staked tokens", async () => {
    let numStaked = await nft.getTotalStaked();
    expect(numStaked).to.be.eq(1);
    await nft.stake([1, 2]);
    numStaked = await nft.getTotalStaked();
    expect(numStaked).to.be.eq(3);
  });

  it("allows owner to get all staked token statuses", async () => {
    await nft.unstake([1, 2, 3]);
    await nft.transferFrom(owner.address, externalAccount.address, 1);
    await nft.transferFrom(owner.address, externalAccount.address, 2);
    await nft.transferFrom(owner.address, externalAccount.address, 3);

    await nft.connect(externalAccount).stake([1, 2]);
    const userStaked = await nft
      .connect(externalAccount)
      .getUsersStaked([1, 2, 3]);
    expect(userStaked[0]).to.be.gt(0);
    expect(userStaked[3]).to.be.undefined;
  });

  it("allows admin to get all staked tokens statuses", async () => {
    const userStaked = await nft.getUsersStaked([1, 2, 3]);
    expect(userStaked[0]).to.be.gt(0);
    expect(userStaked[3]).to.be.undefined;
  });

  it("does not allow other users to view staked token statuses", async () => {
    await expect(nft.connect(mkt).getUsersStaked([1, 2, 3])).to.be.revertedWith(
      "Not Token Owner"
    );
  });

  it("allows users to transfer while staked", async () => {
    const originalBalance = await nft.balanceOf(owner.address);
    await expect(
      nft
        .connect(externalAccount)
        .transferWhileStaked(owner.address, [1, 2, 3])
    ).to.be.revertedWith("Transfer while staked not active");
    await nft.setCanTransferWhileStaked(true);
    await nft
      .connect(externalAccount)
      .transferWhileStaked(owner.address, [1, 2, 3]);
    expect(await nft.balanceOf(owner.address)).to.equal(
      originalBalance.toNumber() + 3
    );
    expect((await nft.getUsersStaked([1]))[0]).to.be.gt(0);
  });
});
