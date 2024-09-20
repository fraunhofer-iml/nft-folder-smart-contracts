/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';
import 'dotenv/config';
import 'hardhat-contract-sizer';
import 'hardhat-tracer';

const DEV_NODE_URL = process.env.DEV_NODE_URL || '';
const DEV_MNEMONIC = process.env.DEV_MNEMONIC || '';
const DEV_INITIAL_ADDRESS_INDEX = parseInt(process.env.DEV_INITIAL_ADDRESS_INDEX || '0', 10);

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 3,
        passphrase: '',
      },
    },
    dev: {
      gas: 0x1ffffffffffffe,
      gasPrice: 0,
      url: DEV_NODE_URL,
      accounts: {
        mnemonic: DEV_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: DEV_INITIAL_ADDRESS_INDEX,
        count: 1,
        passphrase: '',
      },
    },
  },
  solidity: {
    version: '0.8.24',
    settings: {
      evmVersion: 'paris',
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
  },
  tracer: {
    enabled: true,
  },
};

export default config;
