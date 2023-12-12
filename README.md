# Un-Dark SeaDrop-Compatible ERC721A

For detailed information about the original SeaDrop contract, please refer to [https://github.com/ProjectOpenSea/seadrop/](https://github.com/ProjectOpenSea/seadrop/)

## Overview

This contract is an ERC721A v4 contract compatible with OpenSea's SeaDrop. The following diagram provides an overview on the technical integration with SeaDrop

![SeaDrop Diagram](img/seadrop-diagram.png)

## Technical Caveats

1. This repository utilises Git Submodules for dependency management. It is the opinion of this developer (Buooy) that it is a poor choice by OpenSea. However, in the absence of a viable package manager and poor support via NPM, we will stick with it
2. We use `NPM` instead of `yarn` for practical reasons that most developers will have `NPM` installed. You may feel free to use `yarn` or `pnpm`. Note that only `package-lock.json` is provided

## Project Structure and Organisation

- Note that this section is still WIP

1. Main ERC721A Contract: src-upgradeable/src/Undark.sol

## Installation

1. Set up the ENV file

```bash
# clone .env. Please take care to never commit this file
cp .env.example .env
```

2. To install dependencies and compile contracts:

```bash
# Git clone with all submodules
git clone --recurse-submodules https://github.com/un-dark-io/erc721a-undark && cd erc721a-undark

# Due to peer dependency issues, we will force install
# Usually this is a very bad idea, but JS Dependencies are only used in the test and build process
# and in the opinion of this developer, this is not a major concern atm.
npm install --force
```

## Unit Tests

To run the unit tests

```bash
# Run all unit test in the src-upgradeable folder
npm test
```

## Build Contract

```bash
# Build contract
npm build

# Deploy contract
npm run deploy

# Verify contract in sepolia. Other chains are WIP
npm run verify:sepolia
```
