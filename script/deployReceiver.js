const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
	// Load the chain configuration from the JSON file
	const chains = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, '../deploy-config/chains.json'))
	);

	// Get the Celo Testnet configuration
	const celoChain = chains.chains.find((chain) => chain.description.includes('Celo Testnet'));

	// Set up the provider and wallet
	const provider = new ethers.JsonRpcProvider(celoChain.rpc);
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

	// Load the ABI and bytecode of the MessageReceiver contract
	const messageReceiverJson = JSON.parse(
		fs.readFileSync(
			path.resolve(__dirname, '../out/MessageReceiver.sol/MessageReceiver.json'),
			'utf8'
		)
	);

	const abi = messageReceiverJson.abi;
	const bytecode = messageReceiverJson.bytecode;

	// Create a ContractFactory for MessageReceiver
	const MessageReceiver = new ethers.ContractFactory(abi, bytecode, wallet);

	// Deploy the contract using the Wormhole Relayer address for Celo Testnet
	const receiverContract = await MessageReceiver.deploy(celoChain.wormholeRelayer);
	await receiverContract.waitForDeployment();

	console.log('MessageReceiver deployed to:', receiverContract.target); // `target` is the contract address in ethers.js v6

	// Update the deployedContracts.json file
	const deployedContractsPath = path.resolve(__dirname, '../deploy-config/deployedContracts.json');
	const deployedContracts = JSON.parse(fs.readFileSync(deployedContractsPath, 'utf8'));

	// Retrieve the address of the MessageSender from the deployedContracts.json file
	const avalancheSenderAddress = deployedContracts.avalanche.MessageSender;

	// Define the source chain ID for Avalanche Fuji
	const sourceChainId = 6;

	// Call setRegisteredSender on the MessageReceiver contract
	const tx = await receiverContract.setRegisteredSender(
		sourceChainId,
		ethers.zeroPadValue(avalancheSenderAddress, 32)
	);
	await tx.wait(); // Wait for the transaction to be confirmed

	console.log(
		`Registered MessageSender (${avalancheSenderAddress}) for Avalanche chain (${sourceChainId})`
	);

	deployedContracts.celo = {
		MessageReceiver: receiverContract.target,
		deployedAt: new Date().toISOString(),
	};

	fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 2));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
