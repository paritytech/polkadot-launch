import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const filterConsole = require('filter-console');

// Some warning messages that are coming from Polkadot JS API.
filterConsole([
	`code: '1006' reason: 'connection failed'`,
	`Unhandled promise rejections`,
	`UnhandledPromiseRejectionWarning:`
]);

export async function connect(port) {
	const provider = new WsProvider('ws://127.0.0.1:' + port);
	const api = new ApiPromise({ provider });
	await api.isReady;
	return api;
}

export async function peerId(api) {
	let peerId = await api.rpc.system.localPeerId();
	return peerId.toString();
}

export async function follow(name, api) {
	console.log(`Following ${name}`);
	await api.rpc.chain.subscribeNewHeads(async (header) => {
		let peers = await api.rpc.system.peers();
		console.log(`${name} is at block: #${header.number} (${peers.length} Peers)`);
	});
}

export async function getHeader(api) {
	let genesis_hash = await api.rpc.chain.getBlockHash(0);
	let genesis_header = await api.rpc.chain.getHeader(genesis_hash);
	return genesis_header.toHex();
}

export async function registerParachain(api, id, wasm, header) {
	await cryptoWaitReady();

	const keyring = new Keyring({ type: 'sr25519' });
	const alice = keyring.addFromUri('//Alice');

	const nonce = await api.rpc.system.accountNextIndex(alice);

	console.log("NONCE IS ", nonce)

	let always = "0x00";
	const unsub = await api.tx.sudo
		.sudo(
			api.tx.registrar.registerPara(id, always, wasm, header)
		)
		.signAndSend(alice, (result) => {
			console.log(`Current status is ${result.status}`);
			if (result.status.isInBlock) {
				console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
			} else if (result.status.isFinalized) {
				console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
				unsub();
			}
		});
}
