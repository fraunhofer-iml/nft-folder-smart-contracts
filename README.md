<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url] [![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url] [![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]

<br />
<div align="center">
  <!--
  <a href="https://github.com/fraunhofer-iml/nft-folder-smart-contracts">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>
  -->

<h2 align="center">Smart Contracts (NFT-Folder)</h3>

  <p align="center">
    Solidity smart contracts for the NFT-Folder project, enabling tokenization, structuring, and secure storage of assets as NFTs on the blockchain.
    <br />
    <a href="https://github.com/fraunhofer-iml/nft-folder-smart-contracts/issues/new?labels=bug&template=bug-report---.md">Report Bug</a> &middot;
    <a href="https://github.com/fraunhofer-iml/nft-folder-smart-contracts/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">📚 About The Project</a>
      <ul><li><a href="#description">📄 Description</a></li></ul>
      <ul><li><a href="#documentation">📖 Documentation</a></li></ul>
      <ul><li><a href="#built-with">🛠️ Built With</a></li></ul>
    </li>
    <li><a href="#getting-started">🚀 Getting Started</a></li>
    <li>
      <a href="#contributing">🤝 Contributing</a>
      <ul><li><a href="#getting-involved">🌟 Getting Involved</a></li></ul>
      <ul><li><a href="#top-contributors">🏆 Top Contributors</a></li></ul>
    </li>
    <li><a href="#license">📜 License</a></li>
    <li><a href="#contact">📬 Contact</a></li>
    <li><a href="#acknowledgments">🙏 Acknowledgments</a></li>
  </ol>
</details>

## 📚 About The Project

<!--
[![Product Name Screen Shot][product-screenshot]](https://example.com)
-->

### 📄 Description

The **NFT-Folder** project enables the tokenization, structuring and secure storage of assets as Non-Fungible Tokens
(NFTs) on the blockchain. With tamper-proof and traceable documentation of changes, NFT-Folder ensures the integrity and
authenticity of digital assets, making it a valuable tool for various industries. Key components include:

- **Blockchain Connector**: A NestJS bridge for enabling interactions between an application and the smart contracts.
- **Container Smart Contract**: Organizes and manages NFTs for each organization.
- **Segment Smart Contract**: Enables the subdivision of NFTs into logical segments within a container.
- **Token Smart Contract**: Follows the ERC-721 standard for NFTs on Ethereum, allowing for industrial tokenization of
  assets by storing additional essential information, such as identifiers and fingerprints.

### 📖 Documentation

A detailed documentation for the NFT-Folder project is available in this
[repository](https://github.com/fraunhofer-iml/nft-folder-documentation).

### 🛠️ Built With

- [![HardHat][hardhat-shield]][hardhat-url]
- [![OpenZeppelin][openzeppelin-shield]][openzeppelin-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🚀 Getting Started

To set up and run the NFT-Folder locally, please consult the
[Tutorial section](https://github.com/fraunhofer-iml/nft-folder-documentation/-/blob/main/4-tutorial.adoc) in our
documentation. This section provides step-by-step instructions to guide you through the process of installing,
configuring and running the NFT-Folder environment on your local machine.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🤝 Contributing

### 🌟 Getting Involved

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any
contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'Add some amazing-feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 🏆 Top Contributors

<a href="https://github.com/fraunhofer-iml/nft-folder-smart-contracts/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fraunhofer-iml/nft-folder-smart-contracts" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📜 License

Licensed under the Apache License 2.0. See `LICENSE` for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📬 Contact

Lukas Grieger: lukas.grieger@iml.fraunhofer.de

Michael Pichura: michael.pichura@iml.fraunhofer.de

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🙏 Acknowledgments

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
- [Img Shields](https://shields.io)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]:
  https://img.shields.io/github/contributors/fraunhofer-iml/nft-folder-smart-contracts.svg?style=for-the-badge
[contributors-url]: https://github.com/fraunhofer-iml/nft-folder-smart-contracts/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/fraunhofer-iml/nft-folder-smart-contracts.svg?style=for-the-badge
[forks-url]: https://github.com/fraunhofer-iml/nft-folder-smart-contracts/network/members
[stars-shield]: https://img.shields.io/github/stars/fraunhofer-iml/nft-folder-smart-contracts.svg?style=for-the-badge
[stars-url]: https://github.com/fraunhofer-iml/nft-folder-smart-contracts/stargazers
[issues-shield]: https://img.shields.io/github/issues/fraunhofer-iml/nft-folder-smart-contracts.svg?style=for-the-badge
[issues-url]: https://github.com/fraunhofer-iml/nft-folder-smart-contracts/issues
[license-shield]:
  https://img.shields.io/github/license/fraunhofer-iml/nft-folder-smart-contracts.svg?style=for-the-badge
[license-url]: https://github.com/fraunhofer-iml/nft-folder-smart-contracts/blob/master/LICENSE
[product-screenshot]: images/screenshot.png
[hardhat-shield]: https://img.shields.io/badge/development%20tool-Hardhat-FFCC00?style=flat&logo=hardhat
[hardhat-url]: https://hardhat.org/
[openzeppelin-shield]: https://img.shields.io/badge/library-OpenZeppelin%20Contracts-4E5EE4?style=flat&logo=openzeppelin
[openzeppelin-url]: https://www.openzeppelin.com/
