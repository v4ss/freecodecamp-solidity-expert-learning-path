const { ethers } = require("hardhat");

const networkConfig = {
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625", // Find here : https://docs.chain.link/vrf/v2/direct-funding/supported-networks#sepolia-testnet
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId: "7544",
        callbackGasLimit: "500000", //500,000
        interval: "30", // 30 seconds
    },
    31337: {
        name: "hardhat",
        //vrfCoordinatorV2: Don't because it's the mocks contract
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // Usse the same that Sepolia, hardhat he doesn't care because we use the mocks
        //subscriptionId: It's create we the Mock function in 01-deploy-raffle.js
        callbackGasLimit: "500000", //500,000
        interval: "30", // 30 seconds
    },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
};
