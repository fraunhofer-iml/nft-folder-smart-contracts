/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Token = artifacts.require("Token");

contract("Token - Extension ERC721Asset", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI_1 = "asset_uri_1";
  const ASSET_URI_2 = "asset_uri_2";
  const ASSET_HASH_1 = "asset_hash_1";
  const ASSET_HASH_2 = "asset_hash_2";
  const METADATA_URI = "meta_uri";
  const METADATA_HASH = "meta_hash";
  const REMOTE_ID = "remote_id";
  const ADDITIONAL_INFO = "additional_info";

  describe("getAssetUri", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get assetUri", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_1,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      const assetUri = await this.tokenContract.getAssetUri(0);
      expect(assetUri).to.be.equal(ASSET_URI_1);
    });

    it("should get assetUri for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_1,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_2,
        ASSET_HASH_2,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      const assetUri1 = await this.tokenContract.getAssetUri(0);
      expect(assetUri1).to.be.equal(ASSET_URI_1);

      const assetUri2 = await this.tokenContract.getAssetUri(1);
      expect(assetUri2).to.be.equal(ASSET_URI_2);
    });
  });

  describe("getAssetHash", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get assetHash", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_1,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      const assetUri = await this.tokenContract.getAssetHash(0);
      expect(assetUri).to.be.equal(ASSET_HASH_1);
    });

    it("should get assetHash for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_1,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_2,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      const assetHash1 = await this.tokenContract.getAssetHash(0);
      expect(assetHash1).to.be.equal(ASSET_HASH_1);

      const assetHash2 = await this.tokenContract.getAssetHash(1);
      expect(assetHash2).to.be.equal(ASSET_HASH_2);
    });

    it("should get assetInformation for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_1,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_2,
        ASSET_HASH_2,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      const assetInformation1 = await this.tokenContract.getAssetInformation(0);
      expect(assetInformation1.assetUri).to.be.equal(ASSET_URI_1);
      expect(assetInformation1.assetHash).to.be.equal(ASSET_HASH_1);

      const assetInformation2 = await this.tokenContract.getAssetInformation(1);
      expect(assetInformation2.assetUri).to.be.equal(ASSET_URI_2);
      expect(assetInformation2.assetHash).to.be.equal(ASSET_HASH_2);
    });
  });

  describe("_burn", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should delete assetUri and hash on burning", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_1,
        ASSET_HASH_1,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI_2,
        ASSET_HASH_2,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      await this.tokenContract.burn(0);

      // asset uri and hash for token with id 1 should still exist
      const assetInformation2 = await this.tokenContract.getAssetInformation(1);
      expect(assetInformation2.assetUri).to.be.equal(ASSET_URI_2);
      expect(assetInformation2.assetHash).to.be.equal(ASSET_HASH_2);

      const assetUri2 = await this.tokenContract.getAssetUri(1);
      expect(assetUri2).to.be.equal(ASSET_URI_2);

      const assetHash2 = await this.tokenContract.getAssetHash(1);
      expect(assetHash2).to.be.equal(ASSET_HASH_2);

      // asset uri and hash for token with id 0 should be deleted
      await expectRevert(this.tokenContract.getAssetUri(0), "ERC721: invalid token ID");
      await expectRevert(this.tokenContract.getAssetHash(0), "ERC721: invalid token ID");
    });
  });
});
