# Hardhat Setup

Create the project with `yarn init`.
Add hardhat package :

```bash
yarn add --dev hardhat
```

Then, run :

```bash
yarn hardhat
```

It's to create an Hardhat project !

[!NOTE] Use `yarn hardhat --verbose` to see where is the `hardhat-config.js`.

## List of hardhat commands

```bash
yarn hardhat accounts #To see all the fakes accounts available (Like Ganache)
yarn hardhat compile #To compile your contracts
```

## Prettier setup

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

# Deploying contracts from Hardhat

Go into `scripts` folder and `deploy.js` :

```js
// imports
const { ethers } = require("hardhat");

// async main
async function main() {
    const SimpleStorageFactory =
        await ethers.getContractFactory("SimpleStorage");
    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.waitForDeployment();
    console.log(`Deployed contract to: ${simpleStorage.target}`);
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

Deploy the contract with the command :

```bash
yarn hardhat run scripts/deploy.js
```

## Hardhat Network

By default, hardhat host a fake network like Ganache does. That's why, we can deploy our contract and get a contract address without writing an RPC URL or private key in the script.
In `hardhat.config.js`, we can add a property to define the default network and the network we want to use.

Before that, we have to install the `dotenv` package to have environment variables :

```bash
yarn add --dev dotenv
```

Create a `.env` file to store the RPC URL and the PRIVATE KEY associated to the network

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/rDZs9PzXQ2dtNBgJbAQX8bo4QysTcfqH
PRIVATE_KEY=f39c...ce5f
```

Now, modify the `hardhat.config.js` :

```js
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
	defaultNetwork: "hardhat",
	networks: {
		sepolia: {
			url: SEPOLIA_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 11155111, //To know the chainId, go to chainlist.org
		},
	}
	solidity: "0.8.9",
}
```

We can also define the network directly in the command to run the script.

```bash
yarn hardhat run scripts/deploy.js --network hardhat
#OR
yarn hardhat run scripts/deploy.js --network sepolia
```

## Verify Contracts on Etherscan

Install the `hardhat-etherscan` package :

```bash
yarn add --dev @nomiclabs/hardhat-etherscan
```

Add the package in `hardhat.config.js` :

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan"); // This line

...
```

Go to https://etherscan.io, create an account and create an API Key. Add it in `.env` file :

```txt
ETHERSCAN8API_KEY=YOUR_API_KEY_FOR_ETHERSCAN
```

Go back in the `hardhat.config.js` and add a new section in the `module.exports` :

```js
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY; // This const

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
    },
    solidity: "0.8.19",
    etherscan: {                        //
        apiKey: ETHERSCAN_API_KEY,      // This section
    },                                  //
```

Nom, you can verify your contract on etherscan with this command :

```bash
yarn hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
```

But, for the future, we are going to add a function in the `deploy.js` script to this autamotically.

Create a `verify()` function to our `deploy.js` :

```js
async function verify(contractAddress, args) {
    console.log("Verifying contract ...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().include("already verified")) {
            console.log("Already Verified!");
        } else {
            console.log(e);
        }
    }
}
```

This `try catch` is necessary because if the contract is already verified, the function return an error and break the run of the script. We don't want this, that's why we use `try catch`.

We have to add the package `run` that we use in `verify()`. In the import in the same file, add `run` :

```js
//imports
const { ethers, run } = require("hardhat");

...
```

### Check if we deploy in a network we can verify

In the cas if we deploy in the hardhat network, we can't verify the contract. So we have to check the network.
For this, add the `network` package like we do just before :

```js
//imports
const { ethers, run, network } = require("hardhat");

...
```

In the `main()` function, we can call `verify()` :

```js
async function main() {
    const SimpleStorageFactory =
        await ethers.getContractFactory("SimpleStorage");
    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy();
    console.log(`Deployed contract to: ${simpleStorage.target}`); // What happens when we deploy to our hardhat network?
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deploymentTransaction().wait(6);
        await verify(simpleStorage.target, []);
    }
}
```

We verify the `chainId` of the network and if the `ETHERSCAN_API_KEY` exists. If all is good, it's a good practice to wait few seconds that etherscan take account of the deployed contract and after we verify.

## Hardhat Tasks

We can create our own tasks in hardhat.

Create a `tasks` folder and a `block-number.js` file inside.

```js
const { task } = require("hardhat/config");

task("block-number", "Prints the current block number").setAction(
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`Current block number: ${blockNumber}`);
    },
);

module.exports = {};
```

In `hardhat.config.js` import the file at the top :

```js
require("./tasks/block-number.js");
```

We have just create a new task who give us the current block number of a network.
If we run `yarn hardhat` we can see our task in the list.

Run `yarn hardhat block-number --network sepolia` to display the current block number of the Sepolia Network.

## Configure Hardhat Network localhost

The default network "hardhat" don't work exactly like Ganache. At each deploy, the network is reinitialize and we don't work with several fakes addresses and more like Ganache.
To do this and open a fake node in localhost, we have to run : `yarn hardhat node`
This, create our own fake node like ganache.

To interact with it, we have to add a `localhost` network in `hardhat.config.js` :

```js
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        localhost: {
            //
            url: "http://127.0.0.1:8545/", // This network
            chainId: 31337, // The URL is given when you run :
        }, // yarn hardhat node
    },
    solidity: "0.8.19",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};
```

To use this network :

```bash
yarn hardhat run scripts/deploy.js --network localhost
```

## Hardhat Console

We can open a network console to write directly our script inside :

```bash
yarn hardhat console --network localhost
```

## Hardhat Tests

One of the most important things to do when we code a smart contract is to test it before deploy it.
First, in the `test` folder, create a `test-deploy.js` file :

```js
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage;
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await simpleStorageFactory.deploy();
    });

    it("Should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = "0"; // Two methods
        // assert
        // expect

        assert.equal(currentValue.toString(), expectedValue); //expect(currentValue.toString()).to.equal(expectedValue);
    });
});
```

We have a test who verify that the value of favorite number is equal to 0 at the start.

To launch the test, run : `yarn hardhat test`

We can add a second test who verify that the value can be updated :

```js
const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage;

    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await simpleStorageFactory.deploy();
    });

    it("Should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = "0"; // Two methods
        // assert
        // expect

        assert.equal(currentValue.toString(), expectedValue); //expect(currentValue.toString()).to.equal(expectedValue);
    });

    it("Should update the favorite number when we call store", async function () {
        const expectedValue = "7";
        const transactionResponse = await simpleStorage.store(expectedValue);
        await transactionResponse.wait(1);
        const updatedValue = await simpleStorage.retrieve();

        assert.equal(updatedValue.toString(), expectedValue);
    });
});
```

### Hardhat Gas Reporter

Hardhat allows to test the consumed gas when we call our functions.
To do this, first add the package :

```bash
yarn add hardhat-gas-reporter --dev
```

Go to the `hardhat.config.js` to import the package and add it in the `module.exports` :

```js hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
//require("@nomiclabs/hardhat-etherscan");
require("./tasks/block-number.js");
require("hardhat-gas-reporter"); // This import

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    solidity: "0.8.19",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        //
        enabled: true, // This section
    }, //
};
```

Now, when we run `yarn hardhat test` we have a gas reporting of the contract !

#### Customize Gas Reporter

We can add others properties to customize the gas reporter. Like an output file and a conversion of the gas price in USD in lots of token.

First, create an account to coinmarketcap and get an API KEY. Store it in the `.env`.

```txt
COINMARKETCAP_API_KEY=YOUR_API_KEY_FOR_COINMARKETCAP
```

Add the gasReporter's properties to the `hardhat.config.js` file :

```js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
//require("@nomiclabs/hardhat-etherscan");
require("./tasks/block-number.js");
require("hardhat-gas-reporter");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; // This line

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    solidity: "0.8.19",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt", // This lines ...
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH", // Select the token you want to test
    },
};
```

Then, add the `.txt` file in the `.gitignore` and it's done :

```txt
node_modules
.env

# Hardhat files
/cache
/artifacts

# TypeChain files
/typechain
/typechain-types

# solidity-coverage files
/coverage
/coverage.json

gas-reporter.txt
```

## Solidity Coverage

We use Solidity coverage to see if we test all the lines in our contracts. If we don't miss out to test something.
Install solidity coverage and import it in the `hardhat.config.js` :

```bash
yarn add --dev solidity-coverage
```

```js
...

require("solidity-coverage");

...
```

To see the coverage of our tests, run :

```bash
yarn hardhat coverage
```

## Hardhat Waffle

Hardhat Waffle is a framework to increase the tests. We see it in futures sections ...

# Typescript

We have created this project in JavaScript. To pass it in Typescript now, we have to do this steps :

-   **Step 1:** install this packages

```bash
yarn add --dev @typechain/ethers-v5 @typechain/hardhat @types/chai @types/node @types/mocha ts-node typechain typescript
```

-   **Step 2:** Convert all the `.js` files into `.ts`.
-   **Step 3:** Add a `tsconfig.json` :

```json
{
    "compilerOptions": {
        "target": "es2018",
        "module": "commonjs",
        "strict": true,
        "esModuleInterop": true,
        "outDir": "dist"
    },
    "include": ["./scripts", "./test"],
    "files": ["./hardhat.config.ts"]
}
```

-   **Step 4:** Replace all the `require()` by `import` :

    -   In the `deploy.ts`, replace :

    ````ts
    // This :
    const { ethers, run, network } = require("hardhat");

    // BY :
    import {ethers, run, network } from "hardhat";
    	```

    - In the `hardhat.config.ts`, replace :
    ```ts
    // THIS :
    require("@nomicfoundation/hardhat-toolbox");
    require("dotenv").config();
    //require("@nomiclabs/hardhat-etherscan");
    require("./tasks/block-number.js");
    require("hardhat-gas-reporter");
    require("solidity-coverage");

    // BY :
    import "@nomicfoundation/hardhat-toolbox";
    import "dotenv/config";
    //import "@nomiclabs/hardhat-etherscan";
    import "./tasks/block-number.js";
    import "hardhat-gas-reporter";
    import "solidity-coverage";
    // And add this import :
    import "@nomicfoundation/hardhat-ethers";
    ````

    -   In the `tasks/block-number.ts`, replace :

    ```ts
    // THIS :
    const { task } = require("hardhat/config");

    // BY :
    import { task } from "hardhat/config";
    ```

    -   Do the same thing for `test/test-deploy.ts`.

-   **Step 5:** Add types in `deploy.ts` :

```ts
async function verify(contractAddress: string, args: any[]) {
    // Add here
    console.log("Verifying contract ...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e: any) {
        // Add here
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!");
        } else {
            console.log(e);
        }
    }
}
```

-   **Step 6:** Modify the `module.exports` in `tasks/block-number.ts` :

```ts
import { task } from "hardhat/config";

// Add this before task()
export default task(
    "block-number",
    "Prints the current block number",
).setAction(async (taskArgs, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
});

// Delete this line
//module.exports = {};
```

Now, run `yarn hardat run scripts/deploy.ts --network hardhat` to test if the deployment works.

## Typechain

To convert the `.js` test to a `.ts` test, we have to use an hardhat plugin named "Typechain".
To install it, we have to run this command, but we already install this package.

```bash
yarn add --dev @typechain/hardhat @typechain/ethers-v5
```

Import the package in `hardhat.config.ts` :

```ts
import "@typechain/hardhat";
```

This plugin permit us to create a `Contract` type for our contract.
Run : `yarn hardhat typechain`

Add in the `.gitignore` :

```txt
typechain
typechain-types
```

In our `test-deploy.ts`, import the types we just created :

```ts
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";
```

Add to the variables their types :

```ts
describe("SimpleStorage", function () {
    let simpleStorageFactory: SimpleStorage__factory; // Here
    let simpleStorage: SimpleStorage;  // Here

    beforeEach(async function () {
        simpleStorageFactory = (await ethers.getContractFactory("SimpleStorage")) as SimpleStorage__factory; // Here
        simpleStorage = await simpleStorageFactory.deploy();

    });
```
