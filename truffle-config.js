/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

require("dotenv").config();
const TESTNET_PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY;
const PRODUCTION_PRIVATE_KEY = process.env.PRODUCTION_PRIVATE_KEY;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    local: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    testnet: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [TESTNET_PRIVATE_KEY],
          providerOrUrl: `https://polygon-mumbai.infura.io/v3/${INFURA_API_KEY}`,
        }),
      network_id: "80001",
      gas: 4500000,
      gasPrice: 10e9,
      skipDryRun: true,
    },
    production: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [PRODUCTION_PRIVATE_KEY],
          providerOrUrl: "http://goquorum-node-rpc-1-example-quorum-project.apps.sele.iml.fraunhofer.de",
        }),
      port: 8080,
      type: "quorum",
      network_id: "*",
      gas: 6000000,
      gasPrice: 0,
    },
  },
  compilers: {
    solc: {
      version: "0.8.16",
    },
  },
  plugins: ["truffle-contract-size", "truffle-plugin-verify"],
  api_keys: {
    etherscan: ETHERSCAN_API_KEY,
  },
};
