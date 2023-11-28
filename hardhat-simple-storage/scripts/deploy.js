// imports
const { ethers } = require("hardhat");

// async main
async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );
    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy();
    console.log(`Deployed contract to: ${simpleStorage.target}`);
}

async function verify(contractAddress, args) {}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
