const { developmentChains } = require("../../helper-hardhat-config");
const { network, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", function () {
          let deployer, raffle, raffleEntranceFee;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              raffle = await ethers.getContract("Raffle", deployer);
              raffleEntranceFee = await raffle.getEntranceFee();
          });

          describe("fulfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
                  // enter the raffle
                  console.log("Setting up test...");
                  const startingTimeStamp = await raffle.getLatestTimeStamp();
                  const accounts = await ethers.getSigners();

                  // Setup the listener event before call enterRaffle(), to catch it
                  console.log("Setting up listener...");
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!");
                          try {
                              // add our asserts here
                              const recentWinner = await raffle.getRecentWinner();
                              const raffleState = await raffle.getRaffleState();
                              const winnerEndingBalance = await ethers.provider.getBalance(
                                  accounts[0].address,
                              );
                              const endingTimeStamp = await raffle.getLatestTimeStamp();

                              // Expect the players array resets
                              await expect(raffle.getPlayer(0)).to.be.reverted;
                              assert.equal(recentWinner, accounts[0].address);
                              assert.equal(raffleState, 0);
                              assert.equal(
                                  Number(winnerEndingBalance),
                                  Number(winnerStartingBalance + raffleEntranceFee),
                              );
                              assert(endingTimeStamp > startingTimeStamp);
                              resolve();
                          } catch (error) {
                              console.log(error);
                              reject(error);
                          }
                      });
                      // Then entering the raffle
                      console.log("Entering Raffle...");
                      const transactionResponse = await raffle.enterRaffle({
                          value: raffleEntranceFee,
                      });
                      await transactionResponse.wait(1);
                      const winnerStartingBalance = await ethers.provider.getBalance(
                          accounts[0].address,
                      );

                      // and this code won't complete until our listener has finished listening!
                  });
              });
          });
      });
