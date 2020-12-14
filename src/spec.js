import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
const fs = require('fs');

function nameCase(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Remove all existing keys from `session.keys`
export function clearAuthorities(spec) {
	let rawdata = fs.readFileSync(spec);
	let chainSpec;
	try {
		chainSpec = JSON.parse(rawdata);
	} catch {
		console.error("failed to parse the chain spec");
		process.exit(1);
	}
	chainSpec.genesis.runtime.palletSession.keys = [];
	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Starting with a fresh authority set:`);
}

// Add additional authorities to chain spec in `session.keys`
export async function addAuthority(spec, name) {
	await cryptoWaitReady();

	const sr_keyring = new Keyring({ type: 'sr25519' });
	const sr_account = sr_keyring.createFromUri(`//${nameCase(name)}`);
	const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);

	const ed_keyring = new Keyring({ type: 'ed25519' });
	const ed_account = ed_keyring.createFromUri(`//${nameCase(name)}`);

	let key = [
		sr_stash.address,
		sr_stash.address,
		{
			"grandpa": ed_account.address,
			"babe": sr_account.address,
			"im_online": sr_account.address,
			"parachain_validator": sr_account.address,
			"authority_discovery": sr_account.address,
			"para_validator": sr_account.address,
			"para_assignment": sr_account.address,
		}
	];

	let rawdata = fs.readFileSync(spec);
	let chainSpec = JSON.parse(rawdata);
	chainSpec.genesis.runtime.palletSession.keys.push(key);
	let data = JSON.stringify(chainSpec, null, 2);
	fs.writeFileSync(spec, data);
	console.log(`Added Authority ${name}`);
}
