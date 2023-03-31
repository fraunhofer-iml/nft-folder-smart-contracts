/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { constants, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Segment = artifacts.require("Segment");
const Token = artifacts.require("Token");
const Container = artifacts.require("Container");

contract("Segment", function (accounts) {
  const [ALICE] = accounts;
  const VALID_SEGMENT_NAME = "MySegment";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;
  let VALID_TOKEN_ADDRESS_1;

  async function addTokenAndAssertValues(segment, token, tokenId, tokenInformationIndex, segmentIndex) {
    const segmentAddress = segment.address;
    const tokenAddress = token.address;
    await token.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");

    const receipt = await segment.addToken(tokenAddress, tokenId);

    expectEvent(receipt, "TokenAdded", {
      from: ALICE,
      token: tokenAddress,
      tokenId: tokenId,
    });

    const pastEvents = await token.getPastEvents("SegmentAddedToToken");
    expect(pastEvents.length).to.be.equal(1);
    expect(pastEvents[0].returnValues["tokenId"]).to.be.equal(tokenId);
    expect(pastEvents[0].returnValues["segment"]).to.be.equal(segmentAddress);
    expect(pastEvents[0].returnValues["index"]).to.be.equal(segmentIndex);

    const actualTokenInformation = await segment.getTokenInformation(tokenInformationIndex);
    expect(actualTokenInformation.token).equals(tokenAddress);
    expect(actualTokenInformation.tokenId).equals(tokenId);

    const actualTokenLocationInSegment = await segment.getTokenLocationInSegment(tokenAddress, tokenId);
    expect(actualTokenLocationInSegment.present).is.true;
    expect(actualTokenLocationInSegment.tokenInformationIndex).equals(tokenInformationIndex);

    const actualTokenInSegment = await segment.isTokenInSegment(tokenAddress, tokenId);
    expect(actualTokenInSegment).is.true;

    const segmentCount = await token.getSegmentCountByToken(tokenId);
    const expectedSegmentCount = (Number(segmentIndex) + 1).toString();
    expect(segmentCount).to.be.bignumber.equal(expectedSegmentCount);

    const segmentAtIndex = await token.getSegmentForTokenAtSegmentIndex(tokenId, segmentIndex);
    expect(segmentAtIndex).to.be.equal(segmentAddress);

    const indexForSegment = await token.getIndexForTokenAtSegment(tokenId, segmentAddress);
    expect(indexForSegment).to.be.bignumber.equal(segmentIndex.toString());

    const isTokenInSegment = await token.isTokenInSegment(tokenId, segmentAddress);
    expect(isTokenInSegment).to.be.true;
  }

  describe("Add Token", () => {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
      await this.container.createSegment(VALID_SEGMENT_NAME);
      await this.container.createSegment("DifferentSegment");

      this.segment = await Segment.at(await this.container.getSegmentAtIndex(0));
      this.segment2 = await Segment.at(await this.container.getSegmentAtIndex(1));
      this.token1 = await Token.new("Token1", "TKE");
      this.token2 = await Token.new("Token2", "TKZ");
    });

    it("should add 1 token", async () => {
      await addTokenAndAssertValues.call(this, this.segment, this.token1, "0", "0", "0");
    });

    it("should add 2 tokens from same token address", async () => {
      await addTokenAndAssertValues.call(this, this.segment, this.token1, "0", "0", "0");
      await addTokenAndAssertValues.call(this, this.segment, this.token1, "1", "1", "0");
    });

    it("should add 3 tokens from different token addresses", async () => {
      await addTokenAndAssertValues.call(this, this.segment, this.token1, "0", "0", "0");
      await addTokenAndAssertValues.call(this, this.segment, this.token2, "0", "1", "0");
      await addTokenAndAssertValues.call(this, this.segment, this.token1, "1", "2", "0");
    });

    it("should add 1 token to multiple segments", async () => {
      await addTokenAndAssertValues.call(this, this.segment, this.token1, "0", "0", "0");
      await addTokenAndAssertValues.call(this, this.segment2, this.token1, "0", "0", "1");
    });
  });

  describe("Don't Add Token", () => {
    beforeEach(async () => {
      this.container = await Container.new(ALICE, "myContainer");
      await this.container.createSegment(VALID_SEGMENT_NAME);
      this.segment = await Segment.at(await this.container.getSegmentAtIndex(0));
      this.token1 = await Token.new("Token1", "TKE");
      VALID_TOKEN_ADDRESS_1 = this.token1.address;
    });

    it("should require a valid contract address", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await expectRevert(this.segment.addToken(INVALID_ADDRESS, "0"), "Segment: token is zero address");
    });

    it("should require an absent token", async () => {
      await this.token1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await expectRevert(
        this.segment.addToken(VALID_TOKEN_ADDRESS_1, "0"),
        "Segment: token and tokenId already exist in segment"
      );
    });
  });
});
