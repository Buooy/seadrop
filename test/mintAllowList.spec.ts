/*
import { expect } from "chai";
import { keccak256 } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { MerkleTree } from "merkletreejs";

import { randomHex } from "./utils/encoding";
import { VERSION } from "./utils/helpers";

import type { IERC721SeaDrop, ISeaDrop } from "../typechain-types";
import type { MintParamsStruct } from "../typechain-types/src/SeaDrop";
import type { Wallet } from "ethers";

const allowListElements = async (
  leaves: Array<[minter: string, mintParams: MintParamsStruct]>
) =>
  Promise.all(
    leaves.map(async ([minter, mintParams]) => [
      minter,
      await mintParams.mintPrice,
      await mintParams.maxTotalMintableByWallet,
      await mintParams.startTime,
      await mintParams.endTime,
      await mintParams.dropStageIndex,
      await mintParams.maxTokenSupplyForStage,
      await mintParams.feeBps,
      (await mintParams.restrictFeeRecipients) === true ? 1 : 0,
    ])
  );

describe(`Mint Allow List (v${VERSION})`, function () {
  const { provider } = ethers;
  let seadrop: ISeaDrop;
  let token: IERC721SeaDrop;
  let creator: Wallet;
  let feeRecipient: Wallet;
  let feeBps: number;

  after(async () => {
    await network.provider.request({
      method: "hardhat_reset",
    });
  });

  before(async () => {
    const SeaDrop = await ethers.getContractFactory("SeaDrop");
    seadrop = await SeaDrop.deploy();
    creator = new ethers.Wallet(randomHex(32), provider);
    feeRecipient = new ethers.Wallet(randomHex(32), provider);
    const SeaDropToken = await ethers.getContractFactory("ERC721SeaDrop");
    token = await SeaDropToken.deploy();
    await token.updateAllowedFeeRecipient(seadrop, feeRecipient.address);
    await token.updateCreatorPayoutAddress(creator);
    await token.updatePublicDropFee(feeBps);
  });

  it("can mint an allow list stage", async () => {
    const minter = "0xabc";
    const mintParams = {
      mintPrice: "10000000000000",
      maxTotalMintableByWallet: 10,
      startTime: 1660154484,
      endTime: 1760154484,
      dropStageIndex: 1,
      maxTokenSupplyForStage: 500,
      feeBps: 100,
      restrictFeeRecipients: false,
    };

    const elements = await allowListElements([[minter, mintParams]]);

    const merkleTree = new MerkleTree(elements, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });

    const root = merkleTree.getHexRoot();

    const leaf = merkleTree.getLeaf(0);

    const proof = merkleTree.getHexProof(leaf);

    const allowListData = [root, [], ""];
    await token.updateAllowList(seadrop, allowListData);

    expect(
      await seadrop.mintAllowList(
        token.address,
        feeRecipient,
        minter,
        3,
        mintParams,
        proof
      )
    ).to.be.true;
  });
});
*/
