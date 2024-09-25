const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
  // Load the chain configuration from JSON
  const chains = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../deploy-config/chains.json"))
  );

  // Get the Avalanche Fuji configuration
  const avalancheChain = chains.chains.find((chain) =>
    chain.description.includes("Avalanche testnet")
  );

  // Set up the provider and wallet
  const provider = new ethers.JsonRpcProvider(avalancheChain.rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Load the ABI and bytecode of the MessageSender contract
  const messageSenderJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../out/MessageSender.sol/MessageSender.json"), "utf8")
  );

  const abi = messageSenderJson.abi;
  const bytecode = messageSenderJson.bytecode;

  // Create a ContractFactory for MessageSender
  const MessageSender = new ethers.ContractFactory(abi, bytecode, wallet);

  // Deploy the contract using the Wormhole Relayer address for Avalanche Fuji
  const senderContract = await MessageSender.deploy(avalancheChain.wormholeRelayer);
  await senderContract.waitForDeployment();

  console.log("MessageSender deployed to:", senderContract.target);

  // Update the deployedContracts.json file
  const deployedContractsPath = path.resolve(__dirname, "../deploy-config/deployedContracts.json");
  const deployedContracts = JSON.parse(fs.readFileSync(deployedContractsPath, "utf8"));

  deployedContracts.avalanche = {
    MessageSender: senderContract.target,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
