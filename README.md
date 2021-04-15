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
`rococo-collator`.

You can generate these files by cloning the `rococo-v1` branch of these projects and building them
with the specific flags below:

```bash
git clone -b rococo-v1 https://github.com/paritytech/polkadot
cd polkadot
cargo build --release --features=real-overseer
```

and

```
git clone -b rococo-v1 https://github.com/paritytech/cumulus
cd cumulus
cargo build --release -p rococo-collator
```

## Use

```bash
polkadot-launch config.json
```

### Configuration File

The required configuration file defines the properties of the network you want to set up.

You can see an example [here](config.json).

#### `relaychain`

- `bin`: The path of the [Polkadot relay chain binary](https://github.com/paritytech/polkadot/) used
  to setup your test network. For example `<path/to/polkadot>/target/release/polkadot`.
- `chain`: The chain you want to use to generate your spec (probably `rococo-local`).
- `nodes`: An array of nodes that will be validators on the relay chain.
  - `name`: Must be one of `alice`, `bob`, `charlie`, or `dave`.
  - `wsPort`: The websocket port for this node.
  - `port`: The TCP port for this node.

These variable are fed directly into the Polkadot binary and used to spawn a node:

```bash
<bin> \
    --chain=<chain>-raw.json \
    --tmp \
    --ws-port=<wsPort> \
    --port=<port> \
    --<name> \
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
"htmpChannels": [
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
  - We build a fresh chain spec using the `chain` parameter specified in your config. This will
    include the authorities you specified. The final file is named `<chain>-raw.json`.
  - We spawn new node instances using the information provided in your config. Each node produces a
    `<name>.log` file in your working directory that you can use to track the output. For example:
    ```bash
    tail -f alice.log # Alice validator on the relay chain
    # or
    tail -f 9988.log # Collator for Parachain ID 200 on wsPort 9988
    ```
- [`polkadot-js api`](https://polkadot.js.org/api/) is used to connect to these spawned nodes over
  their WebSocket endpoint.
  - `api.rpc.system.localPeerId()` is used to retrieve the node's PeerId.
  - `api.rpc.system.peers()` is used to retrieve connected peers to a node.
  - `api.tx.sudo.sudo(api.tx.registrar.registerPara(id, always, wasm, header))` is used to register
    a parachain.
    - `wasm` is generated using the `<node> export-genesis-wasm` subcommand.
    - `header` is retrieved by calling `api.rpc.chain.getHeader(genesis_hash)`.

## Simulating chaos

By default `polkadot-launch` will spawn the nodes as regular processes on your computer, additionally it also
supports launching the nodes as docker containers and it integrates with [blockade](https://github.com/worstcase/blockade)
to be able to simulate arbitrary network failures.

### Requirements

- docker
- blockade

You'll need to have docker running on your computer and will need to have docker images available for all
the nodes you're going to launch. Docker files for the relaychain nodes and collators are provided in the
`docker/` folder and can be built with `./docker/build-images.sh`.

To install blockade you'll need to have Python 2.7 installed and you should then be able to do:

`pip install blockade`

For nix users the provided `shell.nix` defines all the dependencies required to install blockade locally.

### Usage

Launch the network with `polkadot-launch config.json`. Once the launch process is complete you can use
the blockade tool to generate network failures.

```
> blockade status
NODE             CONTAINER ID    STATUS  IP              NETWORK    PARTITION
parachain1       0bcd0e676c2e    UP      172.17.0.2      NORMAL
parachain2       e425a139093c    UP      172.17.0.4      NORMAL
relay1           327e79ecc829    UP      172.17.0.8      NORMAL
relay2           5ecc3364293b    UP      172.17.0.7      NORMAL
relay3           bd6ebe188b4a    UP      172.17.0.3      NORMAL
relay4           225719ce1933    UP      172.17.0.5      NORMAL
simpleParachain1 af10c596612d    UP      172.17.0.6      NORMAL
```

```
> blockade flaky parachain1
```

This command will induce a packet loss of ~30% on the node `parachain1`. 

Latency can be simulated with:

```
> blockade slow parachain1
```

And we can also add arbitrary partitions to the network:

```
blockade partition relay1,relay2,relay3,relay4
```

This will create a partition on the network where the relay chain nodes will be
on their own partition and therefore unable to connect to the collators.

To heal the partitions do:

```
> blockade join
```

For reference on how to use blockade check: https://github.com/worstcase/blockade#commands.

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
