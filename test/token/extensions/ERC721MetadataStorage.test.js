/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Token = artifacts.require("Token");

contract("Token - Extension ERC721MetadataStorage", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI = "asset_uri";
  const ASSET_HASH = "asset_hash";
  const METADATA_URI_1 = "meta_uri_1";
  const METADATA_URI_2 = "meta_uri_2";
  const METADATA_HASH_1 = "meta_hash_1";
  const METADATA_HASH_2 = "meta_hash_2";
  const ADDITIONAL_INFO = "additional_info";

  describe("tokenURI", function () {
    beforeEach(async () => {
      this.token = await Token.new("Token", "TKN");
    });

    it("should get tokenURI", async () => {
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_1, METADATA_HASH_1, ADDITIONAL_INFO);

      const tokenURI = await this.token.tokenURI(0);
      expect(tokenURI).to.be.equal(METADATA_URI_1);
    });

    it("should get tokenURI for multiple minted token", async () => {
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_1, METADATA_HASH_1, ADDITIONAL_INFO);
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_2, METADATA_HASH_2, ADDITIONAL_INFO);

      const tokenURI1 = await this.token.tokenURI(0);
      expect(tokenURI1).to.be.equal(METADATA_URI_1);

      const tokenURI2 = await this.token.tokenURI(1);
      expect(tokenURI2).to.be.equal(METADATA_URI_2);
    });
  });

  describe("getMetadataHash", function () {
    beforeEach(async () => {
      this.token = await Token.new("Token", "TKN");
    });

    it("should get tokenHash", async () => {
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_1, METADATA_HASH_1, ADDITIONAL_INFO);

      const tokenHash = await this.token.getMetadataHash(0);
      expect(tokenHash).to.be.equal(METADATA_HASH_1);
    });

    it("should get tokenHash for multiple minted token", async () => {
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_1, METADATA_HASH_1, ADDITIONAL_INFO);
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_2, METADATA_HASH_2, ADDITIONAL_INFO);

      const metadataHash1 = await this.token.getMetadataHash(0);
      expect(metadataHash1).to.be.equal(METADATA_HASH_1);

      const metadataHash2 = await this.token.getMetadataHash(1);
      expect(metadataHash2).to.be.equal(METADATA_HASH_2);
    });
  });

  describe("_burn", function () {
    beforeEach(async () => {
      this.token = await Token.new("Token", "TKN");
    });

    it("should delete tokenURI and hash on burning", async () => {
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_1, METADATA_HASH_1, ADDITIONAL_INFO);
      await this.token.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI_2, METADATA_HASH_2, ADDITIONAL_INFO);

      await this.token.burn(0);

      // tokenURI and hash for token with id 1 should still exist
      const tokenUri = await this.token.tokenURI(1);
      expect(tokenUri).to.be.equal(METADATA_URI_2);

      const metadataHash = await this.token.getMetadataHash(1);
      expect(metadataHash).to.be.equal(METADATA_HASH_2);

      // uri and hash for token with id 0 should be deleted
      await expectRevert(this.token.tokenURI(0), "ERC721: invalid token ID");
      await expectRevert(this.token.getMetadataHash(0), "ERC721: invalid token ID");
    });
  });
});
