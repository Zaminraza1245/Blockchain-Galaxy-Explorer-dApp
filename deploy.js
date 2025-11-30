const { ethers } = require("hardhat");

async function main() {
  const GalaxyToken = await ethers.getContractFactory("GalaxyToken");
  const galaxyToken = await GalaxyToken.deploy();

  await galaxyToken.waitForDeployment();

  const address = await galaxyToken.getAddress();
  console.log("GalaxyToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
