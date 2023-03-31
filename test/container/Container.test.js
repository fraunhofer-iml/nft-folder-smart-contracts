/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Container = artifacts.require("Container");
const Segment = artifacts.require("Segment");

contract("Container", function (accounts) {
  const [ALICE] = accounts;

  async function addSegmentAndAssertValues(container, segmentName, countSegments) {
    const receipt = await container.createSegment(segmentName);
    const index = (Number(countSegments) - 1).toString();

    const segmentCount = await container.getSegmentCount();
    expect(segmentCount).to.be.bignumber.equal(countSegments);

    const segmentAddress = await container.getSegmentAtIndex(index);
    const segmentInContainer = await container.isSegmentInContainer(segmentAddress);
    expect(segmentInContainer).to.be.true;

    expectEvent(receipt, "SegmentAdded", {
      from: ALICE,
      segment: segmentAddress,
      index: index,
    });

    const segment = await Segment.at(segmentAddress);

    expect(await segment.owner()).to.be.equal(ALICE);

    const nameOfSegment = await segment.getName();
    expect(nameOfSegment).to.be.equal(segmentName);

    const segmentContainer = await segment.getContainer();
    expect(segmentContainer).to.be.equal(container.address);
  }

  describe("is Ownable", function () {
    context("Deployer is Owner", function () {
      beforeEach(async () => {
        this.container = await Container.new(ALICE, "myContainer");
      });

      it("should have a owner", async () => {
        const owner = await this.container.owner();
        expect(owner).to.be.not.null;
        expect(owner).to.be.equal(ALICE);
      });
    });
    context("Deployer is not Owner", function () {
      beforeEach(async () => {
        this.container = await Container.new(accounts[1], "myContainer");
      });

      it("should not allow execution of onlyOwner function", async () => {
        await expectRevert(this.container.createSegment("Test"), "Ownable: caller is not the owner.");
      });
    });
  });

  describe("getName", function () {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
    });

    it("should return myContainer", async () => {
      const name = await this.container.getName();
      expect(name).equals("myContainer");
    });
  });

  describe("getSegmentAtIndex", function () {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
    });

    it("should reject with 0 segments", async () => {
      await expectRevert(this.container.getSegmentAtIndex(0), "Container: no segments stored in container");
    });

    it("should reject with invalid index", async () => {
      await this.container.createSegment("Segment");
      await expectRevert(this.container.getSegmentAtIndex(1), "Container: index is too big");
    });
  });

  describe("getSegmentCount", function () {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
    });

    it("should return 0 for empty segment", async () => {
      const segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("0");
    });
  });

  describe("isSegmentInContainer", function () {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
    });

    it("should return false for wrong address", async () => {
      await this.container.createSegment("Segment");

      const segmentInContainer = await this.container.isSegmentInContainer(accounts[0]);
      expect(segmentInContainer).to.be.false;
    });
  });

  describe("createSegment", function () {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
    });

    it("should create and add new segment", async () => {
      await addSegmentAndAssertValues.call(this, this.container, "Segment", "1");
    });

    it("should create and add multiple segments", async () => {
      await addSegmentAndAssertValues.call(this, this.container, "Segment1", "1");
      await addSegmentAndAssertValues.call(this, this.container, "Segment2", "2");
      await addSegmentAndAssertValues.call(this, this.container, "Segment3", "3");
    });
  });
});
