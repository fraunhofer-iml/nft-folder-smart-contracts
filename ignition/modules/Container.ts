/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('Container', (builder) => {
  const containerName = process.env.CONTAINER_NAME;
  const account = builder.getAccount(0);

  if (!containerName) {
    console.error('Please set CONTAINER_NAME environment variable.');
    process.exit(1);
  }

  console.log(`CONTAINER_NAME=${containerName}`);

  // TODO-MP: maybe we could also deploy the first segment with a generic name

  const container = builder.contract('Container', [account, containerName]);
  return { container };
});
