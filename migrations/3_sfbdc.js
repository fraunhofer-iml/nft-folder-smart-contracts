/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const Container = artifacts.require("Container");

const CONTAINER_NAME = "sFBDC Container";

module.exports = async (deployer, network, accounts) => {
  if (network === "sfbdc" || network === "local") {
    const [account] = accounts;

    console.log(`\n\n### Deploy '${CONTAINER_NAME}' ###`);
    await deployer.deploy(Container, account, CONTAINER_NAME);
  }
};
