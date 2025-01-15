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

import { Container, Segment } from '../../typechain-types';
import { CONTAINER, SEGMENT } from '../constants';

describe('Segment', async () => {
  let alice: HardhatEthersSigner;
  let containerInstance: Container;
  let segmentInstance: Segment;
  let validContainerAddress: string;

  before(async () => {
    // @ts-expect-error: library version compatibility issue
    [alice] = await ethers.getSigners();
  });

  describe('Initialize Segment', () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
      validContainerAddress = await containerInstance.getAddress();

      await containerInstance.createSegment(SEGMENT.name);
      segmentInstance = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));
    });

    it('should get owner', async () => {
      const actualOwner = await segmentInstance.owner();
      expect(actualOwner).equals(alice);
    });

    it('should get container', async () => {
      const actualContainer = await segmentInstance.getContainer();
      expect(actualContainer).equals(validContainerAddress);
    });

    it('should get name', async () => {
      const actualName = await segmentInstance.getName();
      expect(actualName).equals(SEGMENT.name);
    });

    it('should get all token information', async () => {
      const actualAllTokenInformation = await segmentInstance.getAllTokenInformation();
      expect(actualAllTokenInformation.length).to.be.equal(0);
    });

    it('should revert tokenInformation', async () => {
      await expect(segmentInstance.getTokenInformation('0')).to.be.revertedWithCustomError(
        segmentInstance,
        'IndexExceedsTokenInformationLength',
      );
    });

    it('should get number of tokenInformation', async () => {
      const actualNumberOfTokenInformation = await segmentInstance.getNumberOfTokenInformation();
      expect(actualNumberOfTokenInformation).to.equal('0');
    });

    it('should not have token in segment', async () => {
      const actualTokenInSegment = await segmentInstance.isTokenInSegment(validContainerAddress, '0');
      expect(actualTokenInSegment).is.false;
    });
  });

  describe("Don't Initialize Segment", () => {
    beforeEach(async () => {
      containerInstance = await ethers.deployContract('Container', [alice, CONTAINER.name]);
      validContainerAddress = await containerInstance.getAddress();

      await containerInstance.createSegment(SEGMENT.name);
      segmentInstance = await ethers.getContractAt('Segment', await containerInstance.getSegment(0));
    });

    it('should require a valid name string', async () => {
      await expect(containerInstance.createSegment('')).to.be.revertedWithCustomError(
        containerInstance,
        'ContainerNameIsEmpty',
      );
    });
  });
});
