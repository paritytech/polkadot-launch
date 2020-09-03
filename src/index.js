#!/usr/bin/env node

import { startNode, startCollator } from './spawn';
import { connect, registerParachain, getHeader } from './rpc';
import { wasmHex } from './wasm';
import { checkConfig } from './check';

const fs = require('fs');

let config;
try {
	config = require('../config.json')
} catch {
	console.log("Missing Config File")
}

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
		const api = await connect(wsPort);
		console.log(`Launched ${name}`);
		//await sleep(2000);
	}

	let header;
	for (const parachain of config.parachains) {
		const { id, wsPort, port } = parachain;
		const bin = "./" + parachain.bin;
		// Show Node output
		const show = true;
		startCollator(bin, id, wsPort, port, spec, show)

		await sleep(5000);
		const api = await connect(wsPort);
		header = await getHeader(api);
	}

	if (header) {
		let wasm = wasmHex('./200.wasm');
		let relayChainApi = await connect(config.relaychain.nodes[0].wsPort);
		await registerParachain(relayChainApi, 200, wasm, header)
	}
}

main();
