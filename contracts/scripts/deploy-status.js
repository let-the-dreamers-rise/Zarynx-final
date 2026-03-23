import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPLOYMENTS_DIR = path.resolve(__dirname, "..", "deployments");

async function main() {
  const { ethers } = await network.connect();
  const networkName = network.name || process.env.HARDHAT_NETWORK || "statusSepolia";
  const [deployer] = await ethers.getSigners();
  const owner = process.env.OWNER_ADDRESS || deployer.address;
  const agentWallet = process.env.AGENT_PRIVATE_KEY
    ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY)
    : null;
  const agent = process.env.AGENT_ADDRESS || agentWallet?.address || deployer.address;
  const maxSpendEth = process.env.STATUS_MAX_SPEND_ETH || process.env.MAX_SPEND_ETH || "0.0001";
  const maxSpend = ethers.parseEther(maxSpendEth);
  const allowedTargets = (process.env.STATUS_ALLOWED_TARGETS || owner)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const statusTxOverrides = {
    gasPrice: 0n,
    type: 0,
  };

  const AuthorityManager = await ethers.getContractFactory("AuthorityManager");
  const authorityManager = await AuthorityManager.deploy(
    owner,
    agent,
    maxSpend,
    allowedTargets,
    statusTxOverrides
  );
  await authorityManager.waitForDeployment();

  const deployment = {
    network: networkName,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    owner,
    agent,
    maxSpendEth,
    allowedTargets,
    contracts: {
      authorityManager: await authorityManager.getAddress(),
    },
    deployedAt: new Date().toISOString(),
  };

  fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DEPLOYMENTS_DIR, `${networkName}.json`),
    JSON.stringify(deployment, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
