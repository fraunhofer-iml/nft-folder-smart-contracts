/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert, expectEvent, constants } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Segment = artifacts.require("Segment");

contract("Segment", function (accounts) {
  const [ALICE] = accounts;
  const VALID_SEGMENT_NAME = "MySegment";
  const VALID_CONTAINER_ADDRESS = "0x0000000000000000000000000000000000000001";
  const VALID_TOKEN_ADDRESS_1 = "0x0000000000000000000000000000000000000011";
  const VALID_TOKEN_ADDRESS_2 = "0x0000000000000000000000000000000000000012";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;

  async function removeTokenAndAssertRemoval(tokenInformation) {
    const receipt = await this.segment.removeToken(tokenInformation.token, tokenInformation.tokenId);

    expectEvent(receipt, "TokenRemoved", {
      from: ALICE,
      token: tokenInformation.token,
      tokenId: tokenInformation.tokenId,
    });

    await expectRevert(
      this.segment.getTokenLocationInSegment(tokenInformation.token, tokenInformation.tokenId),
      "Segment: token and tokenId do not exist in segment"
    );

    const actualRemovedTokenInSegment = await this.segment.isTokenInSegment(
      tokenInformation.token,
      tokenInformation.tokenId
    );
    expect(actualRemovedTokenInSegment).is.false;
  }

  async function removeTokenAndAssertRemovalWithExpectedInformation(
    tokenInformation,
    movedTokenInformationIndex,
    expectedMovedTokenInformation
  ) {
    await removeTokenAndAssertRemoval(tokenInformation);

    const actualMovedTokenInformation = await this.segment.getTokenInformation(movedTokenInformationIndex);
    expect(actualMovedTokenInformation.token).equals(expectedMovedTokenInformation.token);
    expect(actualMovedTokenInformation.tokenId).equals(expectedMovedTokenInformation.tokenId);

    const actualMovedTokenInSegment = await this.segment.isTokenInSegment(
      expectedMovedTokenInformation.token,
      expectedMovedTokenInformation.tokenId
    );
    expect(actualMovedTokenInSegment).is.true;
  }

  describe("Remove Token", () => {
    beforeEach(async () => {
      this.segment = await Segment.new(ALICE, VALID_SEGMENT_NAME, VALID_CONTAINER_ADDRESS);
    });

    it("should add 1 token and remove 1 token", async () => {
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await removeTokenAndAssertRemoval.call(this, { token: VALID_TOKEN_ADDRESS_1, tokenId: "0" });
      await expectRevert(this.segment.getTokenInformation("0"), "Segment: index is too big");
    });

    it("should add 2 tokens and remove first token", async () => {
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "1");

      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "0",
        },
        "0",
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "1",
        }
      );
    });

    it("should add 2 token and remove second token", async () => {
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "1");

      // Remove second token
      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "1",
        },
        "0",
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "0",
        }
      );
    });

    it("should add 3 token and remove 3 token", async () => {
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "11");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_2, "21");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "12");

      // Remove first token
      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "11",
        },
        "0",
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "12",
        }
      );

      // Ensure second token is still in segment (former third element is now first element)
      let actualTokenInformation = await this.segment.getTokenInformation("1");
      expect(actualTokenInformation.token).equals(VALID_TOKEN_ADDRESS_2);
      expect(actualTokenInformation.tokenId).equals("21");

      // Remove former second token
      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        {
          token: VALID_TOKEN_ADDRESS_2,
          tokenId: "21",
        },
        "0",
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "12",
        }
      );

      // Array has one element left
      await expectRevert(this.segment.getTokenInformation("1"), "Segment: index is too big");

      // Remove former third token
      await removeTokenAndAssertRemoval.call(this, { token: VALID_TOKEN_ADDRESS_1, tokenId: "12" });

      // Array is empty
      await expectRevert(this.segment.getTokenInformation("0"), "Segment: index is too big");
    });
  });

  describe("Don't Remove Token", () => {
    beforeEach(async () => {
      this.segment = await Segment.new(ALICE, VALID_SEGMENT_NAME, VALID_CONTAINER_ADDRESS);
    });

    it("should require a valid contract address", async () => {
      await expectRevert(this.segment.removeToken(INVALID_ADDRESS, "0"), "Segment: token is zero address");
    });

    it("should require stored tokens", async () => {
      await expectRevert(this.segment.removeToken(VALID_TOKEN_ADDRESS_1, "0"), "Segment: no tokens stored in segment");
    });

    it("should require a present token", async () => {
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await expectRevert(
        this.segment.removeToken(VALID_TOKEN_ADDRESS_1, "1"),
        "Segment: token and tokenId do not exist in segment"
      );
    });
  });
});
