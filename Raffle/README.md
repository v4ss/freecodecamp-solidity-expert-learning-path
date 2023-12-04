# The Raffle Project

## Hardhat Setup

```bash
yarn add --dev hardhat

yarn hardhat init #And select "Create an empty hardhat.config.js
```

Install all the depedencies we need and add these in `hardhat.config.js` :

```bash
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers

#Typescript version :
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv @typechain/ethers-v5 @typechain/hardhat @types/chai @types/node ts-node typechain typescript @nomicfoundation/hardhat-toolbox
```

```js
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-ethers");
require("hardhat-contract-sizer");
require("dotenv").config();
```

Create the `.prettierrc` :

```json
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": false,
    "printWidth": 100
}
```

## Raffle.sol Setup

Create a new folder `contracts` who stored all our contracts, including `Raffle.sol`.

```js
// Raffle

// We want to :
// Enter the lottery (paying some amount)
// Pick a random Winner (verifiable random)
// Winner to be selected every X minutes -> completly automated

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Raffle {}
```

To be sure, try to compile : `yarn hardhat compile`

Now you can develop your smart contract.

## Chainlink VRFv2

In the solidity file, import the contracts :

```js
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
```

Install the packages : `yarn add --dev @chainlink/contracts`

`Raffle` inherits the `VRF` contract and add the VRF constructor.

```sol
// Raffle

// We want to :
// Enter the lottery (paying some amount)
// Pick a random Winner (verifiable random)
// Winner to be selected every X minutes -> completly automated

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2 {
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;

    /* Events */
    event RaffleEnter(address indexed player);

    constructor(address vrfCoordinatorV2, uint256 entranceFee) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) revert Raffle__NotEnoughETHEntered();
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function requestRandomWinner() external {}

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {}

    /* View / Pure functions */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}

```
