import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { encodeAddress } from "@polkadot/util-crypto";
import { ChainSpec } from "./types";
const fs = require("fs");

function nameCase(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Get authority keys from within chainSpec data
function getAuthorityKeys(chainSpec: ChainSpec) {
	// this is the most recent spec struct
	if (
		chainSpec.genesis.runtime.runtime_genesis_config &&
		chainSpec.genesis.runtime.runtime_genesis_config.palletSession
	) {
		return chainSpec.genesis.runtime.runtime_genesis_config.palletSession.keys;
	}
	// Backward compatibility
	return chainSpec.genesis.runtime.palletSession.keys;
}

// Remove all existing keys from `session.keys`
export function clearAuthorities(spec: string) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec;
	try {
		chainSpec = JSON.parse(rawdata);
	} catch {
		console.error("failed to parse the chain spec");
		process.exit(1);
	}

	let keys = getAuthorityKeys(chainSpec);
	keys.length = 0;

	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Starting with a fresh authority set:`);
}

// Add additional authorities to chain spec in `session.keys`
export async function addAuthority(spec: string, name: string) {
	await cryptoWaitReady();

	const sr_keyring = new Keyring({ type: "sr25519" });
	const sr_account = sr_keyring.createFromUri(`//${nameCase(name)}`);
	const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);

	const ed_keyring = new Keyring({ type: "ed25519" });
	const ed_account = ed_keyring.createFromUri(`//${nameCase(name)}`);

	const ec_keyring = new Keyring({ type: 'ecdsa' });
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
	console.log(`Added Genesis Authority ${name}`);
}

// Update the `parachainsConfiguration` in the genesis.
// It will try to match keys which exist within the configuration and update the value.
export async function changeGenesisParachainsConfiguration(spec: string, updates: any) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);

	if (
		chainSpec.genesis.runtime.runtime_genesis_config &&
		chainSpec.genesis.runtime.runtime_genesis_config.parachainsConfiguration
	) {
		let config = chainSpec.genesis.runtime.runtime_genesis_config.parachainsConfiguration.config;
		Object.keys(updates).forEach(key => {
			if (config.hasOwnProperty(key)) {
				config[key] = updates[key];
				console.log(`Updated Parachains Configuration [ ${key}: ${config[key]} ]`);
			} else {
				console.error(`!! Bad Parachains Configuration [ ${key}: ${updates[key]} ]`);
			}
		});
	}

	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Saved Genesis Parachains Configuration`);
}
