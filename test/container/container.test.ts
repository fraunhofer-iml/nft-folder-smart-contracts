/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { expect } from 'chai';
import { ContractTransactionResponse } from 'ethers';
import { ethers } from 'hardhat';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/src/signers';

import { Container } from '../../typechain-types';
import { CONTAINER } from '../constants';

describe('Container', async () => {
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let containerInstance: Container;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice, bob] = await ethers.getSigners();
  });

  describe('is Ownable', () => {
    context('Deployer is Owner', () => {
      beforeEach(async () => {
        containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
      });

      it('should have an owner', async () => {
        const owner = await containerInstance.owner();
        expect(owner).to.be.not.null;
        expect(owner).to.be.equal(alice);
      });
    });

    context('Deployer is not Owner', () => {
      beforeEach(async () => {
        containerInstance = await ethers.deployContract('Container', [bob, CONTAINER.name]);
      });

      it('should not allow execution of onlyOwner function', async () => {
        await expect(containerInstance.createSegment('Segment')).to.be.revertedWith('Ownable: caller is not the owner');
      });
    });
  });

  describe('createSegment', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
    });

    it('should create and add one segment', async () => {
      const receipt = await containerInstance.createSegment('Segment');

      const numberOfSegments = await containerInstance.getNumberOfSegments();
      expect(numberOfSegments).to.be.equal(1);

      const allSegmentAddresses = await containerInstance.getAllSegments();
      expect(allSegmentAddresses.length).to.be.equal(1);

      await assertSegment(receipt, 0, 'Segment');
    });

    it('should create and add three segments', async () => {
      const receipt1 = await containerInstance.createSegment('Segment1');
      const receipt2 = await containerInstance.createSegment('Segment2');
      const receipt3 = await containerInstance.createSegment('Segment3');

      const numberOfSegments = await containerInstance.getNumberOfSegments();
      expect(numberOfSegments).to.be.equal(3);

      const allSegmentAddresses = await containerInstance.getAllSegments();
      expect(allSegmentAddresses.length).to.be.equal(3);

      // TODO-MP: these asserts never fail...
      await assertSegment(receipt1, 0, 'Segment1');
      await assertSegment(receipt2, 1, 'Segment2');
      await assertSegment(receipt3, 2, 'Segment3');
    });

    async function assertSegment(receipt: ContractTransactionResponse, index: number, expectedSegmentName: string) {
      const segmentAddress = await containerInstance.getSegment(index);
      const segmentInContainer = await containerInstance.isSegmentInContainer(segmentAddress);
      expect(segmentInContainer).to.be.true;

      // TODO-MP: this doesn't work, information seems to be lost after the await...
      expect(receipt).to.emit(containerInstance, 'SegmentAdded').withArgs(alice, segmentAddress);

      const segmentInstance = await ethers.getContractAt('Segment', segmentAddress);
      expect(await segmentInstance.owner()).to.be.equal(alice);

      const segmentName = await segmentInstance.getName();
      expect(segmentName).to.be.equal(expectedSegmentName);

      const containerAddressFromSegmentInstance = await segmentInstance.getContainer();
      const containerAddressFromContainerInstance = await containerInstance.getAddress();
      expect(containerAddressFromSegmentInstance).to.be.equal(containerAddressFromContainerInstance);
    }
  });

  describe('getName', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
    });

    it('should return myContainer', async () => {
      const name = await containerInstance.getName();
      expect(name).equals(CONTAINER.name);
    });
  });

  describe('getAllSegments', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
    });

    it('should return 0 for empty segment', async () => {
      const allSegmentAddresses = await containerInstance.getAllSegments();
      expect(allSegmentAddresses.length).to.be.equal(0);
    });
  });

  describe('getSegment', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
    });

    it('should reject with 0 segments', async () => {
      await expect(containerInstance.getSegment(0)).to.be.revertedWith('Container: no segments stored in container');
    });

    it('should reject with invalid index', async () => {
      await containerInstance.createSegment('Segment');
      await expect(containerInstance.getSegment(1)).to.be.revertedWith('Container: index is too large');
    });
  });

  describe('getNumberOfSegments', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
    });

    it('should return 0 for empty segment', async () => {
      const numberOfSegments = await containerInstance.getNumberOfSegments();
      expect(numberOfSegments).to.be.equal('0');
    });
  });

  describe('isSegmentInContainer', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
    });

    it('should return false for wrong address', async () => {
      await containerInstance.createSegment('Segment');

      const segmentInContainer = await containerInstance.isSegmentInContainer(alice);
      expect(segmentInContainer).to.be.false;
    });
  });
});
