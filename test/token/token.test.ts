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
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );
    });

    it('should set all information on token creation', async () => {
      expect((await tokenInstance.getAsset(0)).uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect((await tokenInstance.getAsset(0)).hash).to.be.equal(TOKEN.asset1.hashInitial);
      expect((await tokenInstance.getMetadata(0)).uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect((await tokenInstance.getMetadata(0)).hash).to.be.equal(TOKEN.metadata1.hashInitial);
      expect(await tokenInstance.getRemoteIdByTokenId(0)).to.be.equal(TOKEN.remoteId1);
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0]).to.be.equal(0n);
      expect((await tokenInstance.getTokenIdsByOwner(alice))[0]).to.be.equal(0n);
      expect(await tokenInstance.getAdditionalData(0)).to.be.equal(TOKEN.additionalData1.initial);
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
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      const token = await tokenInstance.getToken(0);
      expect(token.remoteId).to.be.equal(TOKEN.remoteId1);
      expect(token.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(token.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
      expect(token.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(token.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
      expect(token.additionalData).to.be.equal(TOKEN.additionalData1.initial);
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
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await tokenInstance.updateToken(
        0,
        TOKEN.asset2.uriInitial,
        TOKEN.asset2.hashInitial,
        TOKEN.metadata2.uriInitial,
        TOKEN.metadata2.hashInitial,
        TOKEN.additionalData2.initial,
      );

      expect((await tokenInstance.getAsset(0)).uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect((await tokenInstance.getAsset(0)).hash).to.be.equal(TOKEN.asset2.hashInitial);
      expect((await tokenInstance.getMetadata(0)).uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect((await tokenInstance.getMetadata(0)).hash).to.be.equal(TOKEN.metadata2.hashInitial);
      expect(await tokenInstance.getRemoteIdByTokenId(0)).to.be.equal(TOKEN.remoteId1);
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0]).to.be.equal(0n);
      expect((await tokenInstance.getTokenIdsByOwner(alice))[0]).to.be.equal(0n);
      expect(await tokenInstance.getAdditionalData(0)).to.be.equal(TOKEN.additionalData2.initial);
    });

    it('should not update token, because of empty strings', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await tokenInstance.updateToken(0, '', '', '', '', '');

      expect((await tokenInstance.getAsset(0)).uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect((await tokenInstance.getAsset(0)).hash).to.be.equal(TOKEN.asset1.hashInitial);
      expect((await tokenInstance.getMetadata(0)).uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect((await tokenInstance.getMetadata(0)).hash).to.be.equal(TOKEN.metadata1.hashInitial);
      expect(await tokenInstance.getRemoteIdByTokenId(0)).to.be.equal(TOKEN.remoteId1);
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0]).to.be.equal(0n);
      expect((await tokenInstance.getTokenIdsByOwner(alice))[0]).to.be.equal(0n);
      expect(await tokenInstance.getAdditionalData(0)).to.be.equal(TOKEN.additionalData1.initial);
    });
  });
});
