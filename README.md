<div id="top"></div>

# NFT Folder

---

[[_TOC_]]

## 📄 Description

---

Creating a robust codebase with comprehensive testing, essential tooling, an efficient pipeline, and thorough
documentation is crucial for new blockchain projects. However, these tasks can be time-consuming and repetitive. This
project provides a solution to help you complete these essential tasks more efficiently and enable you to kick-start
your blockchain project with greater ease.

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

## 📖 Documentation

---

This project includes a starter documentation that features pre-populated content for specific chapters that are always
the same in Blockchain Europe projects.
However, other chapters remain unfilled and require project-specific input.
This documentation is based on the [arc42 template](https://arc42.org/overview) and included in the
directory `documentation`.

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

## 🚀 Getting Started

---

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

### 🛒 Dependencies

---

#### [dotenv](https://github.com/motdotla/dotenv)

**_Handling environment variables_**

Loads environment variables from an existing `.env` file into `process.env`.

#### [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers)

**_Ethereum smart contract assertion library_**

Features:

- Checks that transactions revert for the correct reason
- Verifies events where emitted with the right values
- Tracks balance changes elegantly
- Handles very large numbers
- Simulates the passing of time

#### [@truffle/hdwallet-provider](https://www.npmjs.com/package/@truffle/hdwallet-provider)

**_HD Wallet-enabled Web3 provider_**

Signs transactions for addresses derived from a 12 or 24 word mnemonic.

#### [Chai](https://www.chaijs.com)

**_BDD/TDD assertion library_**

Makes the assertions of JavaScript tests more readable.

#### [ESLint](https://eslint.org)

**_Linter for JavaScript code_**

This plugin uses the configuration file `.eslintrc.json`. Therein we use the recommended ESLint
rules (`eslint:recommended`).

#### [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

**_Turns off all rules in ESLint that are unnecessary or might conflict with Prettier_**

This config is used in the `extends` array of the configuration file `.eslintrc.json`.

#### [eslint-plugin-license-header](https://github.com/nikku/eslint-plugin-license-header)

**_Provides ESLint rules to validate the presence of license headers in source files_**

This plugin is used in the `plugins` array of the configuration file `.eslintrc.json`.

#### [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)

**_Runs Prettier as an ESLint rule and reports differences as individual ESLint issues_**

This plugin is used in the `plugins` array of the configuration file `.eslintrc.json`.

#### [Ganache](https://github.com/trufflesuite/ganache)

**_Local blockchain for fast Ethereum development_**

Ganache is an Ethereum simulator that makes developing Ethereum applications faster, easier, and safer. It includes all
popular RPC functions and features (like events) and can be run deterministically.

#### [husky](https://typicode.github.io/husky)

**_Runs custom scripts (Git hooks) at certain events in the Git lifecycle_**

The folder `.husky` contains actions for the Git hook `pre-commit`. Currently, only the package **lint-staged** is
executed before every commit.

#### [NPM License Checker](https://github.com/davglass/license-checker)

**_Checks the license of all installed NPM modules_**

This plugin is used in the `plugins` array of the configuration file `.eslintrc.json`.

#### [lint-staged](https://github.com/okonet/lint-staged)

**_Runs linters and formatters against staged Git files_**

We use this package to run

- the linter **solhint** on Solidity files
- the formatter **Prettier** on JavaScript and Solidity files

See the object `"lint-staged"` in the `package.json`.

#### [Prettier](https://prettier.io)

**_Opinionated code formatter for many languages_**

The default formatting rules are overridden in the configuration file `.prettierrc.json`.

#### [prettier-plugin-properties](https://github.com/eemeli/prettier-plugin-properties)

**_Plugin for Prettier to format Property files_**

New rules can be added to the configuration file `.prettierrc.json`.

#### [prettier-plugin-solidity](https://github.com/prettier-solidity/prettier-plugin-solidity)

**_Plugin for Prettier to format Solidity files_**

New rules can be added to the configuration file `.prettierrc.json`.

#### [solhint](https://protofire.github.io/solhint)

**_Linter for Solidity code with security and style guide validations_**

This plugin uses the configuration file `.solhint.json`. Therein we have specified the recommended set of rules combined
with some additional rules, which overall correspond to the
official [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html).

#### [solhint-plugin-prettier](https://github.com/fvictorio/solhint-plugin-prettier)

**_Plugin for Prettier to lint Solidity code_**

We have added this plugin to the array `"plugins": ["prettier"]` inside the configuration file `.solhint.json`.
The rule `"prettier/prettier": "error"` contained therein emits an error for each difference between our Solidity code
and how **prettier-plugin-solidity** would format it.

#### [Truffle](https://github.com/trufflesuite/truffle/tree/develop/packages/truffle)

**_Development environment, testing framework and asset pipeline for Ethereum_**

Features:

- Built-in smart contract compilation, linking, deployment and binary management
- Automated contract testing with Mocha and Chai
- Configurable build pipeline with support for custom build processes
- Scriptable deployment & migrations framework
- Network management for deploying to many public & private networks
- Interactive console for direct contract communication
- Instant rebuilding of assets during development
- External script runner that executes scripts within a Truffle environment

#### [truffle-contract-size](https://github.com/IoBuilders/truffle-contract-size)

**_Smart contract size calculator _**

Displays the contract size of all or a selection of smart contracts in kilobytes.

#### [truffle-plugin-verify](https://github.com/rkalis/truffle-plugin-verify)

**_Smart contract verifier_**

Verifies automatically the smart contracts' source code on [Etherscan](https://etherscan.io).

### 🔎 Prerequisites

---

You have to install the following tools before the installation steps listed below can be performed:

- [git](https://git-scm.com/downloads)
- [Node.js 16.16.x](https://nodejs.org/en/download)
- [Ganache](https://trufflesuite.com/ganache)
- [IntelliJ](https://www.jetbrains.com/idea/download)
    - [Truffle plugin](https://plugins.jetbrains.com/plugin/18559-truffle)
    - [Solidity plugin](https://plugins.jetbrains.com/plugin/9475-solidity)
    - [Prettier plugin](https://plugins.jetbrains.com/plugin/10456-prettier)

#### [Ganache](https://trufflesuite.com/ganache)

This software combines the CLI and GUI components of Ganache in one package. It makes the development process more
comfortable, instead of using only the CLI.

#### [IntelliJ IDEA](https://www.jetbrains.com/idea)

We recommend IntelliJ IDEA as your local IDE.

At first change the following properties in the settings section:

- **Settings** -> **Editor** -> **Inspections** -> **JavaScript and TypeScript** -> **General**
    - Disable: **Unneeded last comma in array literal**
    - Disable: **Unneeded last comma in object literal**
- **Settings** -> **Languages & Frameworks** > **JavaScript** > **Prettier**
    - Enable: **On 'Reformat Code' action**

Afterwards install and configure the plugin **SonarLint** according to these
[instructions](https://oe160.iml.fraunhofer.de/wiki/display/HOW/IntelliJ).

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

### 🛠️ Installation

---

The following installation steps must be performed to develop and interact with the smart contract on your local
machine:

1. Clone the repository
    - `git clone git@gitlab.cc-asp.fraunhofer.de:silicon-economy/base/blockchainbroker/ethereum/projects/solidity-libraries/nft-folder.git`
2. Install dependencies
    - `npm install`
3. Start Ganache
    - Click on **NEW WORKSPACE** and then **ADD PROJECT**
        - Select the file `truffle-config.js` from the root folder of the cloned repository
    - Click on **SAVE WORKSPACE**
    - Click on **CONTRACTS** in the upper navigation bar
        - The smart contract has yet to be deployed, as evidenced by the message indicating that it is **Not Deployed**.
4. Execute tests
    - `npm run test`
    - Every single test should be executed successfully
    - Before and after this script is executed the scripts `pretest` and `posttest` are executed respectively
        - While the former starts the CLI component of Ganache in the background, the latter terminates the
          corresponding process
5. Deploy the smart contract to your local Ganache instance
    - `npm run local:deploy`
    - For every smart contract, which needs to be deployed, the folder `migrations` contains a migration file
    - In the **CONTRACTS** overview of Ganache the smart contracts `Migrations` and `Counter` have an
      address which means that they are now deployed

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

### 🕹️ Usage

---

Once the installation process has been successfully completed, you will be able to interact with the smart contract.

In this example the first account from the **ACCOUNTS** overview of Ganache executes the `increment` function.
These commands can only be executed with a running Ganache instance.

- `npm run console:local`
- `const instance = await Counter.deployed();`
- `instance.increment();`

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

### ⚗️Development

---

This is just a little quickstart. For a thorough introduction into our development process, please refer to
the [Developer Guidelines](https://oe160.iml.fraunhofer.de/wiki/display/HOW/Developer+Guidelines).

Push never ever to `main` directly! Always create a new branch with a comprehensive name, which consists of three parts
(e.g. `feature/se1234-implement-staking-mechanism`)

- type (`feature`, `improvement`, `bugfix`, `refactoring`, `documentation`, ...)
- ticket number (`seDDDD`)
- what you want to achieve

Every commit message must contain a subject line, written in the imperative mood (e.g. `Fix transfer function`). When
you merge the branch into `main`, you need to squash all your commits into a single commit. This is where you should
provide a detailed text so that others (and the future you) understand why you made these changes. Please take a look
into some good examples and best practices regarding commit messages:
[#1](https://gist.github.com/robertpainsi/b632364184e70900af4ab688decf6f53)
[#2](https://wiki.openstack.org/wiki/GitCommitMessages)
[#3](https://initialcommit.com/blog/git-commit-messages-best-practices)

When you commit, the commands `npm run prettier:check` and `npm run solhint` are executed automatically on your changed
files. If they find any issues, the commit will not be created. To successfully create the commit, you must fix these
issues beforehand.

Additionally, everytime the file `package.json` is updated, the command `npm run license-checker` is executed which
collects all licenses from all npm modules within the folder `node_modules`. These licenses are then written into three
different files and automatically added to the git staging area:

- `third-party-licenses.csv` contains license information for all npm modules
- `third-party-licenses-complementary.csv` contains license information for every npm module with an unknown license
- `third-party-licenses-summary.txt` contains all licenses with their occurrences

After you have made all the necessary changes, someone will need to review and approve your branch. It might be a good
idea to discuss your implementation with the reviewer beforehand, so he can ask questions to get a better understanding
of the changes and your thoughts. Afterwards he looks at the changes by himself and makes some comments and suggestions
in GitLab. You must provide a response to any comments he writes and implement those suggestions as appropriate. If
something is unclear, talk to the reviewer again. At the end, you need to make sure that all comments are resolved. If
the reviewer approved your merge request, you may merge your branch into `main`.

### ⬆️Deployment

---

In order to deploy the smart contract to testnet, you have to follow these steps:

1. Make sure the project root folder contains an `.env` file with the following entries:

   |        **Key**         |     **Required for**     | 
               | :--------------------: | :----------------------: |
   |  TESTNET_PRIVATE_KEY   |  Deployment to testnet   |
   |     INFURA_API_KEY     |  Deployment to testnet   |
   |   ETHERSCAN_API_KEY    |   Verifying on testnet   |

2. Start your local Ganache instance

    - Execute the actual script `npm run ganache:start`

3. Deploy the smart contract to your local Ganache instance

    - Execute the actual script `npm run deploy:local`

4. After you have tested the smart contract in Ganache successfully, you may deploy it to the testnet

    - Execute the script `npm run deploy:testnet`
    - Now the `Migrations` contract will recognize that the migration script has not been executed for the testnet yet
    - In order to see the contract code on Etherscan, you need to execute the script `npm run testnet:verify"`
        - It will verify and publish the new contract source code to Etherscan

### ❗ Known Issues

---

## ✍ Contributing

---

TODO-MP: this will be added sometime in the future

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

## ⚖ License

---

See the file [LICENSE](LICENSE) in the root directory.

For information about licenses of third-party dependencies, please refer to the `README.md` file of the corresponding
project.

<div style="text-align: right">(<a href="#top">back to top</a>)</div>

## 📧 Contact

---

- Tobias Jornitz (Product Owner) <a href="mailto:tobias.jornitz@iml.fraunhofer.de?">tobias.jornitz@iml.fraunhofer.de</a>
- Dominik Buß (SCRUM Master) <a href="mailto:dominik.buß@iml.fraunhofer.de?">dominik.buß@iml.fraunhofer.de</a>
- Stephan Frerichs (Lead Developer) <a href="mailto:stephan.frerichs@iml.fraunhofer.de?">
  stephan.frerichs@iml.fraunhofer.de</a>
- Lukas Grieger (Developer) <a href="mailto:lukas.grieger@iml.fraunhofer.de?">lukas.grieger@iml.fraunhofer.de</a>
- Alexander Needham (Developer) <a href="mailto:alexander.needham@iml.fraunhofer.de?">
  alexander.needham@iml.fraunhofer.de</a>
- Michael Pichura (Developer) <a href="mailto:michael.pichura@iml.fraunhofer.de?">michael.pichura@iml.fraunhofer.de</a>

<div style="text-align: right">(<a href="#top">back to top</a>)</div>
