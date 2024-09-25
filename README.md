## Demo Cross-Chain Messaging with Wormhole

This project demonstrates how to send and receive _cross-chain messages_ using the **Wormhole** protocol, specifically between Avalanche Fuji and Celo Alfajores TestNets. The repository includes automated scripts for deploying contracts and sending messages across these chains.

### Features

 - Deploy smart contracts on Avalanche Fuji and Celo Alfajores TestNets
 - Automatically manage contract addresses
 - Send a cross-chain message from one chain to another using Wormhole

### Prerequisites

- [Foundry installed](https://book.getfoundry.sh/getting-started/installation)
- [Node.js and npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- You will need TestNet tokens in both chains ([Fuji](https://faucets.chain.link/fuji) / [Alfajores](https://faucets.chain.link/celo-alfajores-testnet)) to complete transactions
- An `.env` file with your private key:

```bash
PRIVATE_KEY=0x...
```

> The `chains.json` file requires the details of the source and target chains. For a complete list of contract addresses needed to populate this file, visit the [contract addresses page](https://wormhole.com/docs/build/reference/) from the Wormhole Documentation. In this project, we are using Avalanche and Celo as default.

### Quickstart

**1. Clone the repository:**

```bash
git clone 
```

**2. Install dependencies:**

```bash
npm install
forge install
```

**3. Compile contracts:**

```bash
forge build
```

**4. Run Tests:**

Before deploying contracts, it's recommended to run the tests to ensure everything is functioning correctly. Run:

```bash
forge test
```

The expected output should include passing results for all test cases, with outputs similar to:

```
Ran 3 tests for test/CrossChainMessagingTest.sol:CrossChainMessagingTest
[PASS] testDeployment() (gas: 13011)
[PASS] testReceiveMessage() (gas: 18114)
[PASS] testSendMessage() (gas: 21029)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 7.53ms (3.55ms CPU time)

Ran 1 test suite in 112.75ms (7.53ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

**5. Deploy contracts:**

**Deploy the sender contract on Avalanche Fuji:**

```bash
npm run deploy:sender
```
- You may see the respective contract deployed on the [Fuji Explorer](https://testnet.snowtrace.io/)

**Deploy the receiver contract on Celo Alfajores:**

```bash
npm run deploy:receiver
```
- You may see the respective contract deployed on the [Alfajores Explorer](https://explorer.celo.org/alfajores/)

**6. Send Cross-Chain Message:**

Send a message from Avalanche Fuji to Celo Alfajores:

```bash
npm run send:message
```
- You may check the transaction status on the [Wormhole Explorer](https://wormholescan.io/#/?network=TESTNET)

### How It Works

The project uses two smart contracts:

- **`MessageSender.sol` (Avalanche Fuji)** - sends a message to the target chain
- **`MessageReceiver.sol` (Celo Alfajores)** - receives the message and logs it

The deployment scripts automatically store the contract addresses in `deployedContracts.json` for easy reuse.

### Project Structure

- **script/** - deployment and interaction scripts
- **deploy-config/** - chain configuration and deployed contract addresses
- **out/** - compiled contract artifacts
- **lib/** - external dependencies (auto-managed by Foundry)
- **test/** - unit tests for smart contracts

### Resources
The [Wormhole documentation tutorial](https://wormhole.com/docs/tutorials/messaging/cross-chain-contracts/) provides a detailed, step-by-step guide for setting up and running this repository.
