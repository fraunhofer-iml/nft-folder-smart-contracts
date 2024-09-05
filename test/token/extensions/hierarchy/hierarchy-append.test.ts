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

describe('Token - Extension Hierarchy', async () => {
  let alice: HardhatEthersSigner;
  let tokenInstance: Token;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  async function mintToken(parentIds: number[]) {
    await tokenInstance.mintTokenAndAppendToHierarchy(
      alice,
      TOKEN.asset1.uri,
      TOKEN.asset1.hash,
      TOKEN.metadata1.uri,
      TOKEN.metadata1.hash,
      TOKEN.remoteId1,
      TOKEN.additionalInformation1.initial,
      parentIds,
    );
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

      await mintToken([]);

      const node = await tokenInstance.getNode(rootId);
      expect(node.exists).to.be.true;
      expect(node.active).to.be.true;
      expect(node.predecessorId).to.be.equal(ethers.MaxUint256);
      expect(node.successorId).to.be.equal(ethers.MaxUint256);
      expect(node.childIds).to.be.empty;
      expect(node.parentIds).to.be.empty;

      const confirmedParentIds = await tokenInstance.getConfirmedParentIds(rootId);
      expect(confirmedParentIds).to.be.empty;

      const unconfirmedParentIds = await tokenInstance.getUnconfirmedParentIds(rootId);
      expect(unconfirmedParentIds).to.be.empty;
    });

    it('should mint 1 root token and 1 leaf token', async () => {
      const rootId = 0;
      const leafId = 1;

      await mintToken([]);
      await mintToken([rootId]);

      // Test root
      const root = await tokenInstance.getNode(rootId);
      expect(root.childIds).to.be.deep.equal([leafId]);
      expect(root.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot = await tokenInstance.getConfirmedParentIds(rootId);
      expect(confirmedParentIdsOfRoot).to.be.empty;

      const unconfirmedParentIdsOfRoot = await tokenInstance.getUnconfirmedParentIds(rootId);
      expect(unconfirmedParentIdsOfRoot).to.be.empty;

      // Test leaf
      const leaf = await tokenInstance.getNode(leafId);
      expect(leaf.childIds).to.be.empty;
      expect(leaf.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfLeaf = await tokenInstance.getConfirmedParentIds(leafId);
      expect(confirmedParentIdsOfLeaf).to.be.empty;

      const unconfirmedParentIdsOfLeaf = await tokenInstance.getUnconfirmedParentIds(leafId);
      expect(unconfirmedParentIdsOfLeaf).to.be.deep.equal([rootId]);
    });

    it('should mint 1 root token and 2 leaf token', async () => {
      const rootId = 0;
      const leaf1Id = 1;
      const leaf2Id = 2;

      await mintToken([]);
      await mintToken([rootId]);
      await mintToken([rootId]);

      // Test root
      const root = await tokenInstance.getNode(rootId);
      expect(root.childIds).to.be.deep.equal([leaf1Id, leaf2Id]);
      expect(root.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot = await tokenInstance.getConfirmedParentIds(rootId);
      expect(confirmedParentIdsOfRoot).to.be.empty;

      const unconfirmedParentIdsOfRoot = await tokenInstance.getUnconfirmedParentIds(rootId);
      expect(unconfirmedParentIdsOfRoot).to.be.empty;

      // Test leaf1
      const leaf1 = await tokenInstance.getNode(leaf1Id);
      expect(leaf1.childIds).to.be.empty;
      expect(leaf1.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfLeaf1 = await tokenInstance.getConfirmedParentIds(leaf1Id);
      expect(confirmedParentIdsOfLeaf1).to.be.empty;

      const unconfirmedParentIdsOfLeaf1 = await tokenInstance.getUnconfirmedParentIds(leaf1Id);
      expect(unconfirmedParentIdsOfLeaf1).to.be.deep.equal([rootId]);

      // Test leaf2
      const leaf2 = await tokenInstance.getNode(leaf2Id);
      expect(leaf2.childIds).to.be.empty;
      expect(leaf2.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfLeaf2 = await tokenInstance.getConfirmedParentIds(leaf2Id);
      expect(confirmedParentIdsOfLeaf2).to.be.empty;

      const unconfirmedParentIdsOfLeaf2 = await tokenInstance.getUnconfirmedParentIds(leaf2Id);
      expect(unconfirmedParentIdsOfLeaf2).to.be.deep.equal([rootId]);
    });

    it('should mint 1 root token and 1 intermediate token and 1 leaf token', async () => {
      const rootId = 0;
      const intermediateId = 1;
      const leafId = 2;

      await mintToken([]);
      await mintToken([rootId]);
      await mintToken([intermediateId]);

      // Test root
      const root = await tokenInstance.getNode(rootId);
      expect(root.childIds).to.be.deep.equal([intermediateId]);
      expect(root.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot = await tokenInstance.getConfirmedParentIds(rootId);
      expect(confirmedParentIdsOfRoot).to.be.empty;

      const unconfirmedParentIdsOfRoot = await tokenInstance.getUnconfirmedParentIds(rootId);
      expect(unconfirmedParentIdsOfRoot).to.be.empty;

      // Test intermediate
      const intermediate = await tokenInstance.getNode(intermediateId);
      expect(intermediate.childIds).to.be.deep.equal([leafId]);
      expect(intermediate.parentIds).to.be.deep.equal([rootId]);

      const confirmedParentIdsOfIntermediate = await tokenInstance.getConfirmedParentIds(intermediateId);
      expect(confirmedParentIdsOfIntermediate).to.be.empty;

      const unconfirmedParentIdsOfIntermediate = await tokenInstance.getUnconfirmedParentIds(intermediateId);
      expect(unconfirmedParentIdsOfIntermediate).to.be.deep.equal([rootId]);

      // Test leaf
      const leaf = await tokenInstance.getNode(leafId);
      expect(leaf.childIds).to.be.empty;
      expect(leaf.parentIds).to.be.deep.equal([intermediateId]);

      const confirmedParentIdsOfLeaf = await tokenInstance.getConfirmedParentIds(leafId);
      expect(confirmedParentIdsOfLeaf).to.be.empty;

      const unconfirmedParentIdsOfLeaf = await tokenInstance.getUnconfirmedParentIds(leafId);
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

      await mintToken([]);
      await mintToken([]);

      // Test root1
      const root1 = await tokenInstance.getNode(root1Id);
      expect(root1.childIds).to.be.empty;
      expect(root1.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot1 = await tokenInstance.getConfirmedParentIds(root1Id);
      expect(confirmedParentIdsOfRoot1).to.be.empty;

      const unconfirmedParentIdsOfRoot1 = await tokenInstance.getUnconfirmedParentIds(root1Id);
      expect(unconfirmedParentIdsOfRoot1).to.be.empty;

      // Test root2
      const root2 = await tokenInstance.getNode(root2Id);
      expect(root2.childIds).to.be.empty;
      expect(root2.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot2 = await tokenInstance.getConfirmedParentIds(root2Id);
      expect(confirmedParentIdsOfRoot2).to.be.empty;

      const unconfirmedParentIdsOfRoot2 = await tokenInstance.getUnconfirmedParentIds(root2Id);
      expect(unconfirmedParentIdsOfRoot2).to.be.empty;
    });

    it('should mint 2 root token and 2 leaf token', async () => {
      const root1Id = 0;
      const leaf1Id = 1;
      const root2Id = 2;
      const leaf2Id = 3;

      await mintToken([]);
      await mintToken([root1Id]);
      await mintToken([]);
      await mintToken([root2Id]);

      // Test root1 (hierarchy1)
      const root1 = await tokenInstance.getNode(root1Id);
      expect(root1.childIds).to.be.deep.equal([leaf1Id]);
      expect(root1.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot1 = await tokenInstance.getConfirmedParentIds(root1Id);
      expect(confirmedParentIdsOfRoot1).to.be.empty;

      const unconfirmedParentIdsOfRoot1 = await tokenInstance.getUnconfirmedParentIds(root1Id);
      expect(unconfirmedParentIdsOfRoot1).to.be.empty;

      // Test leaf1 (hierarchy1)
      const leaf1 = await tokenInstance.getNode(leaf1Id);
      expect(leaf1.childIds).to.be.empty;
      expect(leaf1.parentIds).to.be.deep.equal([root1Id]);

      const confirmedParentIdsOfLeaf1 = await tokenInstance.getConfirmedParentIds(leaf1Id);
      expect(confirmedParentIdsOfLeaf1).to.be.empty;

      const unconfirmedParentIdsOfLeaf1 = await tokenInstance.getUnconfirmedParentIds(leaf1Id);
      expect(unconfirmedParentIdsOfLeaf1).to.be.deep.equal([root1Id]);

      // Test root2 (hierarchy2)
      const root2 = await tokenInstance.getNode(root2Id);
      expect(root2.childIds).to.be.deep.equal([leaf2Id]);
      expect(root2.parentIds).to.be.empty;

      const confirmedParentIdsOfRoot2 = await tokenInstance.getConfirmedParentIds(root2Id);
      expect(confirmedParentIdsOfRoot2).to.be.empty;

      const unconfirmedParentIdsOfRoot2 = await tokenInstance.getUnconfirmedParentIds(root2Id);
      expect(unconfirmedParentIdsOfRoot2).to.be.empty;

      // Test leaf2 (hierarchy2)
      const leaf2 = await tokenInstance.getNode(leaf2Id);
      expect(leaf2.childIds).to.be.empty;
      expect(leaf2.parentIds).to.be.deep.equal([root2Id]);

      const confirmedParentIdsOfLeaf2 = await tokenInstance.getConfirmedParentIds(leaf2Id);
      expect(confirmedParentIdsOfLeaf2).to.be.empty;

      const unconfirmedParentIdsOfLeaf2 = await tokenInstance.getUnconfirmedParentIds(leaf2Id);
      expect(unconfirmedParentIdsOfLeaf2).to.be.deep.equal([root2Id]);
    });
  });
});
