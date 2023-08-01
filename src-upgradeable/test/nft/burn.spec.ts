import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { baseContract } from "./__fixtures__";

describe("Token (Burning)", function () {
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
    await nft
      .connect(externalAccount)
      .mint(5, externalAccountAddress, { value: mintPrice.mul(5).toString() });
  });

  it("prevents burning tokens not owned", async () => {
    await expect(nft.connect(owner).batchBurn([1, 6])).to.be.revertedWith(
      "TransferCallerNotOwnerNorApproved"
    );
  });

  it("allows multiple tokens to be burnt", async () => {
    expect(await nft.totalSupply()).to.equal(5);
    expect(await nft.balanceOf(externalAccountAddress)).to.equal(5);
    const currentSupply = await nft.totalSupply();
    await nft.connect(externalAccount).batchBurn([1, 2, 3, 4, 5]);
    expect(await nft.totalSupply()).to.equal(currentSupply - 5);
    expect(await nft.balanceOf(externalAccountAddress)).to.equal(0);
  });
});
