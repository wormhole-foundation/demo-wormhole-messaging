import { ethers } from 'ethers';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ChainsConfig, DeployedContracts, MessageSenderJson } from './interfaces';

async function main(): Promise<void> {
  // Load chain configuration
  const chains: ChainsConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../deploy-config/chains.json'), 'utf8')
  );

  // Find Avalanche Fuji testnet config
  const avalancheChain = chains.chains.find((chain) =>
    chain.description.includes('Avalanche testnet')
  );
  if (!avalancheChain) {
    throw new Error('Avalanche testnet configuration not found in chains.json.');
  }

  // Set up provider
  const provider = new ethers.JsonRpcProvider(avalancheChain.rpc);

  // Load the encrypted keystore
  const keystorePath = path.join(os.homedir(), '.foundry', 'keystores', 'CELO_AVAX');
  const keystore = fs.readFileSync(keystorePath, 'utf8');

  // Prompt user for password
  const rl = readline.createInterface({ input, output });
  const password = await rl.question('Enter keystore password: ');
  rl.close();

  if (!password) {
    throw new Error('No password provided.');
  }

  // Decrypt and connect wallet
  const wallet = await ethers.Wallet.fromEncryptedJson(keystore, password);
  const connectedWallet = wallet.connect(provider);

  // Load ABI and bytecode
  const messageSenderJson: MessageSenderJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../out/MessageSender.sol/MessageSender.json'), 'utf8')
  );
  const { abi, bytecode } = messageSenderJson;

  // Create contract factory and deploy
  const MessageSender = new ethers.ContractFactory(abi, bytecode, connectedWallet);
  const senderContract = await MessageSender.deploy(avalancheChain.wormholeRelayer);
  await senderContract.waitForDeployment();

  console.log('MessageSender deployed to:', senderContract.target);

  // Update deployedContracts.json
  const deployedContractsPath = path.resolve(__dirname, '../deploy-config/deployedContracts.json');
  const deployedContracts: DeployedContracts = JSON.parse(
    fs.readFileSync(deployedContractsPath, 'utf8')
  );

  deployedContracts.avalanche = {
    MessageSender: senderContract.target as any,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
