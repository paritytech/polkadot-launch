import { Keyring } from "@polkadot/api";
import { cryptoWaitReady, encodeAddress, randomAsHex } from "@polkadot/util-crypto";

import {
	generateChainSpec,
	generateChainSpecRaw,
	exportGenesisWasm,
	exportGenesisState,
	getParachainIdFromSpec,
} from "./spawn";
import type {
	ChainSpec,
	LaunchConfig,
	HrmpChannelsConfig,
	ResolvedLaunchConfig,
} from "./types";

import { keys as libp2pKeys } from "libp2p-crypto";
import { hexAddPrefix, hexStripPrefix, hexToU8a } from "@polkadot/util";
import PeerId from "peer-id";
import { resolve } from "path";
const fs = require("fs");

export async function prepareChainSpecs(
	config_dir: string,
	rawConfig: LaunchConfig
): Promise<ResolvedLaunchConfig> {

	// We need to reset that variable when running a new network
	registeredParachains = {};

	let config = await resolveParachainId(config_dir, rawConfig);
	var bootnodes = await generateNodeKeys(config);

	const relay_chain_bin = resolve(config_dir, config.relaychain.bin);
	if (!fs.existsSync(relay_chain_bin)) {
		console.error("Relay chain binary does not exist: ", relay_chain_bin);
		process.exit();
	}
	const chain = config.relaychain.chain;
	
	const spec = resolve(config_dir, `${chain}.json`);
	const spec_raw = resolve(config_dir, `${chain}-raw.json`);

	await generateChainSpec(relay_chain_bin, chain, spec);
	// -- Start Relay Chain Spec Modify --
	clearAuthorities(spec);
	for (const node of config.relaychain.nodes) {
		await addAuthority(spec, node.name);
	}
	if (config.relaychain.genesis) {
		await changeGenesisConfig(spec, config.relaychain.genesis);
	}
	if (config.hrmpChannels) {
		await addHrmpChannelsToGenesis(spec, config.hrmpChannels);
	}
	addBootNodes(spec, bootnodes);

	config = await addParachainsToGenesis(config_dir, spec, config);

	// -- End Chain Spec Modify --
	await generateChainSpecRaw(relay_chain_bin, spec, spec_raw);

	config.relayChainSpecRawPath = spec_raw;

	return config;
}

function nameCase(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get authority keys from within chainSpec data
function getAuthorityKeys(chainSpec: ChainSpec) {
	// Check runtime_genesis_config key for rococo compatibility.
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;
	if (runtimeConfig && runtimeConfig.session) {
		return runtimeConfig.session.keys;
	}

	// For retro-compatibility with substrate pre Polkadot 0.9.5
	if (runtimeConfig && runtimeConfig.palletSession) {
		return runtimeConfig.palletSession.keys;
	}

	console.error("  ⚠ session not found in runtimeConfig");
	process.exit(1);
}

// Remove all existing keys from `session.keys`
function clearAuthorities(spec: string) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec;
	try {
		chainSpec = JSON.parse(rawdata);
	} catch {
		console.error("  ⚠ failed to parse the chain spec");
		process.exit(1);
	}

	let keys = getAuthorityKeys(chainSpec);
	keys.length = 0;

	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`\n🧹 Starting with a fresh authority set...`);
}

// Add additional authorities to chain spec in `session.keys`
async function addAuthority(spec: string, name: string) {
	await cryptoWaitReady();

	const sr_keyring = new Keyring({ type: "sr25519" });
	const sr_account = sr_keyring.createFromUri(`//${nameCase(name)}`);
	const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);

	const ed_keyring = new Keyring({ type: "ed25519" });
	const ed_account = ed_keyring.createFromUri(`//${nameCase(name)}`);

	const ec_keyring = new Keyring({ type: "ecdsa" });
	const ec_account = ec_keyring.createFromUri(`//${nameCase(name)}`);

	let key = [
		sr_stash.address,
		sr_stash.address,
		{
			grandpa: ed_account.address,
			babe: sr_account.address,
			im_online: sr_account.address,
			parachain_validator: sr_account.address,
			authority_discovery: sr_account.address,
			para_validator: sr_account.address,
			para_assignment: sr_account.address,
			beefy: encodeAddress(ec_account.publicKey),
		},
	];

	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	let keys = getAuthorityKeys(chainSpec);
	keys.push(key);

	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`  👤 Added Genesis Authority ${name}`);
}

// Add parachains to the chain spec at genesis.
async function addGenesisParachain(
	spec: string,
	para_id: string,
	head: string,
	wasm: string,
	parachain: boolean
) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	// Check runtime_genesis_config key for rococo compatibility.
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;
	let paras = undefined;
	if (runtimeConfig.paras) {
		paras = runtimeConfig.paras.paras;
	}
	// For retro-compatibility with substrate pre Polkadot 0.9.5
	else if (runtimeConfig.parachainsParas) {
		paras = runtimeConfig.parachainsParas.paras;
	}
	if (paras) {
		let new_para = [
			parseInt(para_id),
			{
				genesis_head: head,
				validation_code: wasm,
				parachain: parachain,
			},
		];

		paras.push(new_para);

		let data = JSON.stringify(chainSpec, null, 2);

		fs.writeFileSync(spec, data);
		console.log(`  ✓ Added Genesis Parachain ${para_id}`);
	} else {
		console.error("  ⚠ paras not found in runtimeConfig");
		process.exit(1);
	}
}

// Update the `genesis` object in the chain specification.
async function addGenesisHrmpChannel(
	spec: string,
	hrmpChannel: HrmpChannelsConfig
) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	let newHrmpChannel = [
		hrmpChannel.sender,
		hrmpChannel.recipient,
		hrmpChannel.maxCapacity,
		hrmpChannel.maxMessageSize,
	];

	// Check runtime_genesis_config key for rococo compatibility.
	const runtimeConfig =
		chainSpec.genesis.runtime.runtime_genesis_config ||
		chainSpec.genesis.runtime;

	let hrmp = undefined;

	if (runtimeConfig.hrmp) {
		hrmp = runtimeConfig.hrmp;
	}
	// For retro-compatibility with substrate pre Polkadot 0.9.5
	else if (runtimeConfig.parachainsHrmp) {
		hrmp = runtimeConfig.parachainsHrmp;
	}

	if (hrmp && hrmp.preopenHrmpChannels) {
		hrmp.preopenHrmpChannels.push(newHrmpChannel);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
		console.log(
			`  ✓ Added HRMP channel ${hrmpChannel.sender} -> ${hrmpChannel.recipient}`
		);
	} else {
		console.error("  ⚠ hrmp not found in runtimeConfig");
		process.exit(1);
	}
}

// Update the runtime config in the genesis.
// It will try to match keys which exist within the configuration and update the value.
async function changeGenesisConfig(spec: string, updates: any) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	console.log(`\n⚙ Updating Relay Chain Genesis Configuration`);

	if (chainSpec.genesis) {
		let config = chainSpec.genesis;
		findAndReplaceConfig(updates, config);

		let data = JSON.stringify(chainSpec, null, 2);
		fs.writeFileSync(spec, data);
	}
}

// Look at the key + values from `obj1` and try to replace them in `obj2`.
function findAndReplaceConfig(obj1: any, obj2: any) {
	// Look at keys of obj1
	Object.keys(obj1).forEach((key) => {
		// See if obj2 also has this key
		if (obj2.hasOwnProperty(key)) {
			// If it goes deeper, recurse...
			if (
				obj1[key] !== null &&
				obj1[key] !== undefined &&
				obj1[key].constructor === Object
			) {
				findAndReplaceConfig(obj1[key], obj2[key]);
			} else {
				obj2[key] = obj1[key];
				console.log(
					`  ✓ Updated Genesis Configuration [ ${key}: ${obj2[key]} ]`
				);
			}
		} else {
			console.error(`  ⚠ Bad Genesis Configuration [ ${key}: ${obj1[key]} ]`);
		}
	});
}

async function addBootNodes(spec: any, addresses: any) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);
	chainSpec.bootNodes = addresses;
	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Added Boot Nodes: ${addresses}`);
}

async function updateParachainId(spec: any, para_id: number) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);
	let old_id = chainSpec.para_id;
	chainSpec.para_id = para_id;
	if (chainSpec.genesis?.runtime?.parachainInfo?.parachainId) {
		chainSpec.genesis.runtime.parachainInfo.parachainId = para_id;
	}
	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Updating Parachain Id: ${old_id} -> ${para_id}`);
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

async function addHrmpChannelsToGenesis(
	spec: string,
	hrmpChannels: HrmpChannelsConfig[]
) {
	console.log("⛓ Adding Genesis HRMP Channels");
	for (const hrmpChannel of hrmpChannels) {
		await addGenesisHrmpChannel(spec, hrmpChannel);
	}
}

// keep track of registered parachains
let registeredParachains: { [key: string]: boolean } = {};

async function generateParachainSpec(config_dir: string, spec: string, parachain: any) {
	const { resolvedId, chain } = parachain;
	const bin = resolve(config_dir, parachain.bin);
	if (!fs.existsSync(bin)) {
		console.error("Simple/Parachain binary does not exist: ", bin);
		process.exit();
	}
	// If it isn't registered yet, register the parachain in genesis
	if (!registeredParachains[resolvedId]) {
		// Get the information required to register the parachain in genesis.
		let parachain_spec: string;
		let parachain_spec_raw: string;
		let genesisState: string;
		let genesisWasm: string;
		try {
			parachain_spec = resolve(config_dir, `parachain${chain ? "-" + chain : ""}-${resolvedId}.json`);
			parachain_spec_raw = resolve(config_dir, `parachain${chain ? "-" + chain : ""}-${resolvedId}-raw.json`);

			await generateChainSpec(bin, "", parachain_spec);
			await updateParachainId(parachain_spec, parseInt(resolvedId));
			await generateChainSpecRaw(bin, parachain_spec, parachain_spec_raw);

			genesisState = await exportGenesisState(bin, parachain_spec_raw);
			genesisWasm = await exportGenesisWasm(bin, parachain_spec_raw);

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
		parachain.chainSpecRawPath = parachain_spec_raw;
	}
}

async function addParachainsToGenesis(
	config_dir: string,
	spec: string,
	config: ResolvedLaunchConfig
): Promise<ResolvedLaunchConfig> {
	console.log("\n⛓ Adding Genesis Parachains");
	for (const parachain of config.parachains) {
		await generateParachainSpec(config_dir, spec, parachain);
	}
	for (const simpleParachainhain of config.simpleParachains) {
		await generateParachainSpec(config_dir, spec, simpleParachainhain);
	}
	return config;
}
