/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ethers } from 'hardhat';

async function main() {
  const containerName = process.env.CONTAINER_NAME;
  const [deployer] = await ethers.getSigners();

  if (!containerName) {
    console.error('Please set CONTAINER_NAME environment variable.');
    process.exit(1);
  }

  console.log(`CONTAINER_NAME=${containerName}`);
  console.log(`DEPLOYER_ADDRESS=${deployer.address}`);

  const container = await ethers.deployContract('Container', [deployer.address, containerName]);
  await container.waitForDeployment();

  console.log(`Container contract deployed to ${container.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
