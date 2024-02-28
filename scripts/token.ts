/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { ethers } from 'hardhat';

async function main() {
  const tokenName = process.env.TOKEN_NAME;
  const tokenSymbol = process.env.TOKEN_SYMBOL;

  if (!tokenName || !tokenSymbol) {
    console.error('Please set TOKEN_NAME and TOKEN_SYMBOL environment variables.');
    process.exit(1);
  }

  console.log(`TOKEN_NAME=${tokenName}`);
  console.log(`TOKEN_SYMBOL=${tokenSymbol}`);

  const token = await ethers.deployContract('Token', [tokenName, tokenSymbol]);
  await token.waitForDeployment();

  console.log(`Token contract deployed to ${token.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
