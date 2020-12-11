# polkadot-launch
 Simple CLI tool to launch a local [Polkadot](https://github.com/paritytech/polkadot/) test network.

## Install

```bash
npm i polkadot-launch -g
```

## Use

```bash
polkadot-launch config.json
```

### Configuration File

The required configuration file defines the properties of the network you want to set up.

The file has three sections: `relaychain`, `parachains`, `types`. You can see an example [here](config.json).

#### `relaychain`

* `bin`: The path of the [Polkadot relay chain binary](https://github.com/paritytech/polkadot/) used to setup your test network. For example `<path/to/polkadot>/target/release/polkadot`.
* `chain`: The chain you want to use to generate your spec (probably `rococo-local`).
* `nodes`: An array of nodes that will be validators on the relay chain.
	* `name`: Must be one of `alice`, `bob`, `charlie`, or `dave`.
	* `wsPort`: The websocket port for this node.
	* `port`: The TCP port for this node.

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

* `bin`: The path of the [collator node binary](https://github.com/substrate-developer-hub/substrate-parachain-template) used to create blocks for your parachain. For example `<path/to/substrate-parachain-template>/target/release/polkadot-collator`.
* `id`: The id to assign to this parachain. Must be unique.
* `wsPort`: The websocket port for this node.
* `port`: The TCP port for this node.
* `balance`: (Optional) Configure a starting amount of balance on the relay chain for this chain's account ID.
* `chain`: (Optional) Configure an alternative chain specification to be used for launching the parachain.

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

* `bin`: The path to the collator binary.
* `id`: The id to assign to this parachain. Must be unique.
* `port`: The TCP port for this node.
* `balance`: (Optional) Configure a starting amount of balance on the relay chain for this chain's account ID.

#### `types`

These are the Polkadot JS types you might need to include so that Polkadot JS will be able to interface properly
with your runtime.

```json
"types": {
	"HrmpChannelId": {
		"sender": "u32",
		"receiver": "u32"
	}
}
```

## How Does It Work?

This tool just automates the steps needed to spin up multiple relay chain nodes and parachain nodes in order to create a local test network.

* [`child_process`](https://nodejs.org/api/child_process.html) is used to execute commands on your node:
	* We build a fresh chain spec using the `chain` parameter specified in your config. This will include the authorities you specified. The final file is named `<chain>-raw.json`.
	* We spawn new node instances using the information provided in your config. Each node produces a `<name>.log` file in your working directory that you can use to track the output. For example:
		```bash
		tail -f alice.log # Alice validator on the relay chain
		# or
		tail -f 200.log # Collator for Parachain ID 200
		```
* [`polkadot-js api`](https://polkadot.js.org/api/) is used to connect to these spawned nodes over their WebSocket endpoint.
	* `api.rpc.system.localPeerId()` is used to retrieve the node's PeerId.
	* `api.rpc.system.peers()` is used to retrieve connected peers to a node.
	* `api.tx.sudo.sudo(api.tx.registrar.registerPara(id, always, wasm, header))` is used to register a parachain.
		* `wasm` is generated using the `<node> export-genesis-wasm` subcommand.
		* `header` is retrieved by calling `api.rpc.chain.getHeader(genesis_hash)`.

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

When you have finished your changes, make a [pull request](https://github.com/shawntabrizi/polkadot-launch/pulls) to this repo.

## Get Help

Open an [issue](https://github.com/shawntabrizi/polkadot-launch/issues) if you have problems or feature requests!
