import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { wasmHex } from './wasm';

export async function connect(port) {
	const provider = new WsProvider('ws://127.0.0.1:' + port);
	const api = await ApiPromise.create({ provider });
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

	let wasmBytes = wasmHex(wasm);

	// Make a transfer from Alice to BOB, waiting for inclusion
	const unsub = await api.tx.sudo
		.sudo(
			api.tx.registrar.registerPara(id, "Always", wasmBytes, header)
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
