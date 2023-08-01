import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, ethers } from "ethers";
import { mintedContract } from "./__fixtures__";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Token (Staking 0)", function () {
  let nft: Contract;
  let owner: SignerWithAddress;
  let dev: SignerWithAddress;
  let externalAccount: SignerWithAddress;

  before(async () => {
    const {
      dev: _dev,
      nft: _nft,
      owner: _owner,
      externalAccount: _externalAccount,
    } = await loadFixture(mintedContract);

    dev = _dev;
    nft = _nft;
    owner = _owner;
    externalAccount = _externalAccount;
  });

  it("allows DEV role to stake", async () => {
    await nft.connect(dev).updateStaking([1, 2, 3], [100, 100, 100]);
    expect(await nft.tokenStakeStatus(1)).to.gte(0);
    expect(await nft.tokenStakeStatus(2)).to.gte(0);
    expect(await nft.tokenStakeStatus(3)).to.gte(0);
  });
  it("fails if users transfer tokens while staked", async () => {
    await nft.updateStaking([7], [3000]);
    await expect(
      nft
        .connect(externalAccount)
        .transferFrom(externalAccount.address, nft.address, 7)
    ).to.be.revertedWith("Token is Staked");
  });
  it("allows users to transfer tokens after unstaking", async () => {
    await nft.updateStaking([7], [0]);
    await nft
      .connect(externalAccount)
      .transferFrom(externalAccount.address, nft.address, 7);
    expect(await nft.balanceOf(nft.address)).to.equal(1);
  });
});
