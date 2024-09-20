/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const CONTAINER = {
  name: 'MyContainer',
};

const SEGMENT = {
  name: 'MySegment',
  address: '0x0000000000000000000000000000000000000001',
};

const TOKEN = {
  token1: {
    name: 'MyToken1',
    symbol: 'MT1',
  },
  token2: {
    name: 'MyToken2',
    symbol: 'MT2',
  },
  asset1: {
    uriInitial: 'asset1_uri_initial',
    uriUpdated: 'asset1_uri_updated',
    hashInitial: 'asset1_hash_initial',
    hashUpdated: 'asset1_hash_updated',
  },
  asset2: {
    uriInitial: 'asset2_uri_initial',
    uriUpdated: 'asset2_uri_updated',
    hashInitial: 'asset2_hash_initial',
    hashUpdated: 'asset2_hash_updated',
  },
  metadata1: {
    uriInitial: 'metadata1_uri_initial',
    uriUpdated: 'metadata1_uri_updated',
    hashInitial: 'metadata1_hash_initial',
    hashUpdated: 'metadata1_hash_updated',
  },
  metadata2: {
    uriInitial: 'metadata2_uri_initial',
    uriUpdated: 'metadata2_uri_updated',
    hashInitial: 'metadata2_hash_initial',
    hashUpdated: 'metadata2_hash_updated',
  },
  additionalData1: {
    initial: 'additionalData1_initial',
    updated: 'additionalData1_updated',
  },
  additionalData2: {
    initial: 'additionalData2_initial',
    updated: 'additionalData2_updated',
  },
  remoteId1: 'remoteId1',
  remoteId2: 'remoteId2',
};

export { CONTAINER, SEGMENT, TOKEN };
