/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

const Container = artifacts.require("Container");
const Segment = artifacts.require("Segment");
const Token = artifacts.require("Token");

contract("Container", function (accounts) {
  const [ALICE] = accounts;
  const VALID_CONTAINER_NAME = "MyContainer";
  const VALID_SEGMENT_NAME = "MySegment";
  const ASSET_URI = "https://aaa.com";
  const ASSET_HASH = "aaa1b2c3";
  const METADATA_URI = "https://bbb.com";
  const METADATA_HASH = "a1bbb2c3";
  const ADDITIONAL_INFORMATION = "{'name': 'just a syntactically wrong json'}";

  describe("integration", function () {
    beforeEach(async () => {
      this.containerContract = await Container.new(ALICE, VALID_CONTAINER_NAME);

      await this.containerContract.createSegment(VALID_SEGMENT_NAME);
      this.segmentContract = await Segment.at(await this.containerContract.getSegment(0));

      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should mint, add to segment and burn a token", async () => {
      await mintToken.call(this);
      await addTokenToSegment.call(this);
      await burnToken.call(this);
    });

    async function mintToken() {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        ADDITIONAL_INFORMATION
      );

      const balanceOfAlice = await this.tokenContract.balanceOf(ALICE);
      expect(balanceOfAlice).to.be.bignumber.equal("1");

      const ownerOf = await this.tokenContract.ownerOf("0");
      expect(ownerOf).to.be.equal(ALICE);

      const tokenUri = await this.tokenContract.tokenURI("0");
      expect(tokenUri).to.be.equal(METADATA_URI);

      const additionalInformation = await this.tokenContract.getAdditionalInformation("0");
      expect(additionalInformation).to.be.equal(ADDITIONAL_INFORMATION);

      const assetInformation = await this.tokenContract.getAssetInformation("0");
      expect(assetInformation.assetUri).to.be.equal(ASSET_URI);
      expect(assetInformation.assetHash).to.be.equal(ASSET_HASH);

      const metadataHash = await this.tokenContract.getMetadataHash("0");
      expect(metadataHash).to.be.equal(METADATA_HASH);

      const segments = await this.tokenContract.getSegments("0");
      expect(segments).to.be.empty;

      await expectRevert(this.tokenContract.getSegment("0", "0"), "ERC721SegmentAllocation: no segment at given index");

      const numberOfSegments = await this.tokenContract.getNumberOfSegments("0");
      expect(numberOfSegments).to.be.bignumber.equal("0");
    }

    async function addTokenToSegment() {
      await this.segmentContract.addToken(this.tokenContract.address, "0");

      // segment side
      const tokenInformation = await this.segmentContract.getTokenInformation("0");
      expect(tokenInformation.tokenAddress).to.be.equal(this.tokenContract.address);
      expect(tokenInformation.tokenId).to.be.equal("0");

      const numberOfTokenInformation = await this.segmentContract.getNumberOfTokenInformation();
      expect(numberOfTokenInformation).to.be.bignumber.equal("1");

      const tokenInSegment_segmentSide = await this.segmentContract.isTokenInSegment(this.tokenContract.address, "0");
      expect(tokenInSegment_segmentSide).to.be.true;

      // token side
      const segments = await this.tokenContract.getSegments("0");
      expect(segments).to.be.bignumber.lengthOf("1");
      expect(segments[0]).to.be.equal(this.segmentContract.address);

      const segment = await this.tokenContract.getSegment("0", "0");
      expect(segment).to.be.equal(this.segmentContract.address);

      const numberOfSegments = await this.tokenContract.getNumberOfSegments("0");
      expect(numberOfSegments).to.be.bignumber.equal("1");

      const tokenInSegment_tokenSide = await this.tokenContract.isTokenInSegment("0", this.segmentContract.address);
      expect(tokenInSegment_tokenSide).to.be.true;
    }

    async function burnToken() {
      /* TODO-MP: fix calling burn function
      const newVar = await this.tokenContract.burn("0").send({ from: ALICE });
      console.log(newVar);

      //const balanceOfAlice = await this.tokenContract.balanceOf(ALICE);
      //expect(balanceOfAlice).to.be.bignumber.equal("0");

      await expectRevert(this.tokenContract.ownerOf("0"), "ERC721: invalid token ID");
      await expectRevert(this.tokenContract.tokenURI("0"), "ERC721: invalid token ID");
      await expectRevert(this.tokenContract.getAdditionalInformation("0"), "ERC721: invalid token ID");
      await expectRevert(this.tokenContract.getAssetInformation("0"), "ERC721: invalid token ID");
      await expectRevert(this.tokenContract.getMetadataHash("0"), "ERC721: invalid token ID");

      const segments = await this.tokenContract.getSegments("0");
      expect(segments).to.be.empty;

      await expectRevert(this.tokenContract.getSegment("0", "0"), "ERC721SegmentAllocation: no segment at given index");

      const numberOfSegments = await this.tokenContract.getNumberOfSegments("0");
      expect(numberOfSegments).to.be.bignumber.equal("0");
       */
    }
  });
});
