/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Token = artifacts.require("Token");

contract("Token - Extension ERC721AssetStorage", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI_1 = "asset_uri_1";
  const ASSET_URI_2 = "asset_uri_2";
  const ASSET_HASH_1 = "asset_hash_1";
  const ASSET_HASH_2 = "asset_hash_2";
  const METADATA_URI = "meta_uri";
  const METADATA_HASH = "meta_hash";
  const ADDITIONAL_INFO = "additional_info";

  describe("getAssetUri", function () {
    beforeEach(async () => {
      this.token = await Token.new("Token", "TKN");
    });

    it("should get assetUri", async () => {
      await this.token.safeMint(ALICE, ASSET_URI_1, ASSET_HASH_1, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);

      const assetUri = await this.token.getAssetUri(0);
      expect(assetUri).to.be.equal(ASSET_URI_1);
    });

    it("should get assetUri for multiple minted token", async () => {
      await this.token.safeMint(ALICE, ASSET_URI_1, ASSET_HASH_1, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);
      await this.token.safeMint(ALICE, ASSET_URI_2, ASSET_HASH_2, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);

      const assetUri1 = await this.token.getAssetUri(0);
      expect(assetUri1).to.be.equal(ASSET_URI_1);

      const assetUri2 = await this.token.getAssetUri(1);
      expect(assetUri2).to.be.equal(ASSET_URI_2);
    });
  });

  describe("getAssetHash", function () {
    beforeEach(async () => {
      this.token = await Token.new("Token", "TKN");
    });

    it("should get assetHash", async () => {
      await this.token.safeMint(ALICE, ASSET_URI_1, ASSET_HASH_1, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);

      const assetUri = await this.token.getAssetHash(0);
      expect(assetUri).to.be.equal(ASSET_HASH_1);
    });

    it("should get assetHash for multiple minted token", async () => {
      await this.token.safeMint(ALICE, ASSET_URI_1, ASSET_HASH_1, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);
      await this.token.safeMint(ALICE, ASSET_URI_1, ASSET_HASH_2, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);

      const assetHash1 = await this.token.getAssetHash(0);
      expect(assetHash1).to.be.equal(ASSET_HASH_1);

      const assetHash2 = await this.token.getAssetHash(1);
      expect(assetHash2).to.be.equal(ASSET_HASH_2);
    });
  });

  describe("_burn", function () {
    beforeEach(async () => {
      this.token = await Token.new("Token", "TKN");
    });

    it("should delete assetUri and hash on burning", async () => {
      await this.token.safeMint(ALICE, ASSET_URI_1, ASSET_HASH_1, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);
      await this.token.safeMint(ALICE, ASSET_URI_2, ASSET_HASH_2, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);

      await this.token.burn(0);

      // asset uri and hash for token with id 1 should still exist
      const assetUri2 = await this.token.getAssetUri(1);
      expect(assetUri2).to.be.equal(ASSET_URI_2);

      const assetHash2 = await this.token.getAssetHash(1);
      expect(assetHash2).to.be.equal(ASSET_HASH_2);

      // asset uri and hash for token with id 0 should be deleted
      await expectRevert(this.token.getAssetUri(0), "ERC721: invalid token ID");
      await expectRevert(this.token.getAssetHash(0), "ERC721: invalid token ID");
    });
  });
});
