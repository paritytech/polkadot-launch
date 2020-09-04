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

The file has two section: `relaychain` and `parachains`. You can see an example [here](config.json).

#### `relaychain`

* `bin`: The path of the [Polkadot relay chain binary](https://github.com/paritytech/polkadot/) used to setup your test network. For example `<path/to/polkadot>/target/release/polkadot`.
* `spec`: The path to the chain specification used to start your relay chain.
* `nodes`: An array of nodes that will be validators on the relay chain.
	* `name`: Must be one of `alice`, `bob`, `charlie`, or `dave`.
	* `wsPort`: The websocket port for this node.
	* `port`: The TCP port for this node.

These variable are fed directly into the Polkadot binary and used to spawn a node:

```bash
<bin> \
	--chain=<spec> \
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

These variables are fed directly into the collator binary and used to spawn a node:

```bash
<bin> \
	--tmp \
	--ws-port=<wsPort> \
	--port=<port> \
	--parachain-id=<id> \
	--validator \
	-- \
	--chain=<spec> \
```

The `spec` value will come from the `relaychain` configuration above.

## How Does It Work?

This tool just automates the steps needed to spin up multiple relay chain nodes and parachain nodes in order to create a local test network.

* [`child_process`](https://nodejs.org/api/child_process.html) is used to spawn new node instances using the information provided in your config.
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
