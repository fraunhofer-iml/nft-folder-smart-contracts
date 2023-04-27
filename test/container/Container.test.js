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
  const [ALICE, BOB] = accounts;
  const VALID_CONTAINER_NAME = "MyContainer";

  async function addSegmentAndAssertValues(container, segmentName, numberOfSegments) {
    const receipt = await container.createSegment(segmentName);
    const index = (Number(numberOfSegments) - 1).toString();

    const actualNumberOfSegments = await container.getNumberOfSegments();
    expect(actualNumberOfSegments).to.be.bignumber.equal(numberOfSegments);

    const segmentAddress = await container.getSegment(index);
    const segmentInContainer = await container.isSegmentInContainer(segmentAddress);
    expect(segmentInContainer).to.be.true;

    expectEvent(receipt, "SegmentAdded", {
      from: ALICE,
      segmentAddress: segmentAddress,
    });

    const segmentContract = await Segment.at(segmentAddress);

    expect(await segmentContract.owner()).to.be.equal(ALICE);

    const nameOfSegment = await segmentContract.getName();
    expect(nameOfSegment).to.be.equal(segmentName);

    const containerAddress = await segmentContract.getContainer();
    expect(containerAddress).to.be.equal(container.address);
  }

  describe("is Ownable", function () {
    context("Deployer is Owner", function () {
      beforeEach(async () => {
        this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      });

      it("should have a owner", async () => {
        const owner = await this.containerContract.owner();
        expect(owner).to.be.not.null;
        expect(owner).to.be.equal(ALICE);
      });
    });

    context("Deployer is not Owner", function () {
      beforeEach(async () => {
        this.containerContract = await Container.new(BOB, VALID_CONTAINER_NAME);
      });

      it("should not allow execution of onlyOwner function", async () => {
        await expectRevert(this.containerContract.createSegment("Test"), "Ownable: caller is not the owner.");
      });
    });
  });

  describe("createSegment", function () {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
    });

    it("should create and add new segment", async () => {
      await addSegmentAndAssertValues.call(this, this.containerContract, "Segment", "1");
    });

    it("should create and add multiple segments", async () => {
      await addSegmentAndAssertValues.call(this, this.containerContract, "Segment1", "1");
      await addSegmentAndAssertValues.call(this, this.containerContract, "Segment2", "2");
      await addSegmentAndAssertValues.call(this, this.containerContract, "Segment3", "3");
    });
  });

  describe("getName", function () {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
    });

    it("should return myContainer", async () => {
      const name = await this.containerContract.getName();
      expect(name).equals(VALID_CONTAINER_NAME);
    });
  });

  describe("getSegment", function () {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
    });

    it("should reject with 0 segments", async () => {
      await expectRevert(this.containerContract.getSegment(0), "Container: no segments stored in container");
    });

    it("should reject with invalid index", async () => {
      await this.containerContract.createSegment("Segment");
      await expectRevert(this.containerContract.getSegment(1), "Container: index is too big");
    });
  });

  describe("getNumberOfSegments", function () {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
    });

    it("should return 0 for empty segment", async () => {
      const numberOfSegments = await this.containerContract.getNumberOfSegments();
      expect(numberOfSegments).to.be.bignumber.equal("0");
    });
  });

  describe("isSegmentInContainer", function () {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
    });

    it("should return false for wrong address", async () => {
      await this.containerContract.createSegment("Segment");

      const segmentInContainer = await this.containerContract.isSegmentInContainer(ALICE);
      expect(segmentInContainer).to.be.false;
    });
  });
});
