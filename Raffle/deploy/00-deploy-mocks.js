const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");

const BASE_FEE = ethers.parseEther("0.25"); // 0.25 is the premium. It costs 0.25 LINK. Find here : https://docs.chain.link/vrf/v2/direct-funding/supported-networks#sepolia-testnet
const GAS_PRICE_LINK = 1e9; // Calculated value based on the gas price of the chain

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const args = [BASE_FEE, GAS_PRICE_LINK];

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...");
        // Deploy a mock vrfCoordinator...
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: args,
            log: true,
        });
        log("Mocks Deployed!");
        log("---------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
