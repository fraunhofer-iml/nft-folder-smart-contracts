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
  const ADDITIONAL_INFO = "additional";

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
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, METADATA_URI, METADATA_HASH, ADDITIONAL_INFO);
    });

    it("should set all information on token creation", async () => {
      expect(await this.tokenContract.getAssetUri(0)).to.be.equal(ASSET_URI);
      expect(await this.tokenContract.getAssetHash(0)).to.be.equal(ASSET_HASH);
      expect(await this.tokenContract.tokenURI(0)).to.be.equal(METADATA_URI);
      expect(await this.tokenContract.getMetadataHash(0)).to.be.equal(METADATA_HASH);
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
});
