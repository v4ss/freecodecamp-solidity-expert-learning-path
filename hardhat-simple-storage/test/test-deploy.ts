import { ethers } from "hardhat";
import { expect, assert } from "chai";
import { SimpleStorage, SimpleStorage__factory } from "../typechain-types";

describe("SimpleStorage", function () {
    let simpleStorageFactory: SimpleStorage__factory;
    let simpleStorage: SimpleStorage;

    beforeEach(async function () {
        simpleStorageFactory = (await ethers.getContractFactory("SimpleStorage")) as unknown as SimpleStorage__factory;
        simpleStorage = await simpleStorageFactory.deploy();
    });

    it("Should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = "0";

        // Two methods
        // assert
        // expect
        assert.equal(currentValue.toString(), expectedValue);
        //expect(currentValue.toString()).to.equal(expectedValue);
    });

    it("Should update the favorite number when we call store", async function () {
        const expectedValue = "7";
        const transactionResponse = await simpleStorage.store(expectedValue);
        await transactionResponse.wait(1);
        const updatedValue = await simpleStorage.retrieve();

        assert.equal(updatedValue.toString(), expectedValue);
    });
});
