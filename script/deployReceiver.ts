import { ethers } from 'ethers';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ChainsConfig, DeployedContracts, MessageReceiverJson } from './interfaces';

async function main(): Promise<void> {
  // Load the chain configuration
  const chains: ChainsConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../deploy-config/chains.json'), 'utf8')
  );

  // Get the Celo Testnet configuration
  const celoChain = chains.chains.find((chain) =>
    chain.description.includes('Celo Testnet')
  );
  if (!celoChain) {
    throw new Error('Celo Testnet configuration not found.');
  }

  // Set up provider
  const provider = new ethers.JsonRpcProvider(celoChain.rpc);

  // Load the encrypted keystore
  const keystorePath = path.join(os.homedir(), '.foundry', 'keystores', 'CELO_AVAX');
  const keystore = fs.readFileSync(keystorePath, 'utf8');

  // Prompt for password
  const rl = readline.createInterface({ input, output });
  const password = await rl.question('Enter keystore password: ');
  rl.close();

  if (!password) {
    throw new Error('No password provided.');
  }

  // Decrypt and connect wallet
  const wallet = await ethers.Wallet.fromEncryptedJson(keystore, password);
  const connectedWallet = wallet.connect(provider);

  // Load ABI + bytecode
  const messageReceiverJson: MessageReceiverJson = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../out/MessageReceiver.sol/MessageReceiver.json'),
      'utf8'
    )
  );

  const { abi, bytecode } = messageReceiverJson;

  // Create ContractFactory
  const MessageReceiver = new ethers.ContractFactory(abi, bytecode, connectedWallet);

  // Deploy contract
  const receiverContract = await MessageReceiver.deploy(celoChain.wormholeRelayer);
  await receiverContract.waitForDeployment();

  console.log('MessageReceiver deployed to:', receiverContract.target);

  // Load deployed contracts
  const deployedContractsPath = path.resolve(__dirname, '../deploy-config/deployedContracts.json');
  const deployedContracts: DeployedContracts = JSON.parse(
    fs.readFileSync(deployedContractsPath, 'utf8')
  );

  // Register sender
  const avalancheSenderAddress = deployedContracts.avalanche?.MessageSender;
  if (!avalancheSenderAddress) {
    throw new Error('Avalanche MessageSender address not found.');
  }

  const sourceChainId = 6; // Wormhole chain ID for Avalanche

  const tx = await (receiverContract as any).setRegisteredSender(
    sourceChainId,
    ethers.zeroPadValue(avalancheSenderAddress, 32)
  );
  await tx.wait();

  console.log(`Registered MessageSender (${avalancheSenderAddress}) for Avalanche chain (${sourceChainId})`);

  // Save updated deployed contracts
  deployedContracts.celo = {
    MessageReceiver: receiverContract.target as any,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});