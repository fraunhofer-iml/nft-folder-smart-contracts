/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const {expect} = require("chai");
const {BN, expectEvent, expectRevert} = require("@openzeppelin/test-helpers");

const Counter = artifacts.require("Counter");

describe("Counter", () => {
  beforeEach(async () => {
    this.contract = await Counter.new();
  });

  it("should be 0", async () => {
    const actualResult = await this.contract.current();
    const expectedResult = new BN(0);
    expect(actualResult).to.be.bignumber.equal(expectedResult);
  });

  it("should be 1 after one increment", async () => {
    await this.contract.increment();

    const actualResult = await this.contract.current();
    const expectedResult = new BN(1);
    expect(actualResult).to.be.bignumber.equal(expectedResult);
  });

  it("should be 2 after two increments", async () => {
    await this.contract.increment();
    await this.contract.increment();

    const actualResult = await this.contract.current();
    const expectedResult = new BN(2);
    expect(actualResult).to.be.bignumber.equal(expectedResult);
  });

  it("should be 1 after two increments and one decrement", async () => {
    await this.contract.increment();
    await this.contract.increment();
    await this.contract.decrement();

    const actualResult = await this.contract.current();
    const expectedResult = new BN(1);
    expect(actualResult).to.be.bignumber.equal(expectedResult);
  });

  it("should emit AfterIncrement", async () => {
    const receipt = await this.contract.increment();

    expectEvent(receipt, "AfterIncrement", {
      value: new BN(1),
    });
  });

  it("should emit AfterDecrement", async () => {
    await this.contract.increment();
    const receipt = await this.contract.decrement();

    expectEvent(receipt, "AfterDecrement", {
      value: new BN(0),
    });
  });

  it("should revert after one decrement", async () => {
    await expectRevert(this.contract.decrement(), "Cannot decrement: counter is already 0");
  });
});
