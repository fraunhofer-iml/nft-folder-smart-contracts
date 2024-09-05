/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Token } from '../../../typechain-types';
import { TOKEN } from '../../constants';

describe('Token - Extension ERC721Metadata', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getMetadataUri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get metadataUri', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const tokenURI = await tokenInstance.getMetadataUri(0);
      expect(tokenURI).to.be.equal(TOKEN.metadata1.uri);
    });

    it('should get metadataUri for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata2.uri,
        TOKEN.metadata2.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const tokenURI1 = await tokenInstance.getMetadataUri(0);
      expect(tokenURI1).to.be.equal(TOKEN.metadata1.uri);

      const tokenURI2 = await tokenInstance.getMetadataUri(1);
      expect(tokenURI2).to.be.equal(TOKEN.metadata2.uri);
    });

    it('should not get metadataUri', async () => {
      await expect(tokenInstance.getMetadataUri(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setMetadataUri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should set metadataUri', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setMetadataUri(0, TOKEN.metadata1.uriUpdated);

      const tokenURI = await tokenInstance.getMetadataUri(0);
      expect(tokenURI).to.be.equal(TOKEN.metadata1.uriUpdated);
    });

    it('should set metadataUri for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata2.uri,
        TOKEN.metadata2.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setMetadataUri(0, TOKEN.metadata1.uriUpdated);
      const tokenURI1 = await tokenInstance.getMetadataUri(0);
      expect(tokenURI1).to.be.equal(TOKEN.metadata1.uriUpdated);

      await tokenInstance.setMetadataUri(1, TOKEN.metadata2.uriUpdated);
      const tokenURI2 = await tokenInstance.getMetadataUri(1);
      expect(tokenURI2).to.be.equal(TOKEN.metadata2.uriUpdated);
    });

    it('should not set metadataUri', async () => {
      await expect(tokenInstance.setMetadataUri(0, TOKEN.metadata1.uri)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });
  });

  describe('getMetadataHash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should get metadataHash', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const tokenHash = await tokenInstance.getMetadataHash(0);
      expect(tokenHash).to.be.equal(TOKEN.metadata1.hash);
    });

    it('should get metadataHash for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata2.uri,
        TOKEN.metadata2.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const metadataHash1 = await tokenInstance.getMetadataHash(0);
      expect(metadataHash1).to.be.equal(TOKEN.metadata1.hash);

      const metadataHash2 = await tokenInstance.getMetadataHash(1);
      expect(metadataHash2).to.be.equal(TOKEN.metadata2.hash);
    });

    it('should not get metadataHash', async () => {
      await expect(tokenInstance.getMetadataHash(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setMetadataHash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should set metadataHash', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setMetadataHash(0, TOKEN.metadata1.hashUpdated);

      const tokenURI = await tokenInstance.getMetadataHash(0);
      expect(tokenURI).to.be.equal(TOKEN.metadata1.hashUpdated);
    });

    it('should set metadataHash for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata2.uri,
        TOKEN.metadata2.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.setMetadataHash(0, TOKEN.metadata1.hashUpdated);
      const tokenURI1 = await tokenInstance.getMetadataHash(0);
      expect(tokenURI1).to.be.equal(TOKEN.metadata1.hashUpdated);

      await tokenInstance.setMetadataHash(1, TOKEN.metadata2.hashUpdated);
      const tokenURI2 = await tokenInstance.getMetadataHash(1);
      expect(tokenURI2).to.be.equal(TOKEN.metadata2.hashUpdated);
    });

    it('should not set metadataHash', async () => {
      await expect(tokenInstance.setMetadataHash(0, TOKEN.metadata1.hash)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });
  });

  describe('_burn', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should delete tokenURI and hash on burning', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata2.uri,
        TOKEN.metadata2.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.burn(0);

      // tokenURI and hash for token with id 1 should still exist
      const tokenUri = await tokenInstance.tokenURI(1);
      expect(tokenUri).to.be.equal(TOKEN.metadata2.uri);

      const metadataHash = await tokenInstance.getMetadataHash(1);
      expect(metadataHash).to.be.equal(TOKEN.metadata2.hash);

      // uri and hash for token with id 0 should be deleted
      await expect(tokenInstance.tokenURI(0)).to.be.revertedWithCustomError(tokenInstance, 'ERC721NonexistentToken');

      await expect(tokenInstance.getMetadataHash(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });
});
