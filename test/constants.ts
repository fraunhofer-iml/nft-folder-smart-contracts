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
    uri: 'asset1_uri',
    hash: 'asset1_hash',
  },
  asset2: {
    uri: 'asset2_uri',
    hash: 'asset2_hash',
  },
  metadata1: {
    uri: 'metadata1_uri',
    uriUpdated: 'metadata1_uri_updated',
    hash: 'metadata1_hash',
    hashUpdated: 'metadata1_hash_updated',
  },
  metadata2: {
    uri: 'metadata2_uri',
    uriUpdated: 'metadata2_uri_updated',
    hash: 'metadata2_hash',
    hashUpdated: 'metadata2_hash_updated',
  },
  additionalInformation1: {
    initial: 'additionalInformation1_initial',
    updated: 'additionalInformation1_updated',
  },
  additionalInformation2: {
    initial: 'additionalInformation2_initial',
    updated: 'additionalInformation2_updated',
  },
  remoteId1: 'remoteId1',
  remoteId2: 'remoteId2',
};

export { CONTAINER, SEGMENT, TOKEN };
