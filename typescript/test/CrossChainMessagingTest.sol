// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "../src/MessageSender.sol";
import "../src/MessageReceiver.sol";
import "lib/wormhole-solidity-sdk/src/interfaces/IWormholeRelayer.sol";

contract CrossChainMessagingTest is Test {
    MessageSender public senderContract;
    MessageReceiver public receiverContract;
    address public wormholeRelayer = address(this); // Set this test contract as the mock Wormhole Relayer

    // This function runs before every test
    function setUp() public {
        // Deploy the MessageSender and MessageReceiver contracts
        senderContract = new MessageSender(wormholeRelayer);
        receiverContract = new MessageReceiver(wormholeRelayer);
    }

    function testDeployment() public view {
        // Verify the deployment of the contracts
        assertEq(address(senderContract).code.length > 0, true);
        assertEq(address(receiverContract).code.length > 0, true);
    }

    function testSendMessage() public {
        uint16 targetChain = 14; // Celo Testnet Wormhole chain ID
        address targetAddress = address(receiverContract); // Use the receiver contract's address
        string memory message = "Hello from Avalanche to Celo!";

        // Mock the cross-chain cost estimation
        uint256 estimatedCost = 1 ether; // Replace with a mock value
        vm.deal(address(this), estimatedCost); // Fund the contract with enough ETH

        // Simulate the sendMessage call
        vm.expectRevert(); // Expect a revert due to unhandled cross-chain behavior in testing
        senderContract.sendMessage{value: estimatedCost}(targetChain, targetAddress, message);
    }

    function testReceiveMessage() public {
        string memory message = "Hello from Avalanche to Celo!";
        bytes memory payload = abi.encode(message);

        // Simulate the Wormhole relayer by setting the msg.sender in the context of this call
        vm.prank(wormholeRelayer); // Set msg.sender to the mock Wormhole relayer (this contract)

        // Receive the message
        receiverContract.receiveWormholeMessages(payload, new bytes[](0), bytes32(0), 14, bytes32(0));
    }
}
