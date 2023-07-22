import fs from "fs";
import { ethers, upgrades } from "hardhat";

const tokenName = "Undark";
const tokenSymbol = "UNDK";
const allowedSeaDrop = ["0x00005EA00Ac477B1030CE78506496e8C2dE24bf5"];

async function mainDeploy() {
  const Undark = await ethers.getContractFactory("Undark");
  console.log("Deploying...");
  const undark = await upgrades.deployProxy(
    Undark,
    [tokenName, tokenSymbol, allowedSeaDrop],
    { initializer: "initialize" }
  );
  await undark.deployed();
  const addresses = {
    proxy: undark.address,
    admin: await upgrades.erc1967.getAdminAddress(undark.address),
    implementation: await upgrades.erc1967.getImplementationAddress(
      undark.address
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
