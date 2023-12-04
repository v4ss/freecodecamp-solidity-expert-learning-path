# Full Stack Web3 Project

## HTML Setup

Create a folder for your project and create a new file `index.html`.
Install the VSCode extension `Live-server` to host your website.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fund Me App</title>
    </head>
    <body>
        My Fund Me Application Front-End !
    </body>
</html>
```

### Connecting HTML to Metamask

To execute Javascript on your website, you have to use `<script>` tag.
When Metamask is installed in a browser, the javascript object `window.ethereum` exists. We are goin to use it to know if the user have a Metamask, so :

```html
<script>
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a Metamask");
    } else {
        console.log("No Metamask!");
    }
</script>
```

Go create a function to look if we have a Metamask and connect an account if yes. Then create a button to execute the function :

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fund Me App</title>
    </head>
    <body>
        My Fund Me Application Front-End !
        <script>
            async function connect() {
                if (typeof window.ethereum !== "undefined") {
                    await window.ethereum.request({
                        method: "eth_requestAccounts",
                    });
                    document.getElementById("connectButton").innerHTML =
                        "Connected!";
                } else {
                    document.getElementById("connectButton").innerHTML =
                        "Please install Metamask";
                }
            }
        </script>

        <button id="connectButton" onclick="connect()">Connect</button>
    </body>
</html>
```

A best practice is to create an `index.js` file and import our script in the HTML.
Replace the `<script>` tag by :

```html
<script src="./index.js" type="text/javascript"></script>
```

### Prettier

```bash
yarn add --dev prettier
```

Create a .prettierrc

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": false
}
```

### Ethers in Front-End

To add and use `ethers` in our app, we have to import it in `index.js` :

```js
import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

// OR create a new file and paste it all the code :
import { ethers } from "./ethers-6.0.esm.min.js";
```

You also have to pass the type of the `<script>` tag to "module" :

```html
<script src="./index.js" type="module"></script>
```

#### onclick attribute

Remove the `onclick=""` attribute to the button in html to add it in the index.js :

```js
import { ethers } from "./ethers-6.0.esm.min.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
```

#### fund() function

Create a `constants.js` file contains the `abi` and `contractAddress` of our contract.
Get the `abi` in the `hardhat-fund-me` project at : `hardhat-fund-me/artefacts/contracts/FundMe.sol/FundMe.json`.
For the `contractAddress`, you can run :

```bash
yarn hardhat node
```

To run in a local node and take the contract address.

Write it in the `constants.js` :

```js
export const contractAddress = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
export const abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "priceFeed",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    // ...
    // ...
    // ...
    {
        inputs: [],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
```

Create now the `fund()` function in the `index.js` : (For the moment we have a write in hard the value of `ethAmount` but after, it will be a parameter)

```js
async function fund() {
    const ethAmount = "1";
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const transactionResponse = await contract.fund({
            value: ethers.parseEther(ethAmount),
        });
    }
}
```

##### Add the local node on Metamask

Add a network on metamask with the RPC URL display on the terminal when run `yarn hardhat node`.
ChainId is : 31337

Now, add a fake account to metamask with its private key
