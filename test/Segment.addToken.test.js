/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { constants, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Segment = artifacts.require("Segment");

contract("Segment", function (accounts) {
  const [ALICE] = accounts;
  const VALID_SEGMENT_NAME = "MySegment";
  const VALID_CONTAINER_ADDRESS = "0x0000000000000000000000000000000000000001";
  const VALID_TOKEN_ADDRESS_1 = "0x0000000000000000000000000000000000000011";
  const VALID_TOKEN_ADDRESS_2 = "0x0000000000000000000000000000000000000012";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;

  async function addTokenAndAssertValues(tokenContract, tokenId, tokenInformationIndex) {
    const receipt = await this.segment.addToken(tokenContract, tokenId);
    expectEvent(receipt, "TokenAdded", {
      from: ALICE,
      tokenContract: tokenContract,
      tokenId: tokenId,
    });

    const actualTokenInformation = await this.segment.getTokenInformation(tokenInformationIndex);
    expect(actualTokenInformation.tokenContract).equals(tokenContract);
    expect(actualTokenInformation.tokenId).equals(tokenId);

    const actualTokenLocationInSegment = await this.segment.getTokenLocationInSegment(tokenContract, tokenId);
    expect(actualTokenLocationInSegment.present).is.true;
    expect(actualTokenLocationInSegment.tokenInformationIndex).equals(tokenInformationIndex);

    const actualTokenInSegment = await this.segment.isTokenInSegment(tokenContract, tokenId);
    expect(actualTokenInSegment).is.true;
  }

  describe("Add Token", () => {
    beforeEach(async () => {
      this.segment = await Segment.new(ALICE, VALID_SEGMENT_NAME, VALID_CONTAINER_ADDRESS);
    });

    it("should add 1 token", async () => {
      await addTokenAndAssertValues.call(this, VALID_TOKEN_ADDRESS_1, "0", "0");
    });

    it("should add 2 tokens from same token address", async () => {
      await addTokenAndAssertValues.call(this, VALID_TOKEN_ADDRESS_1, "0", "0");
      await addTokenAndAssertValues.call(this, VALID_TOKEN_ADDRESS_1, "10", "1");
    });

    it("should add 3 tokens from different token addresses", async () => {
      await addTokenAndAssertValues.call(this, VALID_TOKEN_ADDRESS_1, "37", "0");
      await addTokenAndAssertValues.call(this, VALID_TOKEN_ADDRESS_2, "3", "1");
      await addTokenAndAssertValues.call(this, VALID_TOKEN_ADDRESS_1, "1", "2");
    });
  });

  describe("Don't Add Token", () => {
    beforeEach(async () => {
      this.segment = await Segment.new(ALICE, VALID_SEGMENT_NAME, VALID_CONTAINER_ADDRESS);
    });

    it("should require a valid contract address", async () => {
      await expectRevert(this.segment.addToken(INVALID_ADDRESS, "0"), "Segment: tokenContract is zero address");
    });

    it("should require an absent token", async () => {
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await expectRevert(
        this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0"),
        "Segment: tokenContract and tokenId already exist in segment"
      );
    });
  });
});
