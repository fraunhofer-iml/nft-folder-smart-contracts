/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const Container = artifacts.require("Container");
const Token = artifacts.require("Token");

const CONTAINER_NAME = "Container A";
const TOKEN_NAME = "Token A";
const TOKEN_SYMBOL = "TKNA";

module.exports = async (deployer, network, accounts) => {
  const [alice] = accounts;
  console.log(`\n\n############################`);
  console.log(`### Deploy '${CONTAINER_NAME}' ###`);
  console.log(`############################\n`);

  await deployer.deploy(Container, alice, CONTAINER_NAME);
  console.log(`-> deployer.deploy(ContainerContract, ${alice}, ${CONTAINER_NAME})\n`);

  console.log(`\n\n############################`);
  console.log(`### Deploy '${TOKEN_NAME}' ###`);
  console.log(`############################\n`);

  await deployer.deploy(Token, TOKEN_NAME, TOKEN_SYMBOL);
  console.log(`-> deployer.deploy(ContainerContract, ${alice}, ${CONTAINER_NAME})\n`);
};
