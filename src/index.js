#!/usr/bin/env node

import { startNode, startCollator, killAll } from './spawn';
import { connect, registerParachain, getHeader } from './rpc';
import { wasmHex } from './wasm';
import { checkConfig } from './check';

const fs = require('fs');

const config_file = process.argv[2];
if (!config_file) {
	console.error("Missing config file argument...");
	process.exit()
}
let config = require('../' + config_file)

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function main() {
	if (!checkConfig(config)) {
		return;
	}

	const spec = config.relaychain.spec;

	for (const node of config.relaychain.nodes) {
		const bin = "./" + config.relaychain.bin;
		const { name, wsPort, port } = node;
		// Show Node output
		const show = false;

		startNode(bin, name, wsPort, port, spec, show);
		console.log(`Launched ${name}. (${wsPort})`);
		await sleep(2000);
	}

	for (const parachain of config.parachains) {
		const { id, wsPort, port } = parachain;
		const bin = "./" + parachain.bin;
		// Show Node output
		const show = true;
		// This will also create an `<id>.wasm` file in the working directory.
		startCollator(bin, id, wsPort, port, spec, show)

		await sleep(5000);
		const api = await connect(wsPort);
		let header = await getHeader(api);

		if (header) {
			let wasm = wasmHex(`./${id}.wasm`);
			let relayChainApi = await connect(config.relaychain.nodes[0].wsPort);
			await registerParachain(relayChainApi, id, wasm, header)
		}
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
