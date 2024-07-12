/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Token } from '../../typechain-types';
import { TOKEN } from '../constants';

describe('Token', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('is Ownable', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should have a owner', async () => {
      const owner = await tokenInstance.owner();
      expect(owner).to.be.not.null;
      expect(owner).to.be.equal(alice);
    });
  });

  describe('has all extensions', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
    });

    it('should set all information on token creation', async () => {
      expect(await tokenInstance.getAssetUri(0)).to.be.equal(TOKEN.asset1.uri);
      expect(await tokenInstance.getAssetHash(0)).to.be.equal(TOKEN.asset1.hash);
      expect(await tokenInstance.tokenURI(0)).to.be.equal(TOKEN.metadata1.uri);
      expect(await tokenInstance.getMetadataHash(0)).to.be.equal(TOKEN.metadata1.hash);
      expect(await tokenInstance.getRemoteId(0)).to.be.equal(TOKEN.remoteId1);
      expect(await tokenInstance.getTokenId(TOKEN.remoteId1)).to.be.equal('0');
      expect(await tokenInstance.getAdditionalInformation(0)).to.be.equal(TOKEN.additionalInformation1.initial);
    });

    it('should be burnable', async () => {
      await tokenInstance.burn(0);
      const balance = await tokenInstance.balanceOf(alice);
      expect(balance).to.be.equal('0');
    });
  });

  describe('name is setable', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should have given name and symbol', async () => {
      const name = await tokenInstance.name();
      expect(name).to.be.equal(TOKEN.token1.name);

      const symbol = await tokenInstance.symbol();
      expect(symbol).to.be.equal(TOKEN.token1.symbol);
    });
  });

  describe('getToken', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get token', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const token = await tokenInstance.getToken(0);
      expect(token.assetUri).to.be.equal(TOKEN.asset1.uri);
      expect(token.assetHash).to.be.equal(TOKEN.asset1.hash);
      expect(token.metadataUri).to.be.equal(TOKEN.metadata1.uri);
      expect(token.metadataHash).to.be.equal(TOKEN.metadata1.hash);
      expect(token.additionalInformation).to.be.equal(TOKEN.additionalInformation1.initial);
    });

    it('should not get token, because tokenId does not exist', async () => {
      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('updateToken', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should update token', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.updateToken(
        0,
        TOKEN.asset2.uri,
        TOKEN.asset2.hash,
        TOKEN.metadata2.uri,
        TOKEN.metadata2.hash,
        TOKEN.additionalInformation2.initial,
      );

      expect(await tokenInstance.getAssetUri(0)).to.be.equal(TOKEN.asset2.uri);
      expect(await tokenInstance.getAssetHash(0)).to.be.equal(TOKEN.asset2.hash);
      expect(await tokenInstance.tokenURI(0)).to.be.equal(TOKEN.metadata2.uri);
      expect(await tokenInstance.getMetadataHash(0)).to.be.equal(TOKEN.metadata2.hash);
      expect(await tokenInstance.getRemoteId(0)).to.be.equal(TOKEN.remoteId1);
      expect(await tokenInstance.getTokenId(TOKEN.remoteId1)).to.be.equal('0');
      expect(await tokenInstance.getAdditionalInformation(0)).to.be.equal(TOKEN.additionalInformation2.initial);
    });

    it('should not update token, because of empty strings', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.updateToken(0, '', '', '', '', '');

      expect(await tokenInstance.getAssetUri(0)).to.be.equal(TOKEN.asset1.uri);
      expect(await tokenInstance.getAssetHash(0)).to.be.equal(TOKEN.asset1.hash);
      expect(await tokenInstance.tokenURI(0)).to.be.equal(TOKEN.metadata1.uri);
      expect(await tokenInstance.getMetadataHash(0)).to.be.equal(TOKEN.metadata1.hash);
      expect(await tokenInstance.getRemoteId(0)).to.be.equal(TOKEN.remoteId1);
      expect(await tokenInstance.getTokenId(TOKEN.remoteId1)).to.be.equal('0');
      expect(await tokenInstance.getAdditionalInformation(0)).to.be.equal(TOKEN.additionalInformation1.initial);
    });
  });
});
