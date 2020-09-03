#!/usr/bin/env node

import { startNode, startCollator, killAll } from './spawn';
import { connect, registerParachain, getHeader } from './rpc';
import { wasmHex } from './wasm';
import { checkConfig } from './check';

const { resolve, dirname } = require('path');

// Special care is needed to handle paths to various files (binaries, spec, config, etc...)
// The user passes the path to `config.json`, and we use that as the starting point for any other
// relative path. So the `config.json` file is what we will be our starting point.
const config_file = process.argv[2];
if (!config_file) {
	console.error("Missing config file argument...");
	process.exit();
}
let config_path = resolve(process.cwd(), config_file);
let config_dir = dirname(config_path);
let config = require(config_path);

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function main() {
	// Verify that the `config.json` has all the expected properties.
	if (!checkConfig(config)) {
		return;
	}

	// TODO: We probably can generate a chainspec on the fly, and no have it be
	// a file provided by the user.
	const spec = resolve(config_dir, config.relaychain.spec);

	// First we launch each of the validators for the relay chain.
	for (const node of config.relaychain.nodes) {
		const bin = resolve(config_dir, config.relaychain.bin);
		const { name, wsPort, port } = node;
		// We hide the CLI output of relay chains.
		// TODO: Make configurable.
		const show = false;
		// We spawn a `child_process` starting a node, and then wait until we
		// able to connect to it using PolkadotJS in order to know its running.
		startNode(bin, name, wsPort, port, spec, show);
		let api = await connect(wsPort);
		console.log(`Launched ${name} (${wsPort}):`, api.genesisHash.toHex());
	}

	// Then launch each parachain and register it on the relay chain.
	for (const parachain of config.parachains) {
		const { id, wsPort, port } = parachain;
		const bin = resolve(config_dir, parachain.bin);
		// We show the node output of each parachain, which also includes details
		// about the relay chain. TODO: Make configurable.
		const show = true;
		// This will also create an `<id>.wasm` file in the same directory as `bin`.
		startCollator(bin, id, wsPort, port, spec, show)
		// Similarly to before, we wait until we can connect to the node to know
		// that it has launched successfully.
		const api = await connect(wsPort);
		console.log(`Launched Parachain ${id} (${wsPort}):`, api.genesisHash.toHex());

		// Get the information required to register the parachain on the relay chain.
		let header = await getHeader(api);
		let bin_path = dirname(bin);
		let wasm = wasmHex(resolve(bin_path, `${id}.wasm`));
		// Connect to the first relay chain node to submit the extrinsic.
		let relayChainApi = await connect(config.relaychain.nodes[0].wsPort);
		await registerParachain(relayChainApi, id, wasm, header)
		// Allow time for the TX to complete, avoiding nonce issues.
		// TODO: Handle nonce directly instead of this.
		await sleep(6000);
	}
}

// Kill all processes when exiting.
process.on('exit', function () {
	killAll();
});

// Handle ctrl+c to trigger `exit`.
process.on('SIGINT', function () {
	process.exit(2);
});

main();
