## Demo Multichain Messaging with Wormhole

This project demonstrates how to send and receive _multichain messages_ using the **Wormhole** protocol, specifically between Avalanche Fuji and Celo Alfajores TestNets. The repository includes automated scripts for deploying contracts and sending messages across these chains.

The [Get Started with Messaging](/docs/products/messaging/get-started/) documentation provides a step by step guide for setting up and running this repository.

### Features

 - Deploy smart contracts on Avalanche Fuji and Celo Alfajores TestNets
 - Automatically manage contract addresses
 - Send a multichain message from one chain to another using Wormhole

### Prerequisites

- [Foundry installed](https://book.getfoundry.sh/getting-started/installation)
- [Node.js and npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- You will need TestNet tokens in both chains ([Fuji](https://core.app/tools/testnet-faucet/?subnet=c&token=c) / [Alfajores](https://faucet.celo.org/alfajores)) to complete transactions
- [Foundry keystore password](https://book.getfoundry.sh/reference/cast/cast-wallet-import){target=\_blank} - scripts will prompt for password when wallet private key is needed for signatures

> The `chains.json` file requires the details of the source and target chains. For a complete list of contract addresses needed to populate this file, visit the [contract addresses page](https://wormhole.com/docs/build/reference/) from the Wormhole Documentation. In this project, we are using Avalanche and Celo as default.

### Quickstart

**1. Clone the repository:**

```bash
git clone https://github.com/wormhole-foundation/demo-wormhole-messaging.git
```

**2. Navigate to your project directory:**

```bash
cd demo-wormhole-messaging
```

**3. Install Foundry dependencies:**

```bash
forge install wormhole-foundation/wormhole-solidity-sdk
forge install foundry-rs/forge-std
```


**4. Install dependencies:**

```bash
npm install
```

**5. Compile contracts:**

```bash
forge build
```

**6. Run Tests:**

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

**7. Deploy contracts:**

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

**8. Send Cross-Chain Message:**

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


