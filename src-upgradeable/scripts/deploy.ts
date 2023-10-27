import fs from "fs";
import { ethers, upgrades } from "hardhat";

const tokenName = "Undark";
const tokenSymbol = "UNDK";
const seadropAddress = process.env.SEADROP_ADDRESS;
const allowedSeaDrop = [seadropAddress];

async function mainDeploy() {
  const { provider } = ethers;
  const admin = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const Undark = await ethers.getContractFactory("Undark");
  console.log("Deploying...");
  const token = await upgrades.deployProxy(
    Undark,
    [tokenName, tokenSymbol, allowedSeaDrop],
    { initializer: "initialize" }
  );
  await token.deployed();
  const addresses = {
    proxy: token.address,
    admin: await upgrades.erc1967.getAdminAddress(token.address),
    implementation: await upgrades.erc1967.getImplementationAddress(
      token.address
    ),
  };
  console.log("Addresses: ", addresses);

  try {
    await (run as any)("verify", { address: addresses.implementation });
  } catch (e) {}

  fs.writeFileSync("deployment-addresses.json", JSON.stringify(addresses));
}

mainDeploy().catch((error) => {
  console.error(error);
});
