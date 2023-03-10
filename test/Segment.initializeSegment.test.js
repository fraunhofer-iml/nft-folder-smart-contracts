/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { constants, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Segment = artifacts.require("Segment");

contract("Segment", function (accounts) {
  const [ALICE] = accounts;
  const VALID_SEGMENT_NAME = "MySegment";
  const VALID_CONTAINER_ADDRESS = "0x0000000000000000000000000000000000000001";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;

  describe("Initialize Segment", () => {
    beforeEach(async () => {
      this.segment = await Segment.new(ALICE, VALID_SEGMENT_NAME, VALID_CONTAINER_ADDRESS);
    });

    it("should get owner", async () => {
      const actualOwner = await this.segment.owner();
      expect(actualOwner).equals(ALICE);
    });

    it("should get name", async () => {
      const actualName = await this.segment.getName();
      expect(actualName).equals("MySegment");
    });

    it("should get containerContract", async () => {
      const actualContainerContract = await this.segment.getContainerContract();
      expect(actualContainerContract).equals(VALID_CONTAINER_ADDRESS);
    });
  });

  describe("Don't Initialize Segment", () => {
    it("should require a valid owner address", async () => {
      await expectRevert(
        Segment.new(INVALID_ADDRESS, VALID_SEGMENT_NAME, VALID_CONTAINER_ADDRESS),
        "Segment: owner is zero address"
      );
    });

    it("should require a valid name string", async () => {
      await expectRevert(Segment.new(ALICE, "", VALID_CONTAINER_ADDRESS), "Segment: name is empty");
    });

    it("should require a valid container address", async () => {
      await expectRevert(
        Segment.new(ALICE, VALID_SEGMENT_NAME, INVALID_ADDRESS),
        "Segment: containerContract is zero address"
      );
    });
  });
});
