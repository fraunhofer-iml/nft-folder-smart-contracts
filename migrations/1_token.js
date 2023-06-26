/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const Token = artifacts.require("Token");

const TOKEN_NAME = "Token";
const TOKEN_SYMBOL = "TOKEN";

module.exports = async (deployer, network) => {
  if (network === "token" || network === "local") {
    console.log(`\n\n### Deploy '${TOKEN_NAME}' ###`);
    await deployer.deploy(Token, TOKEN_NAME, TOKEN_SYMBOL);
  }
};
