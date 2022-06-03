#!/usr/bin/env node

import {
	startNode,
	startCollator,
	startSimpleCollator,
} from "./spawn";
import { connect, setBalance } from "./rpc";
import { checkConfig } from "./check";
import { prepareChainSpecs } from "./spec";
import { parachainAccount } from "./parachain";
import { ApiPromise } from "@polkadot/api";

import { resolve } from "path";
import fs from "fs";
import type { LaunchConfig } from "./types";

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

export async function run(config_dir: string, rawConfig: LaunchConfig) {

	// Verify that the `config.json` has all the expected properties.
	if (!checkConfig(rawConfig)) {
		return;
	}

	// First we prepare all Chain Specs (Relay, Paras and SimpleParas...)
	const config = await prepareChainSpecs(config_dir, rawConfig);

	// Then we launch each of the validators for the relay chain.
	for (const node of config.relaychain.nodes) {
		const { name, wsPort, rpcPort, port, flags, basePath, nodeKey } = node;
		console.log(
			`Starting Relaychain Node ${name}... wsPort: ${wsPort} rpcPort: ${rpcPort} port: ${port} nodeKey: ${nodeKey}`
		);
		// We spawn a `child_process` starting a node, and then wait until we
		// able to connect to it using PolkadotJS in order to know its running.
		startNode(
			config_dir,
			config.relaychain.bin,
			name,
			wsPort,
			rpcPort,
			port,
			nodeKey!, // by the time the control flow gets here it should be assigned.
			config.relayChainSpecRawPath,
			flags,
			basePath
		);
	}

	// Connect to the first relay chain node to submit the extrinsic.
	let relayChainApi: ApiPromise = await connect(
		config.relaychain.nodes[0].wsPort,
		loadTypeDef(config.types)
	);

	// Then launch each parachain
	for (const parachain of config.parachains) {
		const { resolvedId, balance } = parachain;

		let account = parachainAccount(resolvedId);

		for (const node of parachain.nodes) {
			const { wsPort, port, flags, name, basePath, rpcPort } = node;
			console.log(
				`Starting a Collator for parachain ${resolvedId}: ${account}, Collator port : ${port} wsPort : ${wsPort} rpcPort : ${rpcPort}`
			);
			await startCollator(config_dir, parachain.bin, wsPort, rpcPort, port, {
				name,
				spec: config.relayChainSpecRawPath,
				flags,
				chain: parachain.chainSpecRawPath,
				basePath,
				onlyOneParachainNode: parachain.nodes.length === 1,
			});
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
			const { id, resolvedId, port, balance } = simpleParachain;
			const bin = resolve(config_dir, simpleParachain.bin);
			if (!fs.existsSync(bin)) {
				console.error("Simple parachain binary does not exist: ", bin);
				process.exit();
			}

			let account = parachainAccount(resolvedId);
			console.log(`Starting Parachain ${resolvedId}: ${account}`);
			const skipIdArg = !id;
			await startSimpleCollator(config_dir, bin, resolvedId, simpleParachain.chainSpecRawPath, port, skipIdArg);

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
