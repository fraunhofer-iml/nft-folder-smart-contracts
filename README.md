<div id="top"></div>

# NFT Folder - Smart Contracts

[[_TOC_]]

## 📄 Description

The **NFT Folder** project enables the tokenization, structuring and secure storage of assets as Non-Fungible Tokens
(NFTs) on the blockchain. With tamper-proof and traceable documentation of changes, NFT Folder ensures the integrity and
authenticity of digital assets, making it a valuable tool for various industries.

The **NFT Folder** project comprises a suite of essential components, including the blockchain connector and three smart
contracts, each fulfilling a unique role in the tokenization and management of assets:

- The **Blockchain Connector**, implemented with NestJS, serves as the bridge between an application and the smart
  contracts. It facilitates seamless communication and interaction with the blockchain, enabling secure and efficient
  operations for managing NFTs.
- The **Container** smart contract provides the foundational structure for organizing and managing collections of NFTs
  within the "NFT Folder" ecosystem. Each organization is assigned a single container, which serves as the root entity
  for their assets.
- The **Segment** smart contract complements the container contract by enabling the subdivision of assets into logical
  segments. Organizations can create an arbitrary number of segments within their container, allowing for finer-grained
  control and organization of their NFTs.
- The **Token** smart contract, written in Solidity and based on the ERC-721 standard, serves as the backbone of the
  **NFT Folder**. It enables the minting and burning of unique NFTs within segments, providing interoperability with
  other ERC721-compliant platforms and services.

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

## 📖 Documentation

For comprehensive documentation, please visit our
dedicated [repository](https://gitlab.cc-asp.fraunhofer.de/silicon-economy/base/blockchainbroker/ethereum/projects/nft-folder/documentation).
Here, you'll find detailed information, guides, and resources to help you understand and utilize the **NFT Folder**
project effectively.

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

## 🚀 Running the NFT Folder locally

To set up and run the NFT Folder locally, please consult
the [Tutorial section](https://gitlab.cc-asp.fraunhofer.de/silicon-economy/base/blockchainbroker/ethereum/projects/nft-folder/documentation/-/blob/main/chapter12.adoc)
in our documentation. This section provides step-by-step instructions to guide you through the process of installing and
configuring the NFT Folder environment on your local machine.

<div style="text-align: right">(<a href="#top">back to top</a>)</div>