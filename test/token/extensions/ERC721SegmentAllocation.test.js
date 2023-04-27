/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

require("@openzeppelin/test-helpers");

const { expectRevert } = require("@openzeppelin/test-helpers");

const Token = artifacts.require("Token");

contract("Token - Extension ERC721SegmentAllocation", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI = "assert_uri";
  const ASSET_HASH = "asset_hash";
  const METADATA_URI = "meta_uri";
  const METADATA_HASH = "meta_hash";
  const ADDITIONAL_INFO = "additional_info";
  const VALID_SEGMENT_ADDRESS1 = "0x0000000000000000000000000000000000000001";

  describe("addTokenToSegment", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);
    });

    it("should not add Segment to Token from Token Contract", async () => {
      await expectRevert(
        this.tokenContract.addTokenToSegment(0, VALID_SEGMENT_ADDRESS1),
        "ERC721SegmentAllocation: can only be set from segment."
      );
    });
  });

  describe("removeTokenFromSegment", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);
    });

    it("should not remove Segment to Token from Token Contract", async () => {
      await expectRevert(
        this.tokenContract.removeTokenFromSegment(0, VALID_SEGMENT_ADDRESS1),
        "ERC721SegmentAllocation: can only be set from segment."
      );
    });
  });
});
