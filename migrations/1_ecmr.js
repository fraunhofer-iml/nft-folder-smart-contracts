/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const Container = artifacts.require("Container");
const Token = artifacts.require("Token");

const CONTAINER_NAME = "eCMR Container";
const TOKEN_NAME = "eCMR Token";
const TOKEN_SYMBOL = "ECMR";

module.exports = async (deployer, network, accounts) => {
  if (network === "ecmr" || network === "local") {
    const [account] = accounts;

    console.log(`\n\n### Deploy '${CONTAINER_NAME}' ###`);
    await deployer.deploy(Container, account, CONTAINER_NAME);

    console.log(`\n\n### Deploy '${TOKEN_NAME}' ###`);
    await deployer.deploy(Token, TOKEN_NAME, TOKEN_SYMBOL);
  }
};
