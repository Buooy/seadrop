import { Signer } from "ethers";
import { ethers, upgrades } from "hardhat";

export const tokenName = "Undark";
export const tokenSymbol = "UNDK";
export const seadropAddress = process.env.SEADROP_ADDRESS;

export const baseContract = async () => {
  const [owner, financeWallet, externalAccount, nonHolder]: Signer[] =
    await ethers.getSigners();
  const NFTFactory = await ethers.getContractFactory("Undark");
  const nft = await upgrades.deployProxy(
    NFTFactory,
    [
      tokenName,
      tokenSymbol,
      await financeWallet.getAddress(),
      [seadropAddress],
    ],
    {
      initializer: "initialize",
    }
  );
  await nft.deployed();
  const addresses = {
    proxy: nft.address,
    admin: await upgrades.erc1967.getAdminAddress(nft.address),
    implementation: await upgrades.erc1967.getImplementationAddress(
      nft.address
    ),
  };

  await nft.setMaxSupply(100);

  return {
    nft,
    owner,
    ownerAddress: await owner.getAddress(),
    financeWallet,
    financeWalletAddress: await financeWallet.getAddress(),
    externalAccount,
    externalAccountAddress: await externalAccount.getAddress(),
    nonHolder,
    nonHolderAddress: await nonHolder.getAddress(),
    addresses,
  };
};
