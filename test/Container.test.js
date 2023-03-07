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
const TestSegment = artifacts.require("TestSegment");

contract("Container", function (accounts) {
  describe("is Ownable", function () {
    context("Deployer is Owner", function () {
      beforeEach(async () => {
        this.container = await Container.new(accounts[0], "myContainer");
      });

      it("should have a owner", async () => {
        const owner = await this.container.owner();
        console.log(owner);
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

        this.segment = await TestSegment.new("mySegment");
        await this.container
          .addSegment(this.segment.address)
          .should.be.rejectedWith("Ownable: caller is not the owner.");
      });
    });
  });

  describe("getSegmentCount", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should return 0 for empty segment", async () => {
      const count = await this.container.getSegmentCount();
      console.log("Count: " + count);
      expect(count).to.be.bignumber.equal("0");
    });
  });

  describe("isSegmentInContainer", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should return false for wrong address", async () => {
      await this.container.addNewSegment("Segment");

      const actual = await this.container.isSegmentInContainer(accounts[0]);
      expect(actual).to.be.false;
    });
  });

  describe("addNewSegment", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should create and add new segment", async () => {
      await this.container.addNewSegment("Segment");

      const count = await this.container.getSegmentCount();
      console.log("Count: " + count);
      expect(count).to.be.bignumber.equal("1");

      const segmentAddress = await this.container.getSegmentAtIndex(0);
      console.log("Address: " + segmentAddress);
      expect(await this.container.isSegmentInContainer(segmentAddress)).to.be.true;

      const segment = await TestSegment.at(segmentAddress);
      const segmentName = await segment.getName();
      console.log("Name: " + segmentName);
      expect(segmentName).to.be.equal("Segment");
    });

    it("should create and add multiple segments", async () => {
      await this.container.addNewSegment("Segment1");
      await this.container.addNewSegment("Segment2");

      const count = await this.container.getSegmentCount();
      console.log("Count: " + count);
      expect(count).to.be.bignumber.equal("2");

      const segmentAddress1 = await this.container.getSegmentAtIndex(0);
      console.log("Address: " + segmentAddress1);
      expect(await this.container.isSegmentInContainer(segmentAddress1)).to.be.true;

      const segment1 = await TestSegment.at(segmentAddress1);
      const segmentName1 = await segment1.getName();
      console.log("Name: " + segmentName1);
      expect(segmentName1).to.be.equal("Segment1");

      const segmentAddress2 = await this.container.getSegmentAtIndex(1);
      console.log("Address: " + segmentAddress2);
      expect(await this.container.isSegmentInContainer(segmentAddress2)).to.be.true;

      const segment2 = await TestSegment.at(segmentAddress2);
      const segmentName2 = await segment2.getName();
      console.log("Name: " + segmentName2);
      expect(segmentName2).to.be.equal("Segment2");
    });

    it("should emit event on new segment", async () => {
      await this.container.addNewSegment("Segment");

      const events = await this.container.getPastEvents("SegmentAdded");

      expect(events.length).to.be.equal(1);
    });
  });

  describe("addSegment", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should add existing segment", async () => {
      this.segment = await TestSegment.new("mySegment");
      await this.container.addSegment(this.segment.address);

      const count = await this.container.getSegmentCount();
      console.log("Count: " + count);
      expect(count).to.be.bignumber.equal("1");

      expect(await this.container.isSegmentInContainer(this.segment.address)).to.be.true;

      const segment = await TestSegment.at(await this.container.getSegmentAtIndex(0));
      const segmentName = await segment.getName();
      console.log("Name: " + segmentName);
      expect(segmentName).to.be.equal("mySegment");
    });

    it("should emit event on adding existing segment", async () => {
      this.segment = await TestSegment.new("mySegment");
      await this.container.addSegment(this.segment.address);

      const events = await this.container.getPastEvents("SegmentAdded");

      expect(events.length).to.be.equal(1);
    });
  });

  describe("removeSegment", function () {
    beforeEach(async () => {
      this.container = await Container.new(accounts[0], "myContainer");
    });

    it("should remove added Segment", async () => {
      await this.container.addNewSegment("Segment");
      const segmentAddress = await this.container.getSegmentAtIndex(0);

      await this.container.removeSegment(0);

      const count = await this.container.getSegmentCount();
      expect(count).to.be.bignumber.equal("0");

      expect(await this.container.isSegmentInContainer(segmentAddress)).to.be.false;
    });

    it("should remove correct Segment from multiple segments", async () => {
      await this.container.addNewSegment("Segment1");
      await this.container.addNewSegment("Segment2");
      const segment1Address = await this.container.getSegmentAtIndex(0);
      const segment2Address = await this.container.getSegmentAtIndex(1);

      await this.container.removeSegment(0);

      const count = await this.container.getSegmentCount();
      expect(count).to.be.bignumber.equal("1");

      expect(await this.container.isSegmentInContainer(segment1Address)).to.be.false;
      expect(await this.container.isSegmentInContainer(segment2Address)).to.be.true;
      expect(await this.container.getSegmentAtIndex(0)).to.be.equal(segment2Address);
    });

    it("should be rejected for invald index", async () => {
      await this.container.addNewSegment("Segment");
      await this.container.removeSegment(1).should.be.rejectedWith("Container: Invalid index to remove segment");
    });

    it("should emit event on remove segment", async () => {
      await this.container.addNewSegment("Segment");
      await this.container.removeSegment(0);

      const events = await this.container.getPastEvents("SegmentRemoved");
      expect(events.length).to.be.equal(1);
    });
  });
});
