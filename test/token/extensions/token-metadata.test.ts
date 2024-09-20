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

describe('Token - TokenMetadata', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;
  let tokenAddress: string;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getMetadata after mintToken', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should get metadata', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      const metadata = await tokenInstance.getMetadata(0);
      expect(metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
    });

    it('should get metadata for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
      );

      const metadata1 = await tokenInstance.getMetadata(0);
      expect(metadata1.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(metadata1.hash).to.be.equal(TOKEN.metadata1.hashInitial);

      const metadata2 = await tokenInstance.getMetadata(1);
      expect(metadata2.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect(metadata2.hash).to.be.equal(TOKEN.metadata2.hashInitial);
    });

    it('should not get metadata', async () => {
      await expect(tokenInstance.getMetadata(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setMetadataUri', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set metadataUri', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.setMetadataUri(0, TOKEN.metadata1.uriUpdated))
        .to.emit(tokenInstance, 'MetadataUriSet')
        .withArgs(TOKEN.metadata1.uriInitial, TOKEN.metadata1.uriUpdated, alice, tokenAddress, 0);

      const metadata = await tokenInstance.getMetadata(0);
      expect(metadata.uri).to.be.equal(TOKEN.metadata1.uriUpdated);
      expect(metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
    });

    it('should set metadataUri for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
      );

      await expect(tokenInstance.setMetadataUri(0, TOKEN.metadata1.uriUpdated))
        .to.emit(tokenInstance, 'MetadataUriSet')
        .withArgs(TOKEN.metadata1.uriInitial, TOKEN.metadata1.uriUpdated, alice, tokenAddress, 0);

      const metadata1 = await tokenInstance.getMetadata(0);
      expect(metadata1.uri).to.be.equal(TOKEN.metadata1.uriUpdated);
      expect(metadata1.hash).to.be.equal(TOKEN.metadata1.hashInitial);

      await expect(tokenInstance.setMetadataUri(1, TOKEN.metadata2.uriUpdated))
        .to.emit(tokenInstance, 'MetadataUriSet')
        .withArgs(TOKEN.metadata2.uriInitial, TOKEN.metadata2.uriUpdated, alice, tokenAddress, 1);

      const metadata2 = await tokenInstance.getMetadata(1);
      expect(metadata2.uri).to.be.equal(TOKEN.metadata2.uriUpdated);
      expect(metadata2.hash).to.be.equal(TOKEN.metadata2.hashInitial);
    });

    it('should not set metadataUri', async () => {
      await expect(tokenInstance.setMetadataUri(0, TOKEN.metadata1.uriInitial)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });
  });

  describe('setMetadataHash', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set metadataHash', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.setMetadataHash(0, TOKEN.metadata1.hashUpdated))
        .to.emit(tokenInstance, 'MetadataHashSet')
        .withArgs(TOKEN.metadata1.hashInitial, TOKEN.metadata1.hashUpdated, alice, tokenAddress, 0);

      const metadata = await tokenInstance.getMetadata(0);
      expect(metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(metadata.hash).to.be.equal(TOKEN.metadata1.hashUpdated);
    });

    it('should set metadataHash for multiple minted token', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
      );

      await expect(tokenInstance.setMetadataHash(0, TOKEN.metadata1.hashUpdated))
        .to.emit(tokenInstance, 'MetadataHashSet')
        .withArgs(TOKEN.metadata1.hashInitial, TOKEN.metadata1.hashUpdated, alice, tokenAddress, 0);

      const metadata1 = await tokenInstance.getMetadata(0);
      expect(metadata1.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(metadata1.hash).to.be.equal(TOKEN.metadata1.hashUpdated);

      await expect(tokenInstance.setMetadataHash(1, TOKEN.metadata2.hashUpdated))
        .to.emit(tokenInstance, 'MetadataHashSet')
        .withArgs(TOKEN.metadata2.hashInitial, TOKEN.metadata2.hashUpdated, alice, tokenAddress, 1);

      const metadata2 = await tokenInstance.getMetadata(1);
      expect(metadata2.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect(metadata2.hash).to.be.equal(TOKEN.metadata2.hashUpdated);
    });

    it('should not set metadataHash', async () => {
      await expect(tokenInstance.setMetadataHash(0, TOKEN.metadata1.hashInitial)).to.be.revertedWithCustomError(
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
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should delete tokenURI and hash on burning', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.remoteId2,
        TOKEN.additionalData2.initial,
      );

      await tokenInstance.burn(0);

      // tokenURI and hash for token with id 1 should still exist
      const tokenUri = await tokenInstance.tokenURI(1);
      expect(tokenUri).to.be.equal(TOKEN.metadata2.uriInitial);

      const metadata = await tokenInstance.getMetadata(1);
      expect(metadata.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect(metadata.hash).to.be.equal(TOKEN.metadata2.hashInitial);

      // uri and hash for token with id 0 should be deleted
      await expect(tokenInstance.tokenURI(0)).to.be.revertedWithCustomError(tokenInstance, 'ERC721NonexistentToken');

      await expect(tokenInstance.getMetadata(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });
});
