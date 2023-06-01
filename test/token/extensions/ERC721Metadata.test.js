/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const { expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Token = artifacts.require("Token");

contract("Token - Extension ERC721Metadata", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI = "asset_uri";
  const ASSET_HASH = "asset_hash";
  const METADATA_URI_1 = "meta_uri_1";
  const METADATA_URI_1_UPDATED = "meta_uri_1_updated";
  const METADATA_URI_2 = "meta_uri_2";
  const METADATA_URI_2_UPDATED = "meta_uri_2_updated";
  const METADATA_HASH_1 = "meta_hash_1";
  const METADATA_HASH_1_UPDATED = "meta_hash_1_updated";
  const METADATA_HASH_2 = "meta_hash_2";
  const METADATA_HASH_2_UPDATED = "meta_hash_2_updated";
  const REMOTE_ID_1 = "remote_id_1";
  const REMOTE_ID_2 = "remote_id_2";
  const ADDITIONAL_INFO = "additional_info";

  describe("getMetadataUri", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get metadataUri", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );

      const tokenURI = await this.tokenContract.getMetadataUri(0);
      expect(tokenURI).to.be.equal(METADATA_URI_1);
    });

    it("should get metadataUri for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_2,
        METADATA_HASH_2,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      const tokenURI1 = await this.tokenContract.getMetadataUri(0);
      expect(tokenURI1).to.be.equal(METADATA_URI_1);

      const tokenURI2 = await this.tokenContract.getMetadataUri(1);
      expect(tokenURI2).to.be.equal(METADATA_URI_2);
    });

    it("should not get metadataUri", async () => {
      await expectRevert(this.tokenContract.getMetadataUri(0), "ERC721Metadata: token does not exist");
    });
  });

  describe("setMetadataUri", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should set metadataUri", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );

      await this.tokenContract.setMetadataUri(0, METADATA_URI_1_UPDATED);

      const tokenURI = await this.tokenContract.getMetadataUri(0);
      expect(tokenURI).to.be.equal(METADATA_URI_1_UPDATED);
    });

    it("should set metadataUri for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_2,
        METADATA_HASH_2,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      await this.tokenContract.setMetadataUri(0, METADATA_URI_1_UPDATED);
      const tokenURI1 = await this.tokenContract.getMetadataUri(0);
      expect(tokenURI1).to.be.equal(METADATA_URI_1_UPDATED);

      await this.tokenContract.setMetadataUri(1, METADATA_URI_2_UPDATED);
      const tokenURI2 = await this.tokenContract.getMetadataUri(1);
      expect(tokenURI2).to.be.equal(METADATA_URI_2_UPDATED);
    });

    it("should not set metadataUri", async () => {
      await expectRevert(
        this.tokenContract.setMetadataUri(0, METADATA_URI_1_UPDATED),
        "ERC721Metadata: token does not exist"
      );
    });
  });

  describe("getMetadataHash", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get metadataHash", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );

      const tokenHash = await this.tokenContract.getMetadataHash(0);
      expect(tokenHash).to.be.equal(METADATA_HASH_1);
    });

    it("should get metadataHash for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_2,
        METADATA_HASH_2,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      const metadataHash1 = await this.tokenContract.getMetadataHash(0);
      expect(metadataHash1).to.be.equal(METADATA_HASH_1);

      const metadataHash2 = await this.tokenContract.getMetadataHash(1);
      expect(metadataHash2).to.be.equal(METADATA_HASH_2);
    });

    it("should not get metadataHash", async () => {
      await expectRevert(this.tokenContract.getMetadataHash(0), "ERC721Metadata: token does not exist");
    });
  });

  describe("setMetadataHash", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should set metadataHash", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );

      await this.tokenContract.setMetadataHash(0, METADATA_HASH_1_UPDATED);

      const tokenURI = await this.tokenContract.getMetadataHash(0);
      expect(tokenURI).to.be.equal(METADATA_HASH_1_UPDATED);
    });

    it("should set metadataHash for multiple minted token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_2,
        METADATA_HASH_2,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      await this.tokenContract.setMetadataHash(0, METADATA_HASH_1_UPDATED);
      const tokenURI1 = await this.tokenContract.getMetadataHash(0);
      expect(tokenURI1).to.be.equal(METADATA_HASH_1_UPDATED);

      await this.tokenContract.setMetadataHash(1, METADATA_HASH_2_UPDATED);
      const tokenURI2 = await this.tokenContract.getMetadataHash(1);
      expect(tokenURI2).to.be.equal(METADATA_HASH_2_UPDATED);
    });

    it("should not set metadataHash", async () => {
      await expectRevert(
        this.tokenContract.setMetadataHash(0, METADATA_HASH_1_UPDATED),
        "ERC721Metadata: token does not exist"
      );
    });
  });

  describe("_burn", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should delete tokenURI and hash on burning", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_1,
        METADATA_HASH_1,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI_2,
        METADATA_HASH_2,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      await this.tokenContract.burn(0);

      // tokenURI and hash for token with id 1 should still exist
      const tokenUri = await this.tokenContract.tokenURI(1);
      expect(tokenUri).to.be.equal(METADATA_URI_2);

      const metadataHash = await this.tokenContract.getMetadataHash(1);
      expect(metadataHash).to.be.equal(METADATA_HASH_2);

      // uri and hash for token with id 0 should be deleted
      await expectRevert(this.tokenContract.tokenURI(0), "ERC721: invalid token ID");
      await expectRevert(this.tokenContract.getMetadataHash(0), "ERC721Metadata: token does not exist");
    });
  });
});
