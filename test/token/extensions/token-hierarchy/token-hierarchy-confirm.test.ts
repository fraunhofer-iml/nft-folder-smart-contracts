/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Token } from '../../../../typechain-types';
import { TOKEN } from '../../../constants';

describe('Token - TokenHierarchy - Confirm', async () => {
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice, bob] = await ethers.getSigners();
  });

  async function mintTokenAndAppendToHierarchy(owner: HardhatEthersSigner, parentIds: number[]) {
    await tokenInstance.mintTokenAndAppendToHierarchy(
      owner,
      TOKEN.asset1.uriInitial,
      TOKEN.asset1.hashInitial,
      TOKEN.metadata1.uriInitial,
      TOKEN.metadata1.hashInitial,
      TOKEN.remoteId1,
      TOKEN.additionalData1.initial,
      parentIds,
    );
  }

  describe('confirmChild', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    async function testParentIds(childId: number, unconfirmedParentIds: number[], confirmedParentIds: number[]) {
      const unconfirmedParentIdsOfAliceBeforeConfirm = await tokenInstance.getParentIds(childId, false);
      expect(unconfirmedParentIdsOfAliceBeforeConfirm).to.be.deep.equal(unconfirmedParentIds);

      const confirmedParentIdsOfAliceBeforeConfirm = await tokenInstance.getParentIds(childId, true);
      expect(confirmedParentIdsOfAliceBeforeConfirm).to.be.deep.equal(confirmedParentIds);
    }

    async function testChildIds(tokenId: number, unconfirmedChildIds: number[], confirmedChildIds: number[]) {
      const unconfirmedChildIdsOfAliceBeforeConfirm = await tokenInstance.getChildIds(tokenId, false);
      expect(unconfirmedChildIdsOfAliceBeforeConfirm).to.be.deep.equal(unconfirmedChildIds);

      const confirmedChildIdsOfAliceBeforeConfirm = await tokenInstance.getChildIds(tokenId, true);
      expect(confirmedChildIdsOfAliceBeforeConfirm).to.be.deep.equal(confirmedChildIds);
    }

    it('should confirm 1 child', async () => {
      const aliceId = 0;
      const bobId = 1;

      await mintTokenAndAppendToHierarchy(alice, []);
      await mintTokenAndAppendToHierarchy(bob, [aliceId]);

      // Test parents of Alice's token
      await testParentIds(aliceId, [], []);

      // Test children of Alice's token
      await testChildIds(aliceId, [bobId], []);

      // Test parents of Bob's token
      await testParentIds(bobId, [aliceId], []);

      // Test children of Bob's token
      await testChildIds(bobId, [], []);

      // ### Alice confirms Bob's token as child of her token ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bobId, aliceId))
        .to.emit(tokenInstance, 'ChildOfParentConfirmed')
        .withArgs(alice, bobId, aliceId);

      // Test parents of Alice's token
      await testParentIds(aliceId, [], []);

      // Test children of Alice's token
      await testChildIds(aliceId, [], [bobId]);

      // Test parents of Bob's token
      await testParentIds(bobId, [], [aliceId]);

      // Test children of Bob's token
      await testChildIds(bobId, [], []);
    });

    it('should confirm 2 children', async () => {
      const aliceId = 0;
      const bob1Id = 1;
      const bob2Id = 2;

      await mintTokenAndAppendToHierarchy(alice, []);
      await mintTokenAndAppendToHierarchy(bob, [aliceId]);
      await mintTokenAndAppendToHierarchy(bob, [aliceId]);

      // Test parents of Alice's token
      await testParentIds(aliceId, [], []);

      // Test children of Alice's token
      await testChildIds(aliceId, [bob1Id, bob2Id], []);

      // Test parents of Bob's tokens
      await testParentIds(bob1Id, [aliceId], []);
      await testParentIds(bob2Id, [aliceId], []);

      // Test children of Bob's tokens
      await testChildIds(bob1Id, [], []);
      await testChildIds(bob2Id, [], []);

      // ### Alice confirms Bob's first token as child of her token ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bob1Id, aliceId))
        .to.emit(tokenInstance, 'ChildOfParentConfirmed')
        .withArgs(alice, bob1Id, aliceId);

      // Test parents of Alice's token
      await testParentIds(aliceId, [], []);

      // Test children of Alice's token
      await testChildIds(aliceId, [bob2Id], [bob1Id]);

      // Test parents of Bob's tokens
      await testParentIds(bob1Id, [], [aliceId]);
      await testParentIds(bob2Id, [aliceId], []);

      // Test children of Bob's tokens
      await testChildIds(bob1Id, [], []);
      await testChildIds(bob2Id, [], []);

      // ### Alice confirms Bob's second token as child of her token ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bob2Id, aliceId))
        .to.emit(tokenInstance, 'ChildOfParentConfirmed')
        .withArgs(alice, bob2Id, aliceId);

      // Test parents of Alice's token
      await testParentIds(aliceId, [], []);

      // Test children of Alice's token
      await testChildIds(aliceId, [], [bob1Id, bob2Id]);

      // Test parents of Bob's tokens
      await testParentIds(bob1Id, [], [aliceId]);
      await testParentIds(bob2Id, [], [aliceId]);

      // Test children of Bob's tokens
      await testChildIds(bob1Id, [], []);
      await testChildIds(bob2Id, [], []);
    });

    it('should not confirm 1 child because tokenId does not exist', async () => {
      const aliceId = 0;
      const bobId = 1;

      // ### Alice tries to confirm Bob's token as child of her token, but her token does not exist ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bobId, aliceId)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });

    it('should not confirm 1 child because childId does not exist', async () => {
      const aliceId = 0;
      const bobId = 1;

      await mintTokenAndAppendToHierarchy(alice, []);

      // ### Alice tries to confirm Bob's token as child of her token, but his token does not exist ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bobId, aliceId)).to.be.revertedWithCustomError(
        tokenInstance,
        'TokenDoesNotExist',
      );
    });

    it('should not confirm 1 child because not allowed', async () => {
      const aliceId = 0;
      const bobId = 1;

      await mintTokenAndAppendToHierarchy(alice, []);
      await mintTokenAndAppendToHierarchy(bob, [aliceId]);

      // ### Bob tries to confirm his token as child of Alice's token, but he's not allowed ###
      await expect(tokenInstance.connect(bob).confirmChildOfParent(bobId, aliceId)).to.be.revertedWithCustomError(
        tokenInstance,
        'UnauthorizedAccess',
      );
    });

    it('should not confirm 1 child because child not found', async () => {
      const aliceId = 0;
      const bobId = 1;

      await mintTokenAndAppendToHierarchy(alice, []);
      await mintTokenAndAppendToHierarchy(bob, []);

      // ### Alice tries to confirm Bob's token as child of her token, but it's not a child ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bobId, aliceId)).to.be.revertedWithCustomError(
        tokenInstance,
        'ChildNotFound',
      );
    });

    it('should not confirm 1 child because child already confirmed', async () => {
      const aliceId = 0;
      const bobId = 1;

      await mintTokenAndAppendToHierarchy(alice, []);
      await mintTokenAndAppendToHierarchy(bob, [aliceId]);

      await tokenInstance.connect(alice).confirmChildOfParent(bobId, aliceId);

      // ### Alice tries to confirm Bob's token as child of her token, but it's already confirmed ###
      await expect(tokenInstance.connect(alice).confirmChildOfParent(bobId, aliceId)).to.be.revertedWithCustomError(
        tokenInstance,
        'ChildAlreadyConfirmed',
      );
    });
  });
});
