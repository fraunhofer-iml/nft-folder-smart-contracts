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
  const VALID_CONTAINER_NAME = "MyContainer";
  const VALID_SEGMENT_NAME = "MySegment";
  const INVALID_ADDRESS = constants.ZERO_ADDRESS;
  let VALID_TOKEN_ADDRESS_1;
  let VALID_TOKEN_ADDRESS_2;

  async function removeTokenAndAssertRemoval(segmentContract, tokenInformation) {
    const receipt = await segmentContract.removeToken(tokenInformation.tokenAddress, tokenInformation.tokenId);

    expectEvent(receipt, "TokenRemoved", {
      from: ALICE,
      tokenAddress: tokenInformation.tokenAddress,
      tokenId: tokenInformation.tokenId,
    });

    const actualRemovedTokenInSegment = await segmentContract.isTokenInSegment(
      tokenInformation.tokenAddress,
      tokenInformation.tokenId
    );
    expect(actualRemovedTokenInSegment).is.false;

    const tokenContract = await Token.at(tokenInformation.tokenAddress);

    const pastEvents = await tokenContract.getPastEvents("SegmentRemovedFromToken");
    expect(pastEvents.length).to.be.equal(1);
    expect(pastEvents[0].returnValues["tokenId"]).to.be.equal(tokenInformation.tokenId);
    expect(pastEvents[0].returnValues["segment"]).to.be.equal(segmentContract.address);

    const isSegmentInToken = await tokenContract.isTokenInSegment(tokenInformation.tokenId, segmentContract.address);
    expect(isSegmentInToken).is.false;
  }

  describe("Remove Token", () => {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      this.segmentContract = await Segment.at(await this.containerContract.getSegment(0));

      this.tokenContract1 = await Token.new("Token1", "TKE");
      VALID_TOKEN_ADDRESS_1 = this.tokenContract1.address;

      this.tokenContract2 = await Token.new("Token2", "TKZ");
      VALID_TOKEN_ADDRESS_2 = this.tokenContract2.address;
    });

    it("should add 1 token and remove 1 token", async () => {
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await removeTokenAndAssertRemoval.call(this, this.segmentContract, {
        tokenAddress: VALID_TOKEN_ADDRESS_1,
        tokenId: "0",
      });

      const actualTokenInformationArray = await this.segmentContract.getAllTokenInformation();
      expect(actualTokenInformationArray.length).equal(Number("0"));

      await expectRevert(this.segmentContract.getTokenInformation("0"), "Segment: index is too large");

      const actualNumberOfTokenInformation = await this.segmentContract.getNumberOfTokenInformation();
      expect(actualNumberOfTokenInformation).to.be.bignumber.equal("0");
    });

    it("should add 2 tokens and remove first token", async () => {
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "1");

      // Remove first token
      await removeTokenAndAssertRemoval(this.segmentContract, {
        tokenAddress: VALID_TOKEN_ADDRESS_1,
        tokenId: "0",
      });

      const actualMovedTokenInformation = await this.segmentContract.getTokenInformation("0");
      expect(actualMovedTokenInformation.tokenAddress).equals(VALID_TOKEN_ADDRESS_1);
      expect(actualMovedTokenInformation.tokenId).equals("1");

      const actualMovedTokenInSegment = await this.segmentContract.isTokenInSegment(VALID_TOKEN_ADDRESS_1, "1");
      expect(actualMovedTokenInSegment).is.true;
    });

    it("should add 2 token and remove second token", async () => {
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "1");

      // Remove second token
      await removeTokenAndAssertRemoval(this.segmentContract, {
        tokenAddress: VALID_TOKEN_ADDRESS_1,
        tokenId: "1",
      });

      const actualMovedTokenInformation = await this.segmentContract.getTokenInformation("0");
      expect(actualMovedTokenInformation.tokenAddress).equals(VALID_TOKEN_ADDRESS_1);
      expect(actualMovedTokenInformation.tokenId).equals("0");

      const actualMovedTokenInSegment = await this.segmentContract.isTokenInSegment(VALID_TOKEN_ADDRESS_1, "0");
      expect(actualMovedTokenInSegment).is.true;
    });

    it("should add 3 token and remove 3 token", async () => {
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.tokenContract2.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_2, "0");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "1");

      // Remove first token
      await removeTokenAndAssertRemoval(this.segmentContract, {
        tokenAddress: VALID_TOKEN_ADDRESS_1,
        tokenId: "0",
      });

      const actualMovedTokenInformation = await this.segmentContract.getTokenInformation("0");
      expect(actualMovedTokenInformation.tokenAddress).equals(VALID_TOKEN_ADDRESS_1);
      expect(actualMovedTokenInformation.tokenId).equals("1");

      const actualMovedTokenInSegment = await this.segmentContract.isTokenInSegment(VALID_TOKEN_ADDRESS_1, "1");
      expect(actualMovedTokenInSegment).is.true;

      // Ensure second token is still in segment (former third element is now first element)
      let actualTokenInformation = await this.segmentContract.getTokenInformation("1");
      expect(actualTokenInformation.tokenAddress).equals(VALID_TOKEN_ADDRESS_2);
      expect(actualTokenInformation.tokenId).equals("0");

      // Remove second token
      await removeTokenAndAssertRemoval(this.segmentContract, {
        tokenAddress: VALID_TOKEN_ADDRESS_2,
        tokenId: "0",
      });

      const actualMovedTokenInformation2 = await this.segmentContract.getTokenInformation("0");
      expect(actualMovedTokenInformation2.tokenAddress).equals(VALID_TOKEN_ADDRESS_1);
      expect(actualMovedTokenInformation2.tokenId).equals("1");

      const actualMovedTokenInSegment2 = await this.segmentContract.isTokenInSegment(VALID_TOKEN_ADDRESS_1, "1");
      expect(actualMovedTokenInSegment2).is.true;

      // One element remains in array left
      await expectRevert(this.segmentContract.getTokenInformation("1"), "Segment: index is too large");

      // Remove former third token
      await removeTokenAndAssertRemoval.call(this, this.segmentContract, {
        tokenAddress: VALID_TOKEN_ADDRESS_1,
        tokenId: "1",
      });

      // Array is empty
      await expectRevert(this.segmentContract.getTokenInformation("0"), "Segment: index is too large");
    });
  });

  describe("Don't Remove Token", () => {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);
      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      this.segmentContract = await Segment.at(await this.containerContract.getSegment(0));

      this.tokenContract1 = await Token.new("Token1", "TKE");
      VALID_TOKEN_ADDRESS_1 = this.tokenContract1.address;
    });

    it("should require a valid contract address", async () => {
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await expectRevert(this.segmentContract.removeToken(INVALID_ADDRESS, "0"), "Segment: token is zero address");
    });

    it("should require a present token", async () => {
      await this.tokenContract1.safeMint(ALICE, "au", "ah", "mu", "mh", "ai");
      await this.segmentContract.addToken(VALID_TOKEN_ADDRESS_1, "0");

      await expectRevert(
        this.segmentContract.removeToken(VALID_TOKEN_ADDRESS_1, "1"),
        "Segment: token and tokenId do not exist in segment"
      );
    });
  });
});
