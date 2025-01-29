/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
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
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );
    });

    it('should set all information on token creation', async () => {
      expect((await tokenInstance.tokenIdWithTokenData(0)).asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect((await tokenInstance.tokenIdWithTokenData(0)).asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
      expect((await tokenInstance.tokenIdWithTokenData(0)).metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect((await tokenInstance.tokenIdWithTokenData(0)).metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
      expect(await tokenInstance.getRemoteIdByTokenId(0)).to.be.equal(TOKEN.remoteId1);
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0]).to.be.equal(0n);
      expect((await tokenInstance.getTokenIdsByOwner(alice))[0]).to.be.equal(0n);
      expect((await tokenInstance.tokenIdWithTokenData(0)).additionalData).to.be.equal(TOKEN.additionalData1.initial);
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
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );

      const token = await tokenInstance.getToken(0);
      expect(token.remoteId).to.be.equal(TOKEN.remoteId1);
      expect(token.tokenData.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect(token.tokenData.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
      expect(token.tokenData.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect(token.tokenData.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
      expect(token.tokenData.additionalData).to.be.equal(TOKEN.additionalData1.initial);
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
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
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

      expect((await tokenInstance.tokenIdWithTokenData(0)).asset.uri).to.be.equal(TOKEN.asset2.uriInitial);
      expect((await tokenInstance.tokenIdWithTokenData(0)).asset.hash).to.be.equal(TOKEN.asset2.hashInitial);
      expect((await tokenInstance.tokenIdWithTokenData(0)).metadata.uri).to.be.equal(TOKEN.metadata2.uriInitial);
      expect((await tokenInstance.tokenIdWithTokenData(0)).metadata.hash).to.be.equal(TOKEN.metadata2.hashInitial);
      expect(await tokenInstance.getRemoteIdByTokenId(0)).to.be.equal(TOKEN.remoteId1);
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0]).to.be.equal(0n);
      expect((await tokenInstance.getTokenIdsByOwner(alice))[0]).to.be.equal(0n);
      expect((await tokenInstance.tokenIdWithTokenData(0)).additionalData).to.be.equal(TOKEN.additionalData2.initial);
    });

    it('should not update token, because of empty strings', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.remoteId1,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.additionalData1.initial,
      );

      await tokenInstance.updateToken(0, '', '', '', '', '');

      expect((await tokenInstance.getToken(0)).tokenData.asset.uri).to.be.equal(TOKEN.asset1.uriInitial);
      expect((await tokenInstance.getToken(0)).tokenData.asset.hash).to.be.equal(TOKEN.asset1.hashInitial);
      expect((await tokenInstance.getToken(0)).tokenData.metadata.uri).to.be.equal(TOKEN.metadata1.uriInitial);
      expect((await tokenInstance.getToken(0)).tokenData.metadata.hash).to.be.equal(TOKEN.metadata1.hashInitial);
      expect(await tokenInstance.getRemoteIdByTokenId(0)).to.be.equal(TOKEN.remoteId1);
      expect((await tokenInstance.getTokenIdsByRemoteId(TOKEN.remoteId1))[0]).to.be.equal(0n);
      expect((await tokenInstance.getTokenIdsByOwner(alice))[0]).to.be.equal(0n);
      expect((await tokenInstance.getToken(0)).tokenData.additionalData).to.be.equal(TOKEN.additionalData1.initial);
    });
  });
});
