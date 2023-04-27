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
  const VALID_CONTAINER_NAME = "MyContainer";
  const VALID_SEGMENT_NAME = "MySegment";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;
  let VALID_TOKEN_ADDRESS_1;

  async function addTokenAndAssertValues(
    segmentContract,
    tokenContract,
    tokenId,
    tokenInformationSize,
    tokenInformationIndex,
    segmentIndex
  ) {
    const segmentAddress = segmentContract.address;
    const tokenAddress = tokenContract.address;
    await tokenContract.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");

    const receipt = await segmentContract.addToken(tokenAddress, tokenId);

    expectEvent(receipt, "TokenAdded", {
      from: ALICE,
      tokenAddress: tokenAddress,
      tokenId: tokenId,
    });

    const pastEvents = await tokenContract.getPastEvents("SegmentAddedToToken");
    expect(pastEvents.length).to.be.equal(1);
    expect(pastEvents[0].returnValues["tokenId"]).to.be.equal(tokenId);
    expect(pastEvents[0].returnValues["segment"]).to.be.equal(segmentAddress);

    const actualTokenInformationArray = await segmentContract.getTokenInformation();
    expect(actualTokenInformationArray.length).equal(Number(tokenInformationSize));

    const actualTokenInformation = await segmentContract.getTokenInformation(tokenInformationIndex);
    expect(actualTokenInformation.tokenAddress).equals(tokenAddress);
    expect(actualTokenInformation.tokenId).equals(tokenId);

    const actualNumberOfTokenInformation = await segmentContract.getNumberOfTokenInformation();
    expect(actualNumberOfTokenInformation).to.be.bignumber.equal(tokenInformationSize);

    const actualTokenInSegment = await segmentContract.isTokenInSegment(tokenAddress, tokenId);
    expect(actualTokenInSegment).is.true;

    const actualNumberOfSegments = await tokenContract.getNumberOfSegments(tokenId);
    const expectedNumberOfSegments = (Number(segmentIndex) + 1).toString();
    expect(actualNumberOfSegments).to.be.bignumber.equal(expectedNumberOfSegments);

    const segmentAtIndex = await tokenContract.getSegment(tokenId, segmentIndex);
    expect(segmentAtIndex).to.be.equal(segmentAddress);

    const isTokenInSegment = await tokenContract.isTokenInSegment(tokenId, segmentAddress);
    expect(isTokenInSegment).to.be.true;
  }

  describe("Add Token", () => {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      await this.containerContract.createSegment("DifferentSegment");

      this.segmentContract1 = await Segment.at(await this.containerContract.getSegment(0));
      this.segmentContract2 = await Segment.at(await this.containerContract.getSegment(1));
      this.tokenContract1 = await Token.new("Token1", "TKE");
      this.tokenContract2 = await Token.new("Token2", "TKZ");
    });

    it("should add 1 token", async () => {
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract1, "0", "1", "0", "0");
    });

    it("should add 2 tokens from same token address", async () => {
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract1, "0", "1", "0", "0");
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract1, "1", "2", "1", "0");
    });

    it("should add 3 tokens from different token addresses", async () => {
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract1, "0", "1", "0", "0");
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract2, "0", "2", "1", "0");
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract1, "1", "3", "2", "0");
    });

    it("should add 1 token to multiple segments", async () => {
      await addTokenAndAssertValues.call(this, this.segmentContract1, this.tokenContract1, "0", "1", "0", "0");
      await addTokenAndAssertValues.call(this, this.segmentContract2, this.tokenContract1, "0", "1", "0", "1");
    });
  });

  describe("Don't Add Token", () => {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      this.segmentContract = await Segment.at(await this.containerContract.getSegment(0));
      this.tokenContract = await Token.new("Token1", "TKE");
      VALID_TOKEN_ADDRESS_1 = this.tokenContract.address;
    });

    it("should require a valid contract address", async () => {
      await this.tokenContract.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await expectRevert(this.segmentContract.addToken(INVALID_ADDRESS, "0"), "Segment: token is zero address");
    });

    it("should require an absent token", async () => {
      await this.tokenContract.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await expectRevert(
        this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0"),
        "Segment: token and tokenId already exist in segment"
      );
    });
  });
});
