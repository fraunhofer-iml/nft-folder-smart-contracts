/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

require("@openzeppelin/test-helpers");

const { expect } = require("chai");
require("chai").use(require("chai-as-promised")).should();

const Container = artifacts.require("Container");
const Segment = artifacts.require("Segment");

contract("Container", function (accounts) {
  describe("is Ownable", function () {
    context("Deployer is Owner", function () {
      beforeEach(async () => {
        this.container = await Container.new(accounts[0], "myContainer");
      });

      it("should have a owner", async () => {
        const owner = await this.container.owner();
        expect(owner).to.be.not.null;
        expect(owner).to.be.equal(accounts[0]);
      });
    });
    context("Deployer is not Owner", function () {
      beforeEach(async () => {
        this.container = await Container.new(accounts[1], "myContainer");
      });

      it("should not allow execution of onlyOwner function", async () => {
        await this.container.addNewSegment("Test").should.be.rejectedWith("Ownable: caller is not the owner.");

        this.segment = await Segment.new(accounts[0], "mySegment", this.container.address);
        await this.container
          .addSegment(this.segment.address)
          .should.be.rejectedWith("Ownable: caller is not the owner.");
      });
    });
  });

  describe("getName", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should return myContainer", async () => {
      const name = await this.container.getName();
      expect(name).equals("myContainer");
    });
  });

  describe("getSegmentAtIndex", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should reject with 0 segments", async () => {
      await this.container.getSegmentAtIndex(0).should.be.rejectedWith("Container: no segments stored in container");
    });

    it("should reject with 1 segment", async () => {
      await this.container.addNewSegment("Segment");
      await this.container.getSegmentAtIndex(1).should.be.rejectedWith("Container: index is too big");
    });
  });

  describe("getSegmentCount", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should return 0 for empty segment", async () => {
      const segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("0");
    });
  });

  describe("isSegmentInContainer", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should return false for wrong address", async () => {
      await this.container.addNewSegment("Segment");

      const segmentInContainer = await this.container.isSegmentInContainer(accounts[0]);
      expect(segmentInContainer).to.be.false;
    });
  });

  describe("addNewSegment", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should create and add new segment", async () => {
      await this.container.addNewSegment("Segment");

      const segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("1");

      const segmentAddress = await this.container.getSegmentAtIndex(0);

      const segmentInContainer = await this.container.isSegmentInContainer(segmentAddress);
      expect(segmentInContainer).to.be.true;

      const segment = await Segment.at(segmentAddress);

      const segmentName = await segment.getName();
      expect(segmentName).to.be.equal("Segment");

      const segmentContainer = await segment.getContainer();
      expect(segmentContainer).to.be.equal(this.container.address);
    });

    it("should create and add two segments", async () => {
      await this.container.addNewSegment("Segment1");
      await this.container.addNewSegment("Segment2");

      const segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("2");

      // Segment 1
      const segmentAddress1 = await this.container.getSegmentAtIndex(0);

      const segment1InContainer = await this.container.isSegmentInContainer(segmentAddress1);
      expect(segment1InContainer).to.be.true;

      const segment1 = await Segment.at(segmentAddress1);

      const segmentName1 = await segment1.getName();
      expect(segmentName1).to.be.equal("Segment1");

      const segment1Container = await segment1.getContainer();
      expect(segment1Container).to.be.equal(this.container.address);

      // Segment 2
      const segmentAddress2 = await this.container.getSegmentAtIndex(1);

      const segment2InContainer = await this.container.isSegmentInContainer(segmentAddress2);
      expect(segment2InContainer).to.be.true;

      const segment2 = await Segment.at(segmentAddress2);

      const segmentName2 = await segment2.getName();
      expect(segmentName2).to.be.equal("Segment2");

      const segment2Container = await segment1.getContainer();
      expect(segment2Container).to.be.equal(this.container.address);
    });

    it("should emit event on new segment", async () => {
      await this.container.addNewSegment("Segment");

      const pastEvents = await this.container.getPastEvents("SegmentAdded");
      expect(pastEvents.length).to.be.equal(1);
    });
  });

  describe("addSegment", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should add existing segment", async () => {
      this.segment = await Segment.new(accounts[0], "mySegment", this.container.address);
      await this.container.addSegment(this.segment.address);

      const segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("1");

      const segmentInContainer = await this.container.isSegmentInContainer(this.segment.address);
      expect(segmentInContainer).to.be.true;

      const segmentAddress = await this.container.getSegmentAtIndex(0);
      const segment = await Segment.at(segmentAddress);

      const segmentName = await segment.getName();
      expect(segmentName).to.be.equal("mySegment");

      const segmentContainer = await segment.getContainer();
      expect(segmentContainer).to.be.equal(this.container.address);
    });

    it("should emit event on adding existing segment", async () => {
      this.segment = await Segment.new(accounts[0], "mySegment", this.container.address);
      await this.container.addSegment(this.segment.address);

      const events = await this.container.getPastEvents("SegmentAdded");
      expect(events.length).to.be.equal(1);
    });
  });

  describe("removeSegmentAtIndex", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should remove added Segment", async () => {
      await this.container.addNewSegment("Segment");
      const segmentAddress = await this.container.getSegmentAtIndex(0);

      const segment = await Segment.at(segmentAddress);

      await this.container.removeSegmentAtIndex(0);

      const segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("0");

      const segmentInContainer = await this.container.isSegmentInContainer(segmentAddress);
      expect(segmentInContainer).to.be.false;

      const segmentContainer = await segment.getContainer();
      expect(segmentContainer).to.be.equal(this.container.address); // TODO-MP: should be false, see Container.sol
    });

    it("should remove correct Segment from two Segments", async () => {
      await this.container.addNewSegment("Segment1");
      await this.container.addNewSegment("Segment2");
      const segment1Address = await this.container.getSegmentAtIndex(0);
      const segment2Address = await this.container.getSegmentAtIndex(1);

      let segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("2");

      // Remove first segment
      await this.container.removeSegmentAtIndex(0);

      segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("1");

      const segment1InContainer = await this.container.isSegmentInContainer(segment1Address);
      expect(segment1InContainer).to.be.false;

      const segment2InContainer = await this.container.isSegmentInContainer(segment2Address);
      expect(segment2InContainer).to.be.true;

      const segmentAddressAtIndex0 = await this.container.getSegmentAtIndex(0);
      expect(segmentAddressAtIndex0).to.be.equal(segment2Address);

      // Remove second segment
      await this.container.removeSegmentAtIndex(0);

      segmentCount = await this.container.getSegmentCount();
      expect(segmentCount).to.be.bignumber.equal("0");

      const formerSegment2InContainer = await this.container.isSegmentInContainer(segment2Address);
      expect(formerSegment2InContainer).to.be.false;

      await this.container.getSegmentAtIndex(0).should.be.rejectedWith("Container: no segments stored in container");
    });

    it("should be rejected for invald index", async () => {
      await this.container.addNewSegment("Segment");
      await this.container.removeSegmentAtIndex(1).should.be.rejectedWith("Container: Invalid index to remove segment");
    });

    it("should emit event on remove segment", async () => {
      await this.container.addNewSegment("Segment");
      await this.container.removeSegmentAtIndex(0);

      const pastEvents = await this.container.getPastEvents("SegmentRemoved");
      expect(pastEvents.length).to.be.equal(1);
    });
  });
});
