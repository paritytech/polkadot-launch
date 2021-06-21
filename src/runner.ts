#!/usr/bin/env node

import {
	startNode,
	startCollator,
	generateChainSpec,
	generateChainSpecRaw,
	exportGenesisWasm,
	exportGenesisState,
	startSimpleCollator,
} from "./spawn";
import { connect, registerParachain, setBalance } from "./rpc";
import { checkConfig } from "./check";
import {
	clearAuthorities,
	addAuthority,
	changeGenesisConfig,
	addGenesisParachain,
	addGenesisHrmpChannel,
} from "./spec";
import { parachainAccount } from "./parachain";
import { ApiPromise } from "@polkadot/api";

import { resolve } from "path";
import fs from "fs";
import { LaunchConfig, ParachainConfig, HrmpChannelsConfig } from "./types";

function loadTypeDef(types: string | object): object {
	if (typeof types === "string") {
		// Treat types as a json file path
		try {
			const rawdata = fs.readFileSync(types, { encoding: "utf-8" });
			return JSON.parse(rawdata);
		} catch {
			console.error("failed to load parachain typedef file");
			process.exit(1);
		}
	} else {
		return types;
	}
}

// keep track of registered parachains
let registeredParachains: { [key: string]: boolean } = {};

export async function run(config_dir: string, config: LaunchConfig) {
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
	// -- Start Chain Spec Modify --
	clearAuthorities(`${chain}.json`);
	for (const node of config.relaychain.nodes) {
		await addAuthority(`${chain}.json`, node.name);
	}
	if (config.relaychain.genesis) {
		await changeGenesisConfig(`${chain}.json`, config.relaychain.genesis);
	}
	await addParachainsToGenesis(config_dir, `${chain}.json`, config.parachains);
	await addHrmpChannelsToGenesis(`${chain}.json`, config.hrmpChannels);
	// -- End Chain Spec Modify --
	await generateChainSpecRaw(relay_chain_bin, chain);
	const spec = resolve(`${chain}-raw.json`);

	// First we launch each of the validators for the relay chain.
	for (const node of config.relaychain.nodes) {
		const { name, wsPort, port, flags } = node;
		console.log(`Starting ${name}...`);
		// We spawn a `child_process` starting a node, and then wait until we
		// able to connect to it using PolkadotJS in order to know its running.
		startNode(relay_chain_bin, name, wsPort, port, spec, flags);
	}

	// Connect to the first relay chain node to submit the extrinsic.
	let relayChainApi: ApiPromise = await connect(
		config.relaychain.nodes[0].wsPort,
		loadTypeDef(config.types)
	);

	// Then launch each parachain
	for (const parachain of config.parachains) {
		const { id, balance, chain } = parachain;
		const bin = resolve(config_dir, parachain.bin);
		if (!fs.existsSync(bin)) {
			console.error("Parachain binary does not exist: ", bin);
			process.exit();
		}
		let account = parachainAccount(id);

		for (const node of parachain.nodes) {
			const { wsPort, port, flags, name } = node;
			console.log(
				`Starting a Collator for parachain ${id}: ${account}, Collator port : ${port} wsPort : ${wsPort}`
			);
			await startCollator(bin, id, wsPort, port, name, chain, spec, flags);
		}

		// Allow time for the TX to complete, avoiding nonce issues.
		// TODO: Handle nonce directly instead of this.
		if (balance) {
			await setBalance(relayChainApi, account, balance, config.finalization);
		}
	}

	// Then launch each simple parachain (e.g. an adder-collator)
	if (config.simpleParachains) {
		for (const simpleParachain of config.simpleParachains) {
			const { id, port, balance } = simpleParachain;
			const bin = resolve(config_dir, simpleParachain.bin);
			if (!fs.existsSync(bin)) {
				console.error("Simple parachain binary does not exist: ", bin);
				process.exit();
			}

			let account = parachainAccount(id);
			console.log(`Starting Parachain ${id}: ${account}`);
			await startSimpleCollator(bin, id, spec, port);

			// Get the information required to register the parachain on the relay chain.
			let genesisState;
			let genesisWasm;
			try {
				// adder-collator does not support `--parachain-id` for export-genesis-state (and it is
				// not necessary for it anyway), so we don't pass it here.
				genesisState = await exportGenesisState(bin);
				genesisWasm = await exportGenesisWasm(bin);
			} catch (err) {
				console.error(err);
				process.exit(1);
			}

			console.log(`Registering Parachain ${id}`);
			await registerParachain(
				relayChainApi,
				id,
				genesisWasm,
				genesisState,
				config.finalization
			);

			// Allow time for the TX to complete, avoiding nonce issues.
			// TODO: Handle nonce directly instead of this.
			if (balance) {
				await setBalance(relayChainApi, account, balance, config.finalization);
			}
		}
	}

	// We don't need the PolkadotJs API anymore
	await relayChainApi.disconnect();
	
	console.log("🚀 POLKADOT LAUNCH COMPLETE 🚀");
}

async function addParachainsToGenesis(
	config_dir: string,
	spec: string,
	parachains: ParachainConfig[]
) {
	console.log("\n⛓ Adding Genesis Parachains");
	for (const parachain of parachains) {
		const { id, chain } = parachain;
		const bin = resolve(config_dir, parachain.bin);
		if (!fs.existsSync(bin)) {
			console.error("Parachain binary does not exist: ", bin);
			process.exit();
		}
		// If it isn't registered yet, register the parachain in genesis
		if (!registeredParachains[id]) {
			// Get the information required to register the parachain in genesis.
			let genesisState;
			let genesisWasm;
			try {
				genesisState = await exportGenesisState(bin, id, chain);
				genesisWasm = await exportGenesisWasm(bin, chain);
			} catch (err) {
				console.error(err);
				process.exit(1);
			}

			await addGenesisParachain(spec, id, genesisState, genesisWasm, true);
			registeredParachains[id] = true;
		}
	}
}

async function addHrmpChannelsToGenesis(
	spec: string,
	hrmpChannels: HrmpChannelsConfig[]
) {
	console.log("⛓ Adding Genesis HRMP Channels");
	for (const hrmpChannel of hrmpChannels) {
		await addGenesisHrmpChannel(spec, hrmpChannel);
	}
}
