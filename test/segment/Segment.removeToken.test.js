/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert, expectEvent, constants } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Container = artifacts.require("Container");
const Segment = artifacts.require("Segment");
const Token = artifacts.require("Token");

contract("Segment", function (accounts) {
  const [ALICE] = accounts;
  const VALID_SEGMENT_NAME = "MySegment";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;
  let VALID_TOKEN_ADDRESS_1;
  let VALID_TOKEN_ADDRESS_2;

  async function removeTokenAndAssertRemoval(segment, tokenInformation) {
    const receipt = await segment.removeToken(tokenInformation.token, tokenInformation.tokenId);

    expectEvent(receipt, "TokenRemoved", {
      from: ALICE,
      token: tokenInformation.token,
      tokenId: tokenInformation.tokenId,
    });

    await expectRevert(
      segment.getTokenLocationInSegment(tokenInformation.token, tokenInformation.tokenId),
      "Segment: token and tokenId do not exist in segment"
    );

    const actualRemovedTokenInSegment = await segment.isTokenInSegment(
      tokenInformation.token,
      tokenInformation.tokenId
    );
    expect(actualRemovedTokenInSegment).is.false;

    const token = await Token.at(tokenInformation.token);

    const pastEvents = await token.getPastEvents("SegmentRemovedFromToken");
    expect(pastEvents.length).to.be.equal(1);
    expect(pastEvents[0].returnValues["tokenId"]).to.be.equal(tokenInformation.tokenId);
    expect(pastEvents[0].returnValues["segment"]).to.be.equal(segment.address);

    await expectRevert(
      token.getIndexForTokenAtSegment(tokenInformation.tokenId, segment.address),
      "ERC721SegmentAllocation: segment not in token"
    );

    const isSegmentInToken = await token.isTokenInSegment(tokenInformation.tokenId, segment.address);
    expect(isSegmentInToken).is.false;
  }

  async function removeTokenAndAssertRemovalWithExpectedInformation(
    segment,
    tokenInformation,
    movedTokenInformationIndex,
    expectedMovedTokenInformation
  ) {
    await removeTokenAndAssertRemoval(segment, tokenInformation);

    const actualMovedTokenInformation = await segment.getTokenInformation(movedTokenInformationIndex);
    expect(actualMovedTokenInformation.token).equals(expectedMovedTokenInformation.token);
    expect(actualMovedTokenInformation.tokenId).equals(expectedMovedTokenInformation.tokenId);

    const actualMovedTokenInSegment = await segment.isTokenInSegment(
      expectedMovedTokenInformation.token,
      expectedMovedTokenInformation.tokenId
    );
    expect(actualMovedTokenInSegment).is.true;
  }

  describe("Remove Token", () => {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
      await this.container.createSegment(VALID_SEGMENT_NAME);
      this.segment = await Segment.at(await this.container.getSegmentAtIndex(0));

      this.token1 = await Token.new("Token1", "TKE");
      VALID_TOKEN_ADDRESS_1 = this.token1.address;

      this.token2 = await Token.new("Token2", "TKZ");
      VALID_TOKEN_ADDRESS_2 = this.token2.address;
    });

    it("should add 1 token and remove 1 token", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await removeTokenAndAssertRemoval.call(this, this.segment, { token: VALID_TOKEN_ADDRESS_1, tokenId: "0" });

      await expectRevert(this.segment.getTokenInformation("0"), "Segment: index is too big");
    });

    it("should add 2 tokens and remove first token", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "1");

      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        this.segment,
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
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "1");

      // Remove second token
      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        this.segment,
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
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.token2.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_2, "0");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "1");

      // Remove first token
      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        this.segment,
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

      // Ensure second token is still in segment (former third element is now first element)
      let actualTokenInformation = await this.segment.getTokenInformation("1");
      expect(actualTokenInformation.token).equals(VALID_TOKEN_ADDRESS_2);
      expect(actualTokenInformation.tokenId).equals("0");

      // Remove former second token
      await removeTokenAndAssertRemovalWithExpectedInformation.call(
        this,
        this.segment,
        {
          token: VALID_TOKEN_ADDRESS_2,
          tokenId: "0",
        },
        "0",
        {
          token: VALID_TOKEN_ADDRESS_1,
          tokenId: "1",
        }
      );

      // Array has one element left
      await expectRevert(this.segment.getTokenInformation("1"), "Segment: index is too big");

      // Remove former third token
      await removeTokenAndAssertRemoval.call(this, this.segment, { token: VALID_TOKEN_ADDRESS_1, tokenId: "1" });

      // Array is empty
      await expectRevert(this.segment.getTokenInformation("0"), "Segment: index is too big");
    });
  });

  describe("Don't Remove Token", () => {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
      await this.container.createSegment(VALID_SEGMENT_NAME);
      this.segment = await Segment.at(await this.container.getSegmentAtIndex(0));

      this.token1 = await Token.new("Token1", "TKE");
      VALID_TOKEN_ADDRESS_1 = this.token1.address;
    });

    it("should require a valid contract address", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await expectRevert(this.segment.removeToken(INVALID_ADDRESS, "0"), "Segment: token is zero address");
    });

    it("should require stored tokens", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await expectRevert(this.segment.removeToken(VALID_TOKEN_ADDRESS_1, "0"), "Segment: no tokens stored in segment");
    });

    it("should require a present token", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await expectRevert(
        this.segment.removeToken(VALID_TOKEN_ADDRESS_1, "1"),
        "Segment: token and tokenId do not exist in segment"
      );
    });
  });
});
