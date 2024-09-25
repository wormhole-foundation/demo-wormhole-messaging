const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
	// Load the chain configuration and deployed contract addresses
	const chains = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, '../deploy-config/chains.json'))
	);
	const deployedContracts = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, '../deploy-config/deployedContracts.json'))
	);

	console.log('Sender Contract Address: ', deployedContracts.avalanche.MessageSender);
	console.log('Receiver Contract Address: ', deployedContracts.celo.MessageReceiver);
	console.log('...');

	// Get the Avalanche Fuji configuration
	const avalancheChain = chains.chains.find((chain) =>
		chain.description.includes('Avalanche testnet')
	);

	// Set up the provider and wallet
	const provider = new ethers.JsonRpcProvider(avalancheChain.rpc);
	const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

	// Load the ABI of the MessageSender contract
	const messageSenderJson = JSON.parse(
		fs.readFileSync(path.resolve(__dirname, '../out/MessageSender.sol/MessageSender.json'), 'utf8')
	);

	const abi = messageSenderJson.abi;

	// Create a contract instance for MessageSender
	const MessageSender = new ethers.Contract(
		deployedContracts.avalanche.MessageSender, // Automatically use the deployed address
		abi,
		wallet
	);

	// Define the target chain and target address (the Celo receiver contract)
	const targetChain = 14; // Wormhole chain ID for Celo Alfajores
	const targetAddress = deployedContracts.celo.MessageReceiver; // Automatically use the deployed address

	// The message you want to send
	const message = 'Hello from Avalanche to Celo!';

	// Dynamically quote the cross-chain cost
	const txCost = await MessageSender.quoteCrossChainCost(targetChain);

	// Send the message (make sure to send enough gas in the transaction)
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
