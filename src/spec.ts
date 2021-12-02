import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { encodeAddress } from "@polkadot/util-crypto";
import { ChainSpec, HrmpChannelsConfig } from "./types";
const fs = require("fs");

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
export function clearAuthorities(spec: string) {
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
export async function addAuthority(spec: string, name: string) {
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
export async function addGenesisParachain(
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
export async function addGenesisHrmpChannel(
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
export async function changeGenesisConfig(spec: string, updates: any) {
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

export async function addBootNodes(spec: any, addresses: any) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);
	chainSpec.bootNodes = addresses;
	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Added Boot Nodes: ${addresses}`);
}
