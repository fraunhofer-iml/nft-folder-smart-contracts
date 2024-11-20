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

describe('Token - TokenHierarchy - Append', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  async function mintTokenAndAppendToHierarchy(parentIds: number[], expectedTokenId: number) {
    await expect(
      tokenInstance.mintTokenAndAppendToHierarchy(
        alice,
        TOKEN.asset1.uriInitial,
        TOKEN.asset1.hashInitial,
        TOKEN.metadata1.uriInitial,
        TOKEN.metadata1.hashInitial,
        TOKEN.remoteId1,
        TOKEN.additionalData1.initial,
        parentIds,
      ),
    )
      .to.emit(tokenInstance, 'NodeAppendedToHierarchy')
      .withArgs(expectedTokenId, parentIds);
  }

  describe('mintTokenAndAppendToHierarchy - 1 hierarchy', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should mint 1 root token', async () => {
      const rootId = 0;

      await mintTokenAndAppendToHierarchy([], rootId);

      const node = await tokenInstance.getNode(rootId);
      expect(node.exists).to.be.true;
      expect(node.childIds).to.be.empty;
      expect(node.parentIds).to.be.empty;

      const confirmedParentIds = await tokenInstance.getParentIds(rootId, true);
      expect(confirmedParentIds).to.be.empty;

      const unconfirmedParentIds = await tokenInstance.getParentIds(rootId, false);
      expect(unconfirmedParentIds).to.be.empty;
    });

    it('should mint 1 root token and 1 leaf token', async () => {
      const rootId = 0;
      const leafId = 1;

      await mintTokenAndAppendToHierarchy([], rootId);
      await mintTokenAndAppendToHierarchy([rootId], leafId);

      // Test root
      const root = await tokenInstance.getNode(rootId);
      expect(root.childIds).to.be.deep.equal([leafId]);
      expect(root.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot = await tokenInstance.getParentIds(rootId, true);
      expect(confirmedParentIdsOfRoot).to.be.empty;

      const unconfirmedParentIdsOfRoot = await tokenInstance.getParentIds(rootId, false);
      expect(unconfirmedParentIdsOfRoot).to.be.empty;

      // Test leaf
      const leaf = await tokenInstance.getNode(leafId);
      expect(leaf.childIds).to.be.empty;
      expect(leaf.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfLeaf = await tokenInstance.getParentIds(leafId, true);
      expect(confirmedParentIdsOfLeaf).to.be.empty;

      const unconfirmedParentIdsOfLeaf = await tokenInstance.getParentIds(leafId, false);
      expect(unconfirmedParentIdsOfLeaf).to.be.deep.equal([rootId]);
    });

    it('should mint 1 root token and 2 leaf token', async () => {
      const rootId = 0;
      const leaf1Id = 1;
      const leaf2Id = 2;

      await mintTokenAndAppendToHierarchy([], rootId);
      await mintTokenAndAppendToHierarchy([rootId], leaf1Id);
      await mintTokenAndAppendToHierarchy([rootId], leaf2Id);

      // Test root
      const root = await tokenInstance.getNode(rootId);
      expect(root.childIds).to.be.deep.equal([leaf1Id, leaf2Id]);
      expect(root.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot = await tokenInstance.getParentIds(rootId, true);
      expect(confirmedParentIdsOfRoot).to.be.empty;

      const unconfirmedParentIdsOfRoot = await tokenInstance.getParentIds(rootId, false);
      expect(unconfirmedParentIdsOfRoot).to.be.empty;

      // Test leaf1
      const leaf1 = await tokenInstance.getNode(leaf1Id);
      expect(leaf1.childIds).to.be.empty;
      expect(leaf1.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfLeaf1 = await tokenInstance.getParentIds(leaf1Id, true);
      expect(confirmedParentIdsOfLeaf1).to.be.empty;

      const unconfirmedParentIdsOfLeaf1 = await tokenInstance.getParentIds(leaf1Id, false);
      expect(unconfirmedParentIdsOfLeaf1).to.be.deep.equal([rootId]);

      // Test leaf2
      const leaf2 = await tokenInstance.getNode(leaf2Id);
      expect(leaf2.childIds).to.be.empty;
      expect(leaf2.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfLeaf2 = await tokenInstance.getParentIds(leaf2Id, true);
      expect(confirmedParentIdsOfLeaf2).to.be.empty;

      const unconfirmedParentIdsOfLeaf2 = await tokenInstance.getParentIds(leaf2Id, false);
      expect(unconfirmedParentIdsOfLeaf2).to.be.deep.equal([rootId]);
    });

    it('should mint 1 root token and 1 intermediate token and 1 leaf token', async () => {
      const rootId = 0;
      const intermediateId = 1;
      const leafId = 2;

      await mintTokenAndAppendToHierarchy([], rootId);
      await mintTokenAndAppendToHierarchy([rootId], intermediateId);
      await mintTokenAndAppendToHierarchy([intermediateId], leafId);

      // Test root
      const root = await tokenInstance.getNode(rootId);
      expect(root.childIds).to.be.deep.equal([intermediateId]);
      expect(root.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot = await tokenInstance.getParentIds(rootId, true);
      expect(confirmedParentIdsOfRoot).to.be.empty;

      const unconfirmedParentIdsOfRoot = await tokenInstance.getParentIds(rootId, false);
      expect(unconfirmedParentIdsOfRoot).to.be.empty;

      // Test intermediate
      const intermediate = await tokenInstance.getNode(intermediateId);
      expect(intermediate.childIds).to.be.deep.equal([leafId]);
      expect(intermediate.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfIntermediate = await tokenInstance.getParentIds(intermediateId, true);
      expect(confirmedParentIdsOfIntermediate).to.be.empty;

      const unconfirmedParentIdsOfIntermediate = await tokenInstance.getParentIds(intermediateId, false);
      expect(unconfirmedParentIdsOfIntermediate).to.be.deep.equal([rootId]);

      // Test leaf
      const leaf = await tokenInstance.getNode(leafId);
      expect(leaf.childIds).to.be.empty;
      expect(leaf.parentIds).to.be.deep.equal([intermediateId]);

      const confirmedParentIdsOfLeaf = await tokenInstance.getParentIds(leafId, true);
      expect(confirmedParentIdsOfLeaf).to.be.empty;

      const unconfirmedParentIdsOfLeaf = await tokenInstance.getParentIds(leafId, false);
      expect(unconfirmedParentIdsOfLeaf).to.be.deep.equal([intermediateId]);
    });
  });

  describe('mintTokenAndAppendToHierarchy - 2 hierarchies', function () {
    beforeEach(async () => {
      tokenInstance = await ethers.deployContract('Token', [
        await alice.getAddress(),
        TOKEN.token1.name,
        TOKEN.token1.symbol,
      ]);
    });

    it('should mint 2 root tokens', async () => {
      const root1Id = 0;
      const root2Id = 1;

      await mintTokenAndAppendToHierarchy([], root1Id);
      await mintTokenAndAppendToHierarchy([], root2Id);

      // Test root1
      const root1 = await tokenInstance.getNode(root1Id);
      expect(root1.childIds).to.be.empty;
      expect(root1.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot1 = await tokenInstance.getParentIds(root1Id, true);
      expect(confirmedParentIdsOfRoot1).to.be.empty;

      const unconfirmedParentIdsOfRoot1 = await tokenInstance.getParentIds(root1Id, false);
      expect(unconfirmedParentIdsOfRoot1).to.be.empty;

      // Test root2
      const root2 = await tokenInstance.getNode(root2Id);
      expect(root2.childIds).to.be.empty;
      expect(root2.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot2 = await tokenInstance.getParentIds(root2Id, true);
      expect(confirmedParentIdsOfRoot2).to.be.empty;

      const unconfirmedParentIdsOfRoot2 = await tokenInstance.getParentIds(root2Id, false);
      expect(unconfirmedParentIdsOfRoot2).to.be.empty;
    });

    it('should mint 2 root token and 2 leaf token', async () => {
      const root1Id = 0;
      const leaf1Id = 1;
      const root2Id = 2;
      const leaf2Id = 3;

      await mintTokenAndAppendToHierarchy([], root1Id);
      await mintTokenAndAppendToHierarchy([root1Id], leaf1Id);
      await mintTokenAndAppendToHierarchy([], root2Id);
      await mintTokenAndAppendToHierarchy([root2Id], leaf2Id);

      // Test root1 (hierarchy1)
      const root1 = await tokenInstance.getNode(root1Id);
      expect(root1.childIds).to.be.deep.equal([leaf1Id]);
      expect(root1.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot1 = await tokenInstance.getParentIds(root1Id, true);
      expect(confirmedParentIdsOfRoot1).to.be.empty;

      const unconfirmedParentIdsOfRoot1 = await tokenInstance.getParentIds(root1Id, false);
      expect(unconfirmedParentIdsOfRoot1).to.be.empty;

      // Test leaf1 (hierarchy1)
      const leaf1 = await tokenInstance.getNode(leaf1Id);
      expect(leaf1.childIds).to.be.empty;
      expect(leaf1.parentIds).to.be.deep.equal([root1Id]);

      const confirmedParentIdsOfLeaf1 = await tokenInstance.getParentIds(leaf1Id, true);
      expect(confirmedParentIdsOfLeaf1).to.be.empty;

      const unconfirmedParentIdsOfLeaf1 = await tokenInstance.getParentIds(leaf1Id, false);
      expect(unconfirmedParentIdsOfLeaf1).to.be.deep.equal([root1Id]);

      // Test root2 (hierarchy2)
      const root2 = await tokenInstance.getNode(root2Id);
      expect(root2.childIds).to.be.deep.equal([leaf2Id]);
      expect(root2.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot2 = await tokenInstance.getParentIds(root2Id, true);
      expect(confirmedParentIdsOfRoot2).to.be.empty;

      const unconfirmedParentIdsOfRoot2 = await tokenInstance.getParentIds(root2Id, false);
      expect(unconfirmedParentIdsOfRoot2).to.be.empty;

      // Test leaf2 (hierarchy2)
      const leaf2 = await tokenInstance.getNode(leaf2Id);
      expect(leaf2.childIds).to.be.empty;
      expect(leaf2.parentIds).to.be.deep.equal([root2Id]);

      const confirmedParentIdsOfLeaf2 = await tokenInstance.getParentIds(leaf2Id, true);
      expect(confirmedParentIdsOfLeaf2).to.be.empty;

      const unconfirmedParentIdsOfLeaf2 = await tokenInstance.getParentIds(leaf2Id, false);
      expect(unconfirmedParentIdsOfLeaf2).to.be.deep.equal([root2Id]);
    });
  });
});
