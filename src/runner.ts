#!/usr/bin/env node

import {
	startNode,
	startCollator,
	generateChainSpec,
	generateChainSpecRaw,
	exportGenesisWasm,
	exportGenesisState,
	startSimpleCollator,
	getParachainIdFromSpec,
} from "./spawn";
import { connect, setBalance } from "./rpc";
import { checkConfig } from "./check";
import {
	clearAuthorities,
	addAuthority,
	changeGenesisConfig,
	addGenesisParachain,
	addGenesisHrmpChannel,
	addBootNodes,
} from "./spec";
import { parachainAccount } from "./parachain";
import { ApiPromise } from "@polkadot/api";
import { randomAsHex } from "@polkadot/util-crypto";

import { resolve } from "path";
import fs from "fs";
import type {
	LaunchConfig,
	ResolvedParachainConfig,
	ResolvedSimpleParachainConfig,
	HrmpChannelsConfig,
	ResolvedLaunchConfig,
} from "./types";
import { keys as libp2pKeys } from "libp2p-crypto";
import { hexAddPrefix, hexStripPrefix, hexToU8a } from "@polkadot/util";
import PeerId from "peer-id";

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

export async function run(config_dir: string, rawConfig: LaunchConfig) {
	// We need to reset that variable when running a new network
	registeredParachains = {};
	// Verify that the `config.json` has all the expected properties.
	if (!checkConfig(rawConfig)) {
		return;
	}
	const config = await resolveParachainId(config_dir, rawConfig);
	var bootnodes = await generateNodeKeys(config);

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
	await addParachainsToGenesis(
		config_dir,
		`${chain}.json`,
		config.parachains,
		config.simpleParachains
	);
	if (config.hrmpChannels) {
		await addHrmpChannelsToGenesis(`${chain}.json`, config.hrmpChannels);
	}
	addBootNodes(`${chain}.json`, bootnodes);
	// -- End Chain Spec Modify --
	await generateChainSpecRaw(relay_chain_bin, chain);
	const spec = resolve(`${chain}-raw.json`);

	// First we launch each of the validators for the relay chain.
	for (const node of config.relaychain.nodes) {
		const { name, wsPort, rpcPort, port, flags, basePath, nodeKey } = node;
		console.log(
			`Starting Relaychain Node ${name}... wsPort: ${wsPort} rpcPort: ${rpcPort} port: ${port} nodeKey: ${nodeKey}`
		);
		// We spawn a `child_process` starting a node, and then wait until we
		// able to connect to it using PolkadotJS in order to know its running.
		startNode(
			relay_chain_bin,
			name,
			wsPort,
			rpcPort,
			port,
			nodeKey!, // by the time the control flow gets here it should be assigned.
			spec,
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
		const { resolvedId, balance, chain: paraChain } = parachain;

		const bin = resolve(config_dir, parachain.bin);
		if (!fs.existsSync(bin)) {
			console.error("Parachain binary does not exist: ", bin);
			process.exit();
		}
		let account = parachainAccount(resolvedId);

		for (const node of parachain.nodes) {
			const { wsPort, port, flags, name, basePath, rpcPort } = node;
			console.log(
				`Starting a Collator for parachain ${resolvedId}: ${account}, Collator port : ${port} wsPort : ${wsPort} rpcPort : ${rpcPort}`
			);
			await startCollator(bin, wsPort, rpcPort, port, {
				name,
				spec,
				flags,
				chain:paraChain,
				basePath,
				onlyOneParachainNode: config.parachains.length === 1,
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
			await startSimpleCollator(bin, resolvedId, spec, port, skipIdArg);

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

interface GenesisParachain {
	isSimple: boolean;
	resolvedId: string;
	chain?: string;
	bin: string;
}

async function addParachainsToGenesis(
	config_dir: string,
	spec: string,
	parachains: ResolvedParachainConfig[],
	simpleParachains: ResolvedSimpleParachainConfig[]
) {
	console.log("\n⛓ Adding Genesis Parachains");

	// Collect all paras into a single list
	let x: GenesisParachain[] = parachains.map((p) => {
		return { isSimple: false, ...p };
	});
	let y: GenesisParachain[] = simpleParachains.map((p) => {
		return { isSimple: true, ...p };
	});
	let paras = x.concat(y);

	for (const parachain of paras) {
		const { resolvedId, chain } = parachain;
		const bin = resolve(config_dir, parachain.bin);
		if (!fs.existsSync(bin)) {
			console.error("Parachain binary does not exist: ", bin);
			process.exit();
		}
		// If it isn't registered yet, register the parachain in genesis
		if (!registeredParachains[resolvedId]) {
			// Get the information required to register the parachain in genesis.
			let genesisState: string;
			let genesisWasm: string;
			try {
				genesisState = await exportGenesisState(bin, chain);
				genesisWasm = await exportGenesisWasm(bin, chain);
			} catch (err) {
				console.error(err);
				process.exit(1);
			}

			await addGenesisParachain(
				spec,
				resolvedId,
				genesisState,
				genesisWasm,
				true
			);
			registeredParachains[resolvedId] = true;
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

// Resolves parachain id from chain spec if not specified
async function resolveParachainId(
	config_dir: string,
	config: LaunchConfig
): Promise<ResolvedLaunchConfig> {
	console.log(`\n🧹 Resolving parachain id...`);
	const resolvedConfig = config as ResolvedLaunchConfig;
	for (const parachain of resolvedConfig.parachains) {
		if (parachain.id) {
			parachain.resolvedId = parachain.id;
		} else {
			const bin = resolve(config_dir, parachain.bin);
			const paraId = await getParachainIdFromSpec(bin, parachain.chain);
			console.log(`  ✓ Read parachain id for ${parachain.bin}: ${paraId}`);
			parachain.resolvedId = paraId.toString();
		}
	}
	for (const parachain of resolvedConfig.simpleParachains) {
		parachain.resolvedId = parachain.id;
	}
	return resolvedConfig;
}

async function generateNodeKeys(
	config: ResolvedLaunchConfig
): Promise<string[]> {
	var bootnodes = [];
	for (const node of config.relaychain.nodes) {
		if (!node.nodeKey) {
			node.nodeKey = hexStripPrefix(randomAsHex(32));
		}

		let pair = await libp2pKeys.generateKeyPairFromSeed(
			"Ed25519",
			hexToU8a(hexAddPrefix(node.nodeKey!)),
			1024
		);
		let peerId: PeerId = await PeerId.createFromPrivKey(pair.bytes);
		bootnodes.push(
			`/ip4/127.0.0.1/tcp/${node.port}/p2p/${peerId.toB58String()}`
		);
	}

	return bootnodes;
}
