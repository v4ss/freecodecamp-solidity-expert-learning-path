require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: [],
            chainId: 11155111, //To know the chainId, go to chainlist.org
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    solidity: {
        compilers: [{ version: "0.8.19" }, { version: "0.6.6" }],
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            11155111: 1,
        },
        users: {
            default: 1,
        },
    },
};
