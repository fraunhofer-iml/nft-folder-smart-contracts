/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const HDWalletProvider = require("@truffle/hdwallet-provider");

require("dotenv").config();
const MNEMONIC = process.env.MNEMONIC;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// TODO-MP: this is ugly, we should not differentiate between projects!

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
    ecmr: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: MNEMONIC,
          providerOrUrl: "http://153.97.12.222:8545",
          addressIndex: 0,
          numberOfAddresses: 1,
          derivationPath: "m/44'/60'/0'/0",
        }),
      type: "quorum",
      network_id: "*",
      gas: 700000000,
      gasPrice: 0,
      networkCheckTimeout: 5000,
    },
    sfbdc: {
      provider: () =>
        new HDWalletProvider({
          mnemonic: MNEMONIC,
          providerOrUrl: "http://153.97.12.222:8545",
          addressIndex: 1,
          numberOfAddresses: 1,
          derivationPath: "m/44'/60'/0'/0",
        }),
      type: "quorum",
      network_id: "*",
      gas: 700000000,
      gasPrice: 0,
      networkCheckTimeout: 5000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.18",
    },
  },
  plugins: ["truffle-contract-size", "truffle-plugin-verify"],
  api_keys: {
    etherscan: ETHERSCAN_API_KEY,
  },
};
