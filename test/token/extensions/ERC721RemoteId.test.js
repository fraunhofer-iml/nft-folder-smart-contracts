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

contract("Token - Extension ERC721RemoteId", function (accounts) {
  const [ALICE] = accounts;
  const ASSET_URI = "asset_uri";
  const ASSET_HASH = "asset_hash";
  const METADATA_URI = "meta_uri";
  const METADATA_HASH = "meta_hash";
  const REMOTE_ID_1 = "20d62095-4a82-4dec-9d93-5073ebe2b269";
  const REMOTE_ID_2 = "5cd1af82-8652-4502-adf5-f1e2cc0c6964";
  const ADDITIONAL_INFO = "additional_info";

  describe("getRemoteId", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get remote id", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );

      const remoteId = await this.tokenContract.getRemoteId(0);
      expect(remoteId).to.be.equal(REMOTE_ID_1);
    });

    it("should get different remote ids for different tokens", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      const remoteId1 = await this.tokenContract.getRemoteId(0);
      expect(remoteId1).to.be.equal(REMOTE_ID_1);

      const remoteId2 = await this.tokenContract.getRemoteId(1);
      expect(remoteId2).to.be.equal(REMOTE_ID_2);
    });
  });

  describe("getTokenId", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should get token id", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );

      const tokenId = await this.tokenContract.getTokenId(0);
      expect(tokenId).to.be.bignumber.equal("0");
    });

    it("should get different token ids for different tokens", async () => {
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_1,
        ADDITIONAL_INFO
      );
      await this.tokenContract.safeMint(
        ALICE,
        ASSET_URI,
        ASSET_HASH,
        METADATA_URI,
        METADATA_HASH,
        REMOTE_ID_2,
        ADDITIONAL_INFO
      );

      const tokenId1 = await this.tokenContract.getTokenId(REMOTE_ID_1);
      expect(tokenId1).to.be.bignumber.equal("0");

      const tokenId2 = await this.tokenContract.getTokenId(REMOTE_ID_2);
      expect(tokenId2).to.be.bignumber.equal("1");
    });
  });

  describe("_burn", function () {
    beforeEach(async () => {
      this.tokenContract = await Token.new("Token", "TKN");
    });

    it("should delete ids on burning", async () => {
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, "1", "1", REMOTE_ID_1, ADDITIONAL_INFO);
      await this.tokenContract.safeMint(ALICE, ASSET_URI, ASSET_HASH, "2", "2", REMOTE_ID_2, ADDITIONAL_INFO);

      await this.tokenContract.burn(0);

      // ids for token with id 1 should still exist
      const remoteId2 = await this.tokenContract.getRemoteId(1);
      expect(remoteId2).to.be.equal(REMOTE_ID_2);
      const tokenId2 = await this.tokenContract.getTokenId(REMOTE_ID_2);
      expect(tokenId2).to.be.bignumber.equal("1");

      // ids for token with id 0 should be deleted
      await expectRevert(this.tokenContract.getRemoteId(0), "ERC721RemoteId: token does not exist");
      await expectRevert(this.tokenContract.getTokenId(REMOTE_ID_1), "ERC721RemoteId: token does not exist");
    });
  });
});
