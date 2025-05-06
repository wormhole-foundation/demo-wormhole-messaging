import { ethers } from 'ethers';
import fs from 'fs';
import os from 'os';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { ChainsConfig, DeployedContracts } from './interfaces';

async function main(): Promise<void> {
  // Load chain config and deployed contract addresses
  const chains: ChainsConfig = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../deploy-config/chains.json'), 'utf8')
  );

  const deployedContracts: DeployedContracts = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../deploy-config/deployedContracts.json'), 'utf8')
  );

  console.log('Sender Contract Address: ', deployedContracts.avalanche.MessageSender);
  console.log('Receiver Contract Address: ', deployedContracts.celo.MessageReceiver);
  console.log('...');

  // Get Avalanche Fuji config
  const avalancheChain = chains.chains.find((chain) =>
    chain.description.includes('Avalanche testnet')
  );

  if (!avalancheChain) {
    throw new Error('Avalanche testnet configuration not found in chains.json.');
  }

  // Set up provider
  const provider = new ethers.JsonRpcProvider(avalancheChain.rpc);

  // Load encrypted keystore
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

  // Load ABI
  const messageSenderJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../out/MessageSender.sol/MessageSender.json'), 'utf8')
  );
  const abi = messageSenderJson.abi;

  // Instantiate MessageSender contract
  const MessageSender = new ethers.Contract(
    deployedContracts.avalanche.MessageSender,
    abi,
    connectedWallet
  );

  // Define destination chain and receiver
  const targetChain = 14; // Wormhole chain ID for Celo Alfajores
  const targetAddress = deployedContracts.celo.MessageReceiver;

  const message = 'Hello from Avalanche to Celo!';

  // Quote the cost and send the message
  const txCost = await MessageSender.quoteCrossChainCost(targetChain);
  const tx = await MessageSender.sendMessage(targetChain, targetAddress, message, {
    value: txCost,
  });

  console.log('Transaction sent, waiting for confirmation...');
  await tx.wait();
  console.log('...');

  console.log('Message sent! Transaction hash:', tx.hash);
  console.log(
    `You may see the transaction status on the Wormhole Explorer: https://wormholescan.io/#/tx/${tx.hash}?network=TESTNET`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});