/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Segment = artifacts.require("Segment");
const Container = artifacts.require("Container");

contract("Segment", function (accounts) {
  const [ALICE] = accounts;
  const VALID_CONTAINER_NAME = "MyContainer";
  const VALID_SEGMENT_NAME = "MySegment";
  let VALID_CONTAINER_ADDRESS;

  describe("Initialize Segment", () => {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      VALID_CONTAINER_ADDRESS = this.containerContract.address;
      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      this.segmentContract = await Segment.at(await this.containerContract.getSegment(0));
    });

    it("should get owner", async () => {
      const actualOwner = await this.segmentContract.owner();
      expect(actualOwner).equals(ALICE);
    });

    it("should get container", async () => {
      const actualContainer = await this.segmentContract.getContainer();
      expect(actualContainer).equals(VALID_CONTAINER_ADDRESS);
    });

    it("should get name", async () => {
      const actualName = await this.segmentContract.getName();
      expect(actualName).equals(VALID_SEGMENT_NAME);
    });

    it("should get all token information", async () => {
      const actualAllTokenInformation = await this.segmentContract.getAllTokenInformation();
      expect(actualAllTokenInformation.length).to.be.equal(0);
    });

    it("should revert tokenInformation", async () => {
      await expectRevert(this.segmentContract.getTokenInformation("0"), "Segment: index is too large");
    });

    it("should get number of tokenInformation", async () => {
      const actualNumberOfTokenInformation = await this.segmentContract.getNumberOfTokenInformation();
      expect(actualNumberOfTokenInformation).to.be.bignumber.equal("0");
    });

    it("should not have token in segment", async () => {
      const actualTokenInSegment = await this.segmentContract.isTokenInSegment(VALID_CONTAINER_ADDRESS, "0");
      expect(actualTokenInSegment).is.false;
    });
  });

  describe("Don't Initialize Segment", () => {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      VALID_CONTAINER_ADDRESS = this.containerContract.address;
      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      this.segmentContract = await Segment.at(await this.containerContract.getSegment(0));
    });

    it("should require a valid name string", async () => {
      await expectRevert(this.containerContract.createSegment(""), "Container: name is empty");
    });
  });
});
