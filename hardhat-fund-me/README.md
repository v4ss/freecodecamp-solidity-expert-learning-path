# Hardhat Fund Me - Advanced HH Project

First create a root folder for this project and add the following packages :

```bash
mkdir hardhat-fund-me
cd hardhat-fund-me

yarn add hardhat --dev
```

## Linter

In an advanced Hardhat project, we have `ESLinter` for Javascript and `Solhint` for Solidity.
These are tools for reporting code errors and lack of best practices.

We actually use ony `Solhint`. To execute it, run :

```bash
yarn solhint YOUR_CONTRACT.sol
```

## Hardhat Setup

Run :

```bash
yarn hardhat init
```

To create an Hardhat project.

### Prettier setup

```bash
yarn add --dev prettier prettier-plugin-solidity
```

Create a `.prettierrc` and `.prettierignore` files in the same order :

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": false
}
```

```txt
node_modules
package.json
img
artifacts
cache
coverage
.env
.*
README.md
coverage.json
```

### Hardhat depedencies

```bash
yarn add --dev dotenv
```

Create a `.env` file to store the RPC URL and the PRIVATE KEY associated to the network

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/rDZs9PzXQ2...ysTcfqH
PRIVATE_KEY=f39c2800...515ace5f
ETHERSCAN_API_KEY=A1NP9G...MW8I77ADGT
COINMARKETCAP_API_KEY=960f...2ec295e
```

```bash
yarn add --dev @chainlink/contracts hardhat-deploy @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers
```

Now, modify the `hardhat.config.js` and add the require packages :

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111, //To know the chainId, go to chainlist.org
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    solidity: "0.8.19",
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
};
```

Delete the script `deploy.js` and create a `deploy` folder and a `01-deploy-fund-me.js` file into.

```js
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
};
```

In `hardhat.config.js`, we add a property in the `module.exports` :

```js
// This our named accounts
namedAccounts: {
        deployer: {
            default: 0,   // By default, this account is the 0
            11155111: 1,  // In the Sepolia network, is the 1
        },
        users: {
            default: 1,
        },
    },
```

### Mocking & helper-hardhat-config

A mock simulate an object. It is often use for unit test.
We have a problem here, in our `PriceConverter.sol` we have the chainlink address to ETH/USD for the Sepolia testnet. But how we can do to test and deploy our contract in another network ?
We can't write this address in hard in the code !

Change this and add a parameter to our constructor to give the good address at each time.
Modify also the function to take in charge this parameter.

Now, when we want to deploy the contract, we want to say "If the chainId is X, use this address, etc ...". For this, we use `helper-hardhat-config.js`. Create it :

```js
const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
    },
};

// And export this for the other script
module.exports = {
    networkConfig,
};
```

Return to `01-deploy-fund-me.js` and import the `networkConfig` and use it to have a personnalized priceFeed Address :

```js
const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true, // Put price feed address
    });
};
```

But how we can deploy our contract in a local node ? It's here we use a mock contract.
The idea of mock is if the contract doesn't exist, we deploy a minimal version of fore our local testing.
Create a new file in `deploy/00-deploy-mocks.js` who are very similar to the other deploy script :

```js
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
};
```

Go create our mock contract. Create a new folder `contracts/test` and create a new contract `contracts/test/MockV3Aggregator.sol`.
Chainlink has already create a `MockV3Aggregator.sol`, so we use it :

```sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
```

We have to add the solidity compiler version to `hardhat.config.js` :

```js
solidity: {
    compilers: [{ version: "0.8.19" }, { version: "0.6.6" }],
},
```

Compile :

```bash
yarn hardhat compile
```

For the mock deploy, we have now what do we need to interact with the AggregatorV3Interface. So in the `helper-hardhat-config.js` add a new const and add it in the `module.exports` :
We also add `DECIMALS` and `INITIAL_ANSWER` because the mock contract takes these two parameters in constructor :

```js
const developmentChains = ["hardhat", "localhost"];

const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

// And export this for the other script
module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
};
```

In the `deploy/00-deploy-mocks.js`, import this const and add the if statement

```js
const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config.js");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deplying mocks ...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks deployed!");
        log("-----------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
```

We add tags to target specify deploy in the command :

```bash
yarn hardhat deploy --tags mocks #Just deploy the script with "mocks" tag
```

Add the if statement in the `01-deploy-fund-me.js` :

```js
//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
let ethUsdPriceFeedAddress;
if (developmentChains.includes(network.name)) {
	const ethUsdAggregator = await deployments.get("MockV3Aggregator");
	ethUsdPriceFeedAddress = ethUsdAggregator.address;
} else {
	ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
}

...
...

// And add the tags at the end
module.exports.tags = ["all", "fundme"];
```

Deploy on hardhat network : `yarn hardhat deploy`

Deploy on localhost node : `yarn hardhat node` <-- It will be open a loclhost node and deploy in same time.

### Utils Folder

To verify our contract, we don't want to verify when we deploy it on local network. So, we have to add a statement to do this :

```js
if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
) {
}
```

Create a new foler `utils`. He will store differents scripts about our deployments.
Create a `verify.js` script into this new folder and paste it the `verify()` function we created before :

```js
const { run } = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying contract ...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!");
        } else {
            console.log(e);
        }
    }
}

module.exports = { verify };
```

Return in `01-deploy-fund-me.js`, import and call `verify` :

```js
const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId; //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];

    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
    log("------------------------------------");
};

module.exports.tags = ["all", "fundme"];
```

#### Block confirmation

To give time to etherscan to index our deployment, we have to give it. So, add the property `blockConfirmations` to the network in `hardhat.config.js` :

```js
networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,  // This line
        },

...

},
```

And also add in the deployment script `01-deploy-fund-me.js` the argument :

```js
const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // This line
});
```

To deploy on testnet, run :

```bash
yarn hardhat deploy --network sepolia
```

## Solidity Style Guide

### Order of Layout

Layout contract elements in the following order :

-   Pragma statements
-   Import statements
-   Error (the name of the error is : CONTRACT-NAME\_\_ERROR-NAME)
-   Interfaces
-   Libraries
-   Contracts

Inside each contract, library or interface, use the following order :

-   Type declarations
-   State variables
-   Events
-   Modifiers
-   Functions
    -   constructor
    -   receive
    -   fallback
    -   external
    -   public
    -   internal
    -   private
    -   view / pure

### Variable names

For `Storage` variables : `s_myStorageVar`
For `Immutable` variables : `i_myImmutableVar`
For `Constant` variables : `MY_CONSTANT_VAR`

## Testing Fund Me

For big project, there are two types of test :

-   unit : Test a minimal portion of our code to make sure that they work correctly
-   staging : To make that everything works on a testnet

Create two news folders into `test` : `test/unit` and `test/staging`

### Unit tests

Create `test/unit/FundMe.test.js` :

```js
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.parseEther("1"); // 1 ETH
          beforeEach(async function () {
              // deploy our fundMe contract
              // using Hardhat deploy
              // const accounts = await ethers.getSigners();
              // const accountZero = accounts[0];
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]); // Deploy all the contract tags with "all"
              // Get contracts

              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer,
              );
          });

          describe("constructor", async function () {
              it("Sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.target);
              });
          });

          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!",
                  );
              });
              it("Updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response =
                      await fundMe.getAddressToAmountFunded(deployer);
                  assert.equal(response.toString(), sendValue.toString());
              });

              it("Add funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer);
              });
          });

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer); // Act

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1); // Get the Gas price used
                  const { gasUsed, gasPrice } = transactionReceipt;
                  const gasCost = gasUsed * gasPrice;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer); // Assert

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );
              });

              it("Withdraw ETH from multiple funders", async function () {
                  // Get all the accounts
                  const accounts = await ethers.getSigners(); // For each account, connect it in the contract and fund
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1); // Get the Gas price used
                  const { gasUsed, gasPrice } = transactionReceipt;
                  const gasCost = gasUsed * gasPrice;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract =
                      await fundMe.connect(attacker);

                  await expect(
                      attackerConnectedContract.withdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });

          describe("cheaperWithdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("Withdraw ETH from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer); // Act

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1); // Get the Gas price used
                  const { gasUsed, gasPrice } = transactionReceipt;
                  const gasCost = gasUsed * gasPrice;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer); // Assert

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );
              });

              it("Withdraw ETH from multiple funders", async function () {
                  // Get all the accounts
                  const accounts = await ethers.getSigners(); // For each account, connect it in the contract and fund
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i],
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1); // Get the Gas price used
                  const { gasUsed, gasPrice } = transactionReceipt;
                  const gasCost = gasUsed * gasPrice;

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target,
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer);

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost,
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address,
                          ),
                          0,
                      );
                  }
              });

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract =
                      await fundMe.connect(attacker);

                  await expect(
                      attackerConnectedContract.cheaperWithdraw(),
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      });
```

To run tests :

```bash
yarn hardhat test
```

### Staging tests

Create a new file `test/staging/FundMe.staging.test.js`

```js
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, deployer;
          const sendValue = ethers.parseEther("1");
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("Allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target,
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
```

To run tests in real testnet :

```bash
yarn hardhat deploy --network sepolia

yarn hardhat test --network sepolia
```

## Running scripts on local node

We can create scripts to execute the functions of our contract on the local node.
Create the file `scripts/fund.js` :

```js
const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding Contract...");
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    });
    await transactionResponse.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

Create a `scripts/withdraw.js` :

```js
const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding...");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("Got it back!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

To run them :

-   First, deploy the local node with `yarn hardhat node` ;
-   Run the scripts with

```bash
yarn hardhat run scripts/fund.js --network localhost

yarn hardhat run scripts/withdraw.js --network localhost
```

## Update `package.json`

The final touch is to level up our `package.json`.

### Credits

Add the `name`, `author`, and `version` section at the top :

```json
{
    "name": "hardhat-fund-me",
    "author": "Florian Allione - v4ss",
    "version": "1.0.0"
}
```

### scripts

Add a `scripts` section :

```json
{
    "scripts": {
        "test": "yarn hardhat test",
        "test:staging": "yarn hardhat test --network sepolia",
        "lint": "yarn solhint 'contracts/*.sol'",
        "lint:fix": "yarn solhint 'contracts/*.sol' --fix",
        "format": "yarn prettier --write .",
        "coverage": "yarn hardhat coverage"
    }
}
```
