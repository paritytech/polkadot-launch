# moonbeam-launch
 Simple CLI tool to launch a local [Moonbeam](https://github.com/PureStake/moonbeam) test network.

## Intro

This is forked from [Polkadot-launch](https://github.com/shawntabrizi/polkadot-launch) and the old README can be found [here](./README.md)

## Usage

### Set up

This repo must be cloned in the same root directory as a Moonbeam and a Polkadot clone.

The Moonbeam parachain and Polkadot relay chains must be compiled folowing the instructions [here](https://github.com/PureStake/moonbeam/blob/joshy-parachains-v1/launch-notes.md).

IMPORTANT: Dont' forget to run `curl https://getsubstrate.io -sSf | bash -s -- --fast` in your cli once to configure rustup and other tools correctly.
Moreover, you need to run `./scripts/init.sh` in both the Moonbeam and the Polkadot repo in order for the compilation to work.

Also, you need to run `yarn` in this repo in order to install the dependancies.

### Launch

To launch the process, run `yarn start` followed by the config file of your choice.

#### config files

For moonbeam, run `yarn start config_moonbeam.json`

`config_moonbeam.json` for 'normal' setup
`config_moonbeam_minimal.json` for the least amount of nodes - 2 validators and 1 collator (most tests require 2 collators)
`config_moonbeam_many_nodes.json` for 6 validator nodes and 5 collator nodes


### Test
To start a test sequence, launch one of these commands on another terminal:

`ts-node ./scripts_moonbeam/test_simple_transfer.ts` - for one simple transfer followed by 10 transfers

`ts-node ./scripts_moonbeam/test_many_transfers.ts X` - to send X transfers at the same time from the first collator node

`ts-node ./scripts_moonbeam/test_multi_node_transfers.ts X` - to send X transfers from each node at the same time

NB: Make sure you have ts-node installed globally.

## Development

To work on this project, you will need [`yarn`](https://yarnpkg.com/).

Install all NodeJS dependencies with:

```bash
yarn
```

This project uses ES6 syntax, which means we need to transpile it to NodeJS compatible JavaScript with [`babel`](https://babeljs.io/).

To do this, you just run:

```bash
yarn build
```

This will create a `dist` folder with JavaScript that you can run with `node`.

These steps can be done for you automatically by running:

```bash
yarn start
```

When you have finished your changes, make a [pull request](https://github.com/shawntabrizi/polkadot-launch/pulls) to this 
