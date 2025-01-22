import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ChainsConfig, DeployedContracts, MessageReceiverJson } from './interfaces';

dotenv.config();

async function main(): Promise<void> {
	// Load the chain configuration from the JSON file
	const chains: ChainsConfig = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, '../deploy-config/chains.json'), 'utf8')
	);

	// Get the Celo Testnet configuration
	const celoChain = chains.chains.find((chain) => chain.description.includes('Celo Testnet'));
	if (!celoChain) {
		throw new Error('Celo Testnet configuration not found.');
	}

	// Set up the provider and wallet
	const provider = new ethers.JsonRpcProvider(celoChain.rpc);
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

	// Load the ABI and bytecode of the MessageReceiver contract
	const messageReceiverJson: MessageReceiverJson = JSON.parse(
		fs.readFileSync(
			path.resolve(__dirname, '../out/MessageReceiver.sol/MessageReceiver.json'),
			'utf8'
		)
	);

	const { abi, bytecode } = messageReceiverJson;

	// Create a ContractFactory for MessageReceiver
	const MessageReceiver = new ethers.ContractFactory(abi, bytecode, wallet);

	// Deploy the contract using the Wormhole Relayer address for Celo Testnet
	const receiverContract = await MessageReceiver.deploy(celoChain.wormholeRelayer);
	await receiverContract.waitForDeployment();

	console.log('MessageReceiver deployed to:', receiverContract.target); // `target` is the contract address in ethers.js v6

	// Update the deployedContracts.json file
	const deployedContractsPath = path.resolve(__dirname, '../deploy-config/deployedContracts.json');
	const deployedContracts: DeployedContracts = JSON.parse(
		fs.readFileSync(deployedContractsPath, 'utf8')
	);

	// Retrieve the address of the MessageSender from the deployedContracts.json file
	const avalancheSenderAddress = deployedContracts.avalanche?.MessageSender;
	if (!avalancheSenderAddress) {
		throw new Error('Avalanche MessageSender address not found.');
	}

	// Define the source chain ID for Avalanche Fuji
	const sourceChainId = 6;

	// Call setRegisteredSender on the MessageReceiver contract
	const tx = await (receiverContract as any).setRegisteredSender(
		sourceChainId,
		ethers.zeroPadValue(avalancheSenderAddress, 32)
	);
	await tx.wait(); // Wait for the transaction to be confirmed

	console.log(
		`Registered MessageSender (${avalancheSenderAddress}) for Avalanche chain (${sourceChainId})`
	);

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
