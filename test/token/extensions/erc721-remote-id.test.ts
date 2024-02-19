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

describe('Token - Extension ERC721RemoteId', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('getRemoteId', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [TOKEN.token1.name, TOKEN.token1.symbol]);
    });

    it('should get remote id', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const remoteId = await tokenInstance.getRemoteId(0);
      expect(remoteId).to.be.equal(TOKEN.remoteId1);
    });

    it('should get different remote ids for different tokens', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const remoteId1 = await tokenInstance.getRemoteId(0);
      expect(remoteId1).to.be.equal(TOKEN.remoteId1);

      const remoteId2 = await tokenInstance.getRemoteId(1);
      expect(remoteId2).to.be.equal(TOKEN.remoteId2);
    });

    it('should not get remote id', async () => {
      await expect(tokenInstance.getRemoteId(0)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenIdDoesNotExist',
      );
    });
  });

  describe('getTokenId', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [TOKEN.token1.name, TOKEN.token1.symbol]);
    });

    it('should get token id', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );

      const tokenId = await tokenInstance.getTokenId(TOKEN.remoteId1);
      expect(tokenId).to.be.equal('0');
    });

    it('should get different token ids for different tokens', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        TOKEN.metadata1.uri,
        TOKEN.metadata1.hash,
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      const tokenId1 = await tokenInstance.getTokenId(TOKEN.remoteId1);
      expect(tokenId1).to.be.equal('0');

      const tokenId2 = await tokenInstance.getTokenId(TOKEN.remoteId2);
      expect(tokenId2).to.be.equal('1');
    });

    it('should not get token id', async () => {
      await expect(tokenInstance.getTokenId(TOKEN.remoteId1)).to.be.revertedWithCustomError(
        tokenInstance,
        'RemoteIdDoesNotExist',
      );
    });
  });

  describe('_burn', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [TOKEN.token1.name, TOKEN.token1.symbol]);
    });

    it('should delete ids on burning', async () => {
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        '1',
        '1',
        TOKEN.remoteId1,
        TOKEN.additionalInformation1.initial,
      );
      await tokenInstance.safeMint(
        alice,
        TOKEN.asset1.uri,
        TOKEN.asset1.hash,
        '2',
        '2',
        TOKEN.remoteId2,
        TOKEN.additionalInformation1.initial,
      );

      await tokenInstance.burn(0);

      // ids for token with id 1 should still exist
      const remoteId2 = await tokenInstance.getRemoteId(1);
      expect(remoteId2).to.be.equal(TOKEN.remoteId2);
      const tokenId2 = await tokenInstance.getTokenId(TOKEN.remoteId2);
      expect(tokenId2).to.be.equal('1');

      // ids for token with id 0 should be deleted
      await expect(tokenInstance.getRemoteId(0)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenIdDoesNotExist',
      );
      await expect(tokenInstance.getTokenId(TOKEN.remoteId1)).to.be.revertedWithCustomError(
        tokenInstance,
        'RemoteIdDoesNotExist',
      );
    });
  });
});
