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
  const VALID_SEGMENT_NAME = "MySegment";
  let VALID_CONTAINER_ADDRESS;

  describe("Initialize Segment", () => {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
      VALID_CONTAINER_ADDRESS = this.container.address;
      await this.container.createSegment(VALID_SEGMENT_NAME);
      this.segment = await Segment.at(await this.container.getSegmentAtIndex(0));
    });

    it("should get owner", async () => {
      const actualOwner = await this.segment.owner();
      expect(actualOwner).equals(ALICE);
    });

    it("should get name", async () => {
      const actualName = await this.segment.getName();
      expect(actualName).equals("MySegment");
    });

    it("should get container", async () => {
      const actualContainer = await this.segment.getContainer();
      expect(actualContainer).equals(VALID_CONTAINER_ADDRESS);
    });
  });

  describe("Don't Initialize Segment", () => {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
      VALID_CONTAINER_ADDRESS = this.container.address;
      await this.container.createSegment(VALID_SEGMENT_NAME);
      this.segment = await Segment.at(await this.container.getSegmentAtIndex(0));
    });

    it("should require a valid name string", async () => {
      await expectRevert(this.container.createSegment(""), "Container: name is empty");
    });
  });
});
