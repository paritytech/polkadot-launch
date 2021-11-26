# polkadot-launch

Simple CLI tool to launch a local [Polkadot](https://github.com/paritytech/polkadot/) test network.

## Install

```
yarn global add polkadot-launch
```

Or, if you use `npm`:

```bash
npm i polkadot-launch -g
```

## Binary Files

To use polkadot-launch, you need to have binary files for a `polkadot` relay chain and a
`polkadot-collator`.

You can generate these files by cloning the `rococo-v1` branch of these projects and building them
with the specific flags below:

```bash
git clone https://github.com/paritytech/polkadot
cd polkadot
cargo build --release
```

and

```
git clone https://github.com/paritytech/cumulus
cd cumulus
cargo build --release -p polkadot-collator
```

## Use

```bash
polkadot-launch config.json
```

### Configuration File

The required configuration file defines the properties of the network you want to set up.
You may use a json or a js file.

You can see the examples:
- [config.json](config.json)
- [config.js](config.js)

You may find the .js alternative more convenient if you need comments, trailing commas or if you prefer do dedup some portions of the config.

#### `relaychain`

- `bin`: The path of the [Polkadot relay chain binary](https://github.com/paritytech/polkadot/) used
  to setup your test network. For example `<path/to/polkadot>/target/release/polkadot`.
- `chain`: The chain you want to use to generate your spec (probably `rococo-local`).
- `nodes`: An array of nodes that will be validators on the relay chain.
  - `name`: Must be one of `alice`, `bob`, `charlie`, or `dave`.
  - `wsPort`: The websocket port for this node.
  - `port`: The TCP port for this node.
  - `nodeKey`: a secret key used for generating libp2p peer identifier. Optional.
  - `basePath`: The directory used for the blockchain db and other outputs. When unspecified, we use
    `--tmp`.
  - `flags`: Any additional command line flags you want to add when starting your node.
- `genesis`: A JSON object of the properties you want to modify from the genesis configuration.
  Non-specified properties will be unchanged from the original genesis configuration.

These variable are fed directly into the Polkadot binary and used to spawn a node:

```bash
<bin> \
    --chain=<chain>-raw.json \
    --tmp \
    --ws-port=<wsPort> \
    --port=<port> \
    --<name> \
```

An example of `genesis` is:

```json
"genesis": {
  "runtime": {
    "runtime_genesis_config": {
      "configuration": {
        "config": {
          "validation_upgrade_frequency": 1,
          "validation_upgrade_delay": 1
        }
      },
      "palletCollective": {
        "members": ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", "5DbKjhNLpqX3zqZdNBc9BGb4fHU1cRBaDhJUskrvkwfraDi6"]
      }
    },
    "session_length_in_blocks": 10
  }
}
```

All `genesis` properties can be found in the chainspec output:

```bash
./polkadot build-spec --chain=rococo-local --disable-default-bootnode
```

#### `parachains`

`parachains` is an array of objects that consists of:

- `bin`: The path of the [collator node
  binary](https://github.com/substrate-developer-hub/substrate-parachain-template) used to create
  blocks for your parachain. For example
  `<path/to/substrate-parachain-template>/target/release/polkadot-collator`.
- `id`: The id to assign to this parachain. Must be unique.
- `wsPort`: The websocket port for this node.
- `port`: The TCP port for this node.
- `balance`: (Optional) Configure a starting amount of balance on the relay chain for this chain's
  account ID.
- `chain`: (Optional) Configure an alternative chain specification to be used for launching the
  parachain.
- `basePath`: The directory used for the blockchain db and other outputs. When unspecified, we use
  `--tmp`.
- `flags`: Any additional command line flags you want to add when starting your node.

These variables are fed directly into the collator binary and used to spawn a node:

```bash
<bin> \
    --tmp \
    --ws-port=<wsPort> \
    --port=<port> \
    --parachain-id=<id> \
    --validator \
    --chain=<chain>
    -- \
    --chain=<relaychain.chain>-raw.json \
```

#### `simpleParachains`

This is similar to `parachains` but for "simple" collators like the adder-collator, a very simple
collator that lives in the polkadot repo and is meant just for simple testing. It supports a subset
of configuration values:

- `bin`: The path to the collator binary.
- `id`: The id to assign to this parachain. Must be unique.
- `port`: The TCP port for this node.
- `balance`: (Optional) Configure a starting amount of balance on the relay chain for this chain's
  account ID.

#### `hrmpChannels`

Open HRMP channels between the specified parachains so that it's possible to send messages between
those. Keep in mind that an HRMP channel is unidirectional and in case you need to communicate both
ways you need to open channels in both directions.

```json
"hrmpChannels": [
    {
        "sender": "200",
        "recipient": "300",
        "maxCapacity": 8,
        "maxMessageSize": 512
    }
]
```

#### `types`

These are the Polkadot JS types you might need to include so that Polkadot JS will be able to
interface properly with your runtime.

```json
"types": {
    "HrmpChannelId": {
        "sender": "u32",
        "receiver": "u32"
    }
}
```

Or you can specify a path to the type definition json file instead:

```json
"types": "./typedefs.json"
```

#### `finalization`

A simple boolean flag for whether you want to make sure all of the transactions submitted in
polkadot-launch wait for finalization.

## How Does It Work?

This tool just automates the steps needed to spin up multiple relay chain nodes and parachain nodes
in order to create a local test network.

- [`child_process`](https://nodejs.org/api/child_process.html) is used to execute commands on your
  node:
  - We build a fresh chain spec using the `chain` parameter specified in your config.
    - Includes the authorities you specified.
    - Includes changes to the `paras`.
    - Includes parachains you have added.
      - `wasm` is generated using the `<node> export-genesis-wasm` subcommand.
      - `header` is retrieved by calling `api.rpc.chain.getHeader(genesis_hash)`.
    - The final file is named `<chain>-raw.json`.
  - We spawn new node instances using the information provided in your config. Each node produces a
    `<name>.log` file in your working directory that you can use to track the output. For example:
    ```bash
    tail -f alice.log # Alice validator on the relay chain
    # or
    tail -f 9988.log # Collator for Parachain ID 200 on wsPort 9988
    ```
- [`polkadot-js api`](https://polkadot.js.org/api/) is used to connect to these spawned nodes over
  their WebSocket endpoint.

## Development

To work on this project, you will need [`yarn`](https://yarnpkg.com/).

Install all NodeJS dependencies with:

```bash
yarn
```

Start the application with:

```bash
yarn start config.json
```

When you have finished your changes, make a [pull
request](https://github.com/paritytech/polkadot-launch/pulls) to this repo.

## Get Help

Open an [issue](https://github.com/paritytech/polkadot-launch/issues) if you have problems or
feature requests!
