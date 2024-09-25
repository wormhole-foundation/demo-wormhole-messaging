// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "lib/wormhole-solidity-sdk/src/interfaces/IWormholeRelayer.sol";

contract MessageSender {
    IWormholeRelayer public wormholeRelayer;
    uint256 constant GAS_LIMIT = 50000; // Adjust the gas limit as needed

    constructor(address _wormholeRelayer) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    function quoteCrossChainCost(uint16 targetChain) public view returns (uint256 cost) {
        (cost,) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);
    }

    function sendMessage(uint16 targetChain, address targetAddress, string memory message) external payable {
        uint256 cost = quoteCrossChainCost(targetChain); // Dynamically calculate the cross-chain cost
        require(msg.value >= cost, "Insufficient funds for cross-chain delivery");

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            targetAddress,
            abi.encode(message, msg.sender), // Payload contains the message and sender address
            0, // No receiver value needed
            GAS_LIMIT // Gas limit for the transaction
        );
    }
}
