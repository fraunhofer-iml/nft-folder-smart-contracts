/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const Container = artifacts.require("Container");

const CONTAINER_NAME = "eCMR";

module.exports = async (deployer, network, accounts) => {
  if (network !== "test") {
    const [alice] = accounts;
    console.log(`\n\n############################`);
    console.log(`### Deploy '${CONTAINER_NAME}' ###`);
    console.log(`############################\n`);

    console.log(`-> await deployer.deploy(<CONTAINER_CONTRACT>, ${alice}, ${CONTAINER_NAME})\n`);
    await deployer.deploy(Container, alice, CONTAINER_NAME);
  }
};
