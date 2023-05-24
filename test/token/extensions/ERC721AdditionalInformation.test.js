/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

require("@openzeppelin/test-helpers");

const { expect } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");

const Token = artifacts.require("Token");

contract("Token - Extension ERC721AdditionalInformation", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI = "asset_uri";
  const ASSET_HASH = "asset_hash";
  const METADATA_URI = "meta_uri";
  const METADATA_HASH = "meta_hash";
  const REMOTE_ID_1 = "remote_id_1";
  const REMOTE_ID_2 = "remote_id_2";
  const ADDITIONAL_INFO_1 = "additional_info_1";
  const ADDITIONAL_INFO_2 = "additional_info_2";

  describe("getAdditionalInformation", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get additional info", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_1,
        ADDITIONAL_INFO_1
      );

      const additionalInformation = await this.tokenContract.getAdditionalInformation(0);
      expect(additionalInformation).to.be.equal(ADDITIONAL_INFO_1);
    });

    it("should get different additional info for different tokens", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_1,
        ADDITIONAL_INFO_1
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_2,
        ADDITIONAL_INFO_2
      );

      const additionalInformation1 = await this.tokenContract.getAdditionalInformation(0);
      expect(additionalInformation1).to.be.equal(ADDITIONAL_INFO_1);

      const additionalInformation2 = await this.tokenContract.getAdditionalInformation(1);
      expect(additionalInformation2).to.be.equal(ADDITIONAL_INFO_2);
    });

    it("should not get additional info", async () => {
      await expectRevert(
        this.tokenContract.getAdditionalInformation(0),
        "ERC721AdditionalInformation: token does not exist"
      );
    });
  });

  describe("_burn", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should delete additionalInformation on burning", async () => {
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, "1", "1", REMOTE_ID_1, ADDITIONAL_INFO_1);
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, "2", "2", REMOTE_ID_2, ADDITIONAL_INFO_2);

      await this.tokenContract.burn(0);

      // additionalInformation for token with id 1 should still exist
      const additionalInformation2 = await this.tokenContract.getAdditionalInformation(1);
      expect(additionalInformation2).to.be.equal(ADDITIONAL_INFO_2);

      // additionalInformation for token with id 0 should be deleted
      await expectRevert(
        this.tokenContract.getAdditionalInformation(0),
        "ERC721AdditionalInformation: token does not exist"
      );
    });
  });
});
