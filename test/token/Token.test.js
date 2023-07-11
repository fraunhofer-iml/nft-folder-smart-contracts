/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

require("@openzeppelin/test-helpers");

const { expect } = require("chai");
const Token = artifacts.require("Token");

contract("Token", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI = "assert_Uri";
  const ASSET_HASH = "asset_hash";
  const METADATA_URI = "meta_uri";
  const METADATA_HASH = "meta_hash";
  const REMOTE_ID = "20d62095-4a82-4dec-9d93-5073ebe2b269";
  const ADDITIONAL_INFO = "additional";

  const ASSET_URI2 = "assert_Uri2";
  const ASSET_HASH2 = "asset_hash2";
  const METADATA_URI2 = "meta_uri2";
  const METADATA_HASH2 = "meta_hash2";
  const ADDITIONAL_INFO2 = "additional_Information2";

  describe("is Ownable", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should have a owner", async () => {
      const owner = await this.tokenContract.owner();
      expect(owner).to.be.not.null;
      expect(owner).to.be.equal(ALICE);
    });
  });

  describe("has all extensions", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );
    });

    it("should set all information on token creation", async () => {
      expect(await this.tokenContract.getAssetUri(0)).to.be.equal(ASSET_URI);
      expect(await this.tokenContract.getAssetHash(0)).to.be.equal(ASSET_HASH);
      expect(await this.tokenContract.tokenURI(0)).to.be.equal(METADATA_URI);
      expect(await this.tokenContract.getMetadataHash(0)).to.be.equal(METADATA_HASH);
      expect(await this.tokenContract.getRemoteId(0)).to.be.equal(REMOTE_ID);
      expect(await this.tokenContract.getTokenId(REMOTE_ID)).to.be.bignumber.equal("0");
      expect(await this.tokenContract.getAdditionalInformation(0)).to.be.equal(ADDITIONAL_INFO);
    });

    it("should be burnable", async () => {
      await this.tokenContract.burn(0);
      const balance = await this.tokenContract.balanceOf(ALICE);
      expect(balance).to.be.bignumber.equal("0");
    });
  });

  describe("name is setable", function () {
    const NAME = "Token";
    const SYMBOL = "TKN";

    beforeEach(async () => {
      this.tokenContract = await Token.new(NAME, SYMBOL);
    });

    it("should have given name and symbol", async () => {
      const name = await this.tokenContract.name();
      expect(name).to.be.equal(NAME);

      const symbol = await this.tokenContract.symbol();
      expect(symbol).to.be.equal(SYMBOL);
    });
  });

  describe("updateToken", function () {
    const NAME = "Token";
    const SYMBOL = "TKN";

    beforeEach(async () => {
      this.tokenContract = await Token.new(NAME, SYMBOL);
    });

    it("should update token", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      await this.tokenContract.updateToken(0, ASSET_URI2, ASSET_HASH2, METADATA_URI2, METADATA_HASH2, ADDITIONAL_INFO2);

      expect(await this.tokenContract.getAssetUri(0)).to.be.equal(ASSET_URI2);
      expect(await this.tokenContract.getAssetHash(0)).to.be.equal(ASSET_HASH2);
      expect(await this.tokenContract.tokenURI(0)).to.be.equal(METADATA_URI2);
      expect(await this.tokenContract.getMetadataHash(0)).to.be.equal(METADATA_HASH2);
      expect(await this.tokenContract.getRemoteId(0)).to.be.equal(REMOTE_ID);
      expect(await this.tokenContract.getTokenId(REMOTE_ID)).to.be.bignumber.equal("0");
      expect(await this.tokenContract.getAdditionalInformation(0)).to.be.equal(ADDITIONAL_INFO2);
    });

    it("should not update token, because of empty strings", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID,
        ADDITIONAL_INFO
      );

      await this.tokenContract.updateToken(0, "", "", "", "", "");

      expect(await this.tokenContract.getAssetUri(0)).to.be.equal(ASSET_URI);
      expect(await this.tokenContract.getAssetHash(0)).to.be.equal(ASSET_HASH);
      expect(await this.tokenContract.tokenURI(0)).to.be.equal(METADATA_URI);
      expect(await this.tokenContract.getMetadataHash(0)).to.be.equal(METADATA_HASH);
      expect(await this.tokenContract.getRemoteId(0)).to.be.equal(REMOTE_ID);
      expect(await this.tokenContract.getTokenId(REMOTE_ID)).to.be.bignumber.equal("0");
      expect(await this.tokenContract.getAdditionalInformation(0)).to.be.equal(ADDITIONAL_INFO);
    });
  });
});
