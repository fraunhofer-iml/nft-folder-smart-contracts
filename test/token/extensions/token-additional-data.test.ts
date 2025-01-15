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

import { Token } from '../../../typechain-types';
import { TOKEN } from '../../constants';

describe('Token - TokenAdditionalData', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;
  let tokenAddress: string;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getAdditionalData after minToken', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should get additional data', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      const additionalData = (await tokenInstance.getToken(0)).tokenData.additionalData;
      expect(additionalData).to.be.equal(TOKEN.additionalData1.initial);
    });

    it('should get different additional data for different tokens', async () => {
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

      const additionalData1 = (await tokenInstance.getToken(0)).tokenData.additionalData;
      expect(additionalData1).to.be.equal(TOKEN.additionalData1.initial);

      const additionalData2 = (await tokenInstance.getToken(1)).tokenData.additionalData;
      expect(additionalData2).to.be.equal(TOKEN.additionalData2.initial);
    });

    it('should not get additional data', async () => {
      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });

  describe('setAdditionalData', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
      tokenAddress = await tokenInstance.getAddress();
    });

    it('should set additional data', async () => {
      await tokenInstance.mintToken(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
      );

      await expect(tokenInstance.updateToken(0, '', '', '', '', TOKEN.additionalData1.updated))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const additionalData = (await tokenInstance.getToken(0)).tokenData.additionalData;
      expect(additionalData).to.be.equal(TOKEN.additionalData1.updated);
    });

    it('should get different additional data for different tokens', async () => {
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

      await expect(tokenInstance.updateToken(0, '', '', '', '', TOKEN.additionalData1.updated))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 0);

      const additionalData1 = (await tokenInstance.getToken(0)).tokenData.additionalData;
      expect(additionalData1).to.be.equal(TOKEN.additionalData1.updated);

      await expect(tokenInstance.updateToken(1, '', '', '', '', TOKEN.additionalData2.updated))
        .to.emit(tokenInstance, 'TokenUpdate')
        .withArgs(alice, tokenAddress, 1);

      const additionalData2 = (await tokenInstance.getToken(1)).tokenData.additionalData;
      expect(additionalData2).to.be.equal(TOKEN.additionalData2.updated);
    });

    it('should not set additional data', async () => {
      await expect(
        tokenInstance.updateToken(0, '', '', '', '', TOKEN.additionalData1.initial),
      ).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
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

    it('should delete additionalData on burning', async () => {
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

      // additionalData for token with id 1 should still exist
      const additionalData2 = (await tokenInstance.getToken(1)).tokenData.additionalData;
      expect(additionalData2).to.be.equal(TOKEN.additionalData2.initial);

      // additionalData for token with id 0 should be deleted
      await expect(tokenInstance.getToken(0)).to.be.revertedWithCustomError(tokenInstance, 'TokenDoesNotExist');
    });
  });
});
