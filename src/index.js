#!/usr/bin/env node

import { startNode, startCollator, killAll, generateChainSpec, generateChainSpecRaw } from './spawn';
import { connect, registerParachain, getHeader, setBalance, changeMaxDownwardMessageSize, listenAddresses } from './rpc';
import { wasmHex } from './wasm';
import { checkConfig } from './check';
import { clearAuthorities, addAuthority, addBootNodes } from './spec';
import { parachainAccount } from './parachain';

const { resolve, dirname } = require('path');
const fs = require('fs');

// Special care is needed to handle paths to various files (binaries, spec, config, etc...)
// The user passes the path to `config.json`, and we use that as the starting point for any other
// relative path. So the `config.json` file is what we will be our starting point.
const { argv } = require('yargs')

const config_file = argv._[0] ? argv._[0] : null;
if (!config_file) {
	console.error("Missing config file argument...");
	process.exit();
}
let config_path = resolve(process.cwd(), config_file);
let config_dir = dirname(config_path);
if (!fs.existsSync(config_path)) {
	console.error("Config file does not exist: ", config_path);
	process.exit();
}
let config = require(config_path);

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function main() {
	try {
		// Verify that the `config.json` has all the expected properties.
		if (!checkConfig(config)) {
			return;
		}

		const relay_chain_bin = resolve(config_dir, config.relaychain.bin);
		if (!fs.existsSync(relay_chain_bin)) {
			console.error("Relay chain binary does not exist: ", relay_chain_bin);
			process.exit();
		}
		const chain = config.relaychain.chain;
		await generateChainSpec(relay_chain_bin, chain);
		clearAuthorities(`${chain}.json`);
		for (const node of config.relaychain.nodes) {
			await addAuthority(`${chain}.json`, node.name);
		}
		await generateChainSpecRaw(relay_chain_bin, chain);
		const spec = resolve(`${chain}-raw.json`);

		let nodes = config.relaychain.nodes;
		let first_node = nodes.shift();

		// Launch the first node
		const { name, wsPort, port, flags } = first_node;
		console.log(`Starting ${name}...`);
		startNode(relay_chain_bin, name, wsPort, port, spec, flags);
		let relayChainApi = await connect(wsPort, config.types);

		// We get listen address
		let addresses = await listenAddresses(relayChainApi);
		await addBootNodes(`${chain}-raw.json`, addresses);
		const spec_bootnode = resolve(`${chain}-raw.json`);

		// Then we launch the rest with the correct boot node
		for (const node of nodes) {
			const { name, wsPort, port, flags } = node;
			console.log(`Starting ${name}...`);
			// We spawn a `child_process` starting a node, and then wait until we
			// able to connect to it using PolkadotJS in order to know its running.
			startNode(relay_chain_bin, name, wsPort, port, spec_bootnode, flags);
		}

		// Then launch each parachain w/ bootnode
		for (const parachain of config.parachains) {
			const { id, wsPort, port, flags, balance, chain } = parachain;
			const bin = resolve(config_dir, parachain.bin);
			if (!fs.existsSync(bin)) {
				console.error("Parachain binary does not exist: ", bin);
				process.exit();
			}
			let account = parachainAccount(id);
			console.log(`Starting Parachain ${id}: ${account}`);
			// This will also create an `<id>.wasm` file in the same directory as `bin`.
			startCollator(bin, id, wsPort, port, chain, spec_bootnode, flags)
		}

		// Then register each parachain on the relay chain.
		for (const parachain of config.parachains) {
			const { id, wsPort, port, flags, balance, chain } = parachain;
			const bin = resolve(config_dir, parachain.bin);
			let account = parachainAccount(id);

			console.log(`Connecting to Parachain ${id}`);
			const api = await connect(wsPort, config.types);
			console.log(`Registering Parachain ${id}`);

			// Get the information required to register the parachain on the relay chain.
			let header = await getHeader(api);
			let bin_path = dirname(bin);
			let wasm = wasmHex(resolve(bin_path, `${id}.wasm`));
			await registerParachain(relayChainApi, id, wasm, header);
			await changeMaxDownwardMessageSize(relayChainApi, 100);
			// Allow time for the TX to complete, avoiding nonce issues.
			// TODO: Handle nonce directly instead of this.
			if (balance) {
				await setBalance(relayChainApi, account, balance)
			}
		}
	} catch(e) {
		console.error(e);
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
