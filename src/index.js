#!/usr/bin/env node

import { startNode, startCollator, killAll } from './spawn';
import { connect, registerParachain, getHeader } from './rpc';
import { wasmHex } from './wasm';
import { checkConfig } from './check';

const { resolve, dirname } = require('path');

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
	if (!checkConfig(config)) {
		return;
	}

	const spec = resolve(config_dir, config.relaychain.spec);

	for (const node of config.relaychain.nodes) {
		const bin = resolve(config_dir, config.relaychain.bin);
		const { name, wsPort, port } = node;
		// Show Node output
		const show = false;

		startNode(bin, name, wsPort, port, spec, show);
		let api = await connect(wsPort);
		console.log(`Launched ${name} (${wsPort}):`, api.genesisHash.toHex());
	}

	for (const parachain of config.parachains) {
		const { id, wsPort, port } = parachain;
		const bin = resolve(config_dir, parachain.bin);
		// Show Node output
		const show = true;
		// This will also create an `<id>.wasm` file in the working directory.
		startCollator(bin, id, wsPort, port, spec, show)

		const api = await connect(wsPort);
		console.log(`Launched Parachain ${id} (${wsPort}):`, api.genesisHash.toHex());

		let header = await getHeader(api);
		let wasm = wasmHex(`./${id}.wasm`);
		let relayChainApi = await connect(config.relaychain.nodes[0].wsPort);
		await registerParachain(relayChainApi, id, wasm, header)
		// Allow time for the TX to complete
		await sleep(6000);
	}
}

// Kill all processes when exiting
process.on('exit', function () {
	killAll();
});

// Handle ctrl+c
process.on('SIGINT', function () {
	process.exit(2);
});

main();
