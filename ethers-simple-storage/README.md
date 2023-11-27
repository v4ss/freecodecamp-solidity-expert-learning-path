---
Vidéo: 7.07.17
---

# Install the IDE

## Prettier and Auto-formatter

-   Download the "Solidity + Hardhat" and "Prettier - Code formatter" extension in VSCode to have a prettier view in your code.
-   Press `"Ctrl + Shift + P"` and write `"settings"`
    -   Open the `"Preferences: Open User Settings (JSON)"`
    -   Add this code at the following :

```json
"solidity.telemetry": true,
"[solidity]": {
	"editor.defaultFormatter": "NomicFoundation.hardhat-solidity"
},
"[javascript]":{
	"editor.defaultFormatter": "esbenp.prettier-vscode"
},
"editor.formatOnSave": true
```

Install `prettier` and `prettier-plugin-solidity` packages

```bash
yarn add prettier prettier-plugin-solidity
```

## NodeJS

You have to install NodeJS.
After this, go to your project folder and execute the following commands :

```bash
npm i -g corepack #To install corepack
corepack enable #To enable the use of yarn

yarn --version #To verify if yarn is OK !
```

```bash
yarn add solc #Install the compiler solc
#OR
yarn add solc@0.8.7-fixed #To install with the version of the compiler you want
```

## Dependencies

For solidity development, we are going to use `ethers` package. For install it, write this command :

```bash
yarn add ethers@5.7.2 #In October 2023, the lastest version don't work correctly. So I use the 5.7.2 version
```

And fo read file in Javascript, we are going to use `fs-extra` :

```bash
yarn add fs-extra
```

## Ganache

Ganache is a fake local Blockchain that you can install on your computer. It also generate fake wallet account with a balance of fake ETH. It's the same thing when you use Remix but with ganache, it's local.

You will have a local RPC URL, Network ID, etc .. like a real Blockchain network.

---

# Create a project

## Compile the Smart Contract

To compile our smart contract, we have to use the `solcjs` module, that we install before.
The command to do that is :

```bash
yarn solcjs --bin --abi --include-path node_modules/ --base-path . -o . CONTRACT_FILE.sol
```

This create an ABI and Binary files.

To simplify the compile command, go to the `package.json` file and add the `scripts` section.

```json
{
    "dependencies": {
        "solc": "0.8.7-fixed"
    },
    "scripts": {
        "compile": "yarn solcjs --bin --abi --include-path node_modules --base-path . -o . SimpleStorage.sol"
    }
}
```

Now you have just to write `yarn compile` and this big command will be execute.

## deploy.js file

`deploy.js` is the file who permit you to deploy your smart contract in a Blockchain.

### ContractFactory

Create it and paste this code :

```js
const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
    // compile them in our code
    // http://127.0.0.1:7545
    const provider = new ethers.providers.JsonRpcProvider(
        "http://127.0.0.1:7545", // It's the RPC URL of the Blockchain you want to deploy the contract. Here is my Ganache RPC URL (local)
    );
    const wallet = new ethers.Wallet(
        // Enter here the private key of the wallet who deploy the contract
        "0x34971509584aae01eea72f62a7010c160f81d9a179616e8ac5c9f91fb7816e39",
        provider,
    );

    // The ABI and binary files of the compiled contract
    const abi = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.abi",
        "utf-8",
    );
    const binary = fs.readFileSync(
        "./SimpleStorage_sol_SimpleStorage.bin",
        "utf-8",
    );

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

    console.log("Deploying, please wait...");
    const contract = await contractFactory.deploy(); // STOP here! Wait for contract deployed
    const deploymentReceipt = await contract.deployTransaction.wait(1); // Wait the confirmation of the block is create
    console.log(deploymentReceipt);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

Now you can run the deploy command, to deploy your contract in the Blockchain.

```bash
node deploy.js
```

### Transaction Data

We can also deploy a contract with only transaction data. So in this case, we configure the transaction ourselves.

```js
const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
    // compile them in our code
    // http://127.0.0.1:7545
    const provider = new ethers.providers.JsonRpcProvider(
        "http://127.0.0.1:7545", // It's the RPC URL of the Blockchain you want to deploy the contract. Here is my Ganache RPC URL (local)
    );
    const wallet = new ethers.Wallet(
        // Enter here the private key of the wallet who deploy the contract
        "0x34971509584aae01eea72f62a7010c160f81d9a179616e8ac5c9f91fb7816e39",
        provider,
    );

    console.log("Deploying with only transaction data, please wait...");
    const nonce = await wallet.getTransactionCount();
    const tx = {
        nonce: nonce,
        gasPrice: 20000000000,
        gasLimit: 1000000,
        to: null, // It's a contract deployment, so, there's no "to"
        value: 0,
        data: "0x608060...08070033", // The binary file of the contract (get it after compile) format = "0x{BIN}"
        chainId: 1337, // The chainId of the Blockchain network (Here of the Ganache)
    };
    const sentTxResponse = await wallet.sendTransaction(tx);
    await sentTxResponse.wait(1); // Wait the validation of the Block
    console.log(sentTxResponse);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

With this way, we can create our transactions step by step. But is'nt the regular way. The ContractFactory method (just before) is the most common.

---

# Interact with a contract

In our Javascript file, we will be able to interact with the functions of the smart contract. The way to do this is simple :

```js
// Get number
const currentFavoriteNumber = await contract.retrieve();
console.log(currentFavoriteNumber.toString());
```

We create a variable to store the return of the `retrieve()` function. And display it in the console.

To change the state of the Blockchain and call a non-view function, it's the same thing :

```js
const transactionResponse = await contract.store("7"); // Send the transaction
const transactionReceipt = await transactionResponse.wait(1); // Wait for the block validation
const updatedFavoriteNumber = await contract.retrieve(); // Call the retrieve function to see the new favorite number
console.log(`Updated favorite number is: ${updatedFavoriteNumber}`);
```

---

# Setting up .env

First, we have to install the package

```bash
yarn add dotenv
```

Add the package at the top of our script.

```js
const ethers = require("ethers");
const fs = require("fs-extra");
// The new line :
require("dotenv").config();
```

Create a `.env` file in your project and store a `PRIVATE_KEY` and `RPC_URL` variables.

```
PRIVATE_KEY=0x34971509584aae01eea72f62a7010c160f81d9a179616e8ac5c9f91fb7816e39
RPC_URL=http://127.0.0.1:7545
```

Replace your private key and RPC URL in the code by the environment variables.

```js
const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  // compile them in our code
  // http://127.0.0.1:7545
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
 
  ...
}
```

---

# Better Private Key Management

## Without `.env` file

A way to secure our private key is to delete the `.env` file and when we call the command to execute the script, we write the variable in the command :

```bash
PRIVATE_KEY=0x34971509584aae01eea72f62a7010c160f81d9a179616e8ac5c9f91fb7816e39 RPC_URL=http://127.0.0.1:7545 node deploy.js #In one command!
```

## Encryption Key

Another way (the best) is to encrypt our private key. In this case, even if, we push accidently our `.env` file, nobody can read and exploit it.

Create a new script `encryptionKey.js` :

```js
const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const encryptedJsonKey = await wallet.encrypt(
        process.env.PRIVATE_KEY_PASSWORD,
        process.env.PRIVATE_KEY,
    );
    console.log(encryptedJsonKey);
    fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

Write in the `.env` file a new line for the password :

```bash
PRIVATE_KEY_PASSWORD=mypassword
```

Execute this script to generate the encrypted key.

```bash
node encryptKey.js
```

A new file was created : `.encryptedKey.json`

Modify the `deploy.js` script to take into account private key encryption :

```js
...

// Replace this line below
// const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
// By this 3 lines :
const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8"); // Get the encrypt key
let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD
);
wallet = await wallet.connect(provider); // Connect the wallet to the provider

...
```

Delete in the `.env` file the lines with the `PRIVATE_KEY` and `PRIVATE_KEY_PASSWORD` variables

Now, to execute the script, you have to run :

```bash
PRIVATE_KEY_PASSWORD=mypassword node deploy.js

history -c #To clear the command history (with the password in clear!)
```
