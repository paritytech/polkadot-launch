import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

let nonce = 0;

const filterConsole = require("filter-console");

// Hide some warning messages that are coming from Polkadot JS API.
// TODO: Make configurable.
filterConsole([
	`code: '1006' reason: 'connection failed'`,
	`Unhandled promise rejections`,
	`UnhandledPromiseRejectionWarning:`,
	`Unknown types found`,
]);

// Connect to a local Substrate node. This function wont resolve until connected.
// TODO: Add a timeout where we know something went wrong so we don't wait forever.
export async function connect(port: number, types: any) {
	const provider = new WsProvider("ws://127.0.0.1:" + port);
	const api = await ApiPromise.create({
		provider,
		types,
		throwOnConnect: false,
	});
	return api;
}

// Get the genesis header of a node. Used for registering a parachain on the relay chain.
export async function getHeader(api: ApiPromise) {
	let genesis_hash = await api.rpc.chain.getBlockHash(0);
	let genesis_header = await api.rpc.chain.getHeader(genesis_hash);
	return genesis_header.toHex();
}

// Submit an extrinsic to the relay chain to register a parachain.
// Uses the Alice account which is known to be Sudo for the relay chain.
export async function registerParachain(
	api: ApiPromise,
	id: string,
	wasm: string,
	header: string,
	finalization: boolean = false
) {
	return new Promise<void>(async (resolvePromise, reject) => {
		await cryptoWaitReady();

		const keyring = new Keyring({ type: "sr25519" });
		const alice = keyring.addFromUri("//Alice");

		let paraGenesisArgs = {
			genesis_head: header,
			validation_code: wasm,
			parachain: true,
		};
		let genesis = api.createType("ParaGenesisArgs", paraGenesisArgs);

		console.log(
			`--- Submitting extrinsic to register parachain ${id}. (nonce: ${nonce}) ---`
		);
		const unsub = await api.tx.sudo
			.sudo(api.tx.parasSudoWrapper.sudoScheduleParaInitialize(id, genesis))
			.signAndSend(alice, { nonce: nonce, era: 0 }, (result) => {
				console.log(`Current status is ${result.status}`);
				if (result.status.isInBlock) {
					console.log(
						`Transaction included at blockHash ${result.status.asInBlock}`
					);
					if (finalization) {
						console.log("Waiting for finalization...");
					} else {
						unsub();
						resolvePromise();
					}
				} else if (result.status.isFinalized) {
					console.log(
						`Transaction finalized at blockHash ${result.status.asFinalized}`
					);
					unsub();
					resolvePromise();
				} else if (result.isError) {
					console.log(`Transaction Error`);
					reject(`Transaction Error`);
				}
			});
		nonce += 1;
	});
}

// Set the balance of an account on the relay chain.
export async function setBalance(
	api: ApiPromise,
	who: string,
	value: string,
	finalization: boolean = false
) {
	return new Promise<void>(async (resolvePromise, reject) => {
		await cryptoWaitReady();

		const keyring = new Keyring({ type: "sr25519" });
		const alice = keyring.addFromUri("//Alice");

		if (!nonce) {
			nonce = Number((await api.query.system.account(alice.address)).nonce);
		}

		console.log(
			`--- Submitting extrinsic to set balance of ${who} to ${value}. (nonce: ${nonce}) ---`
		);
		const unsub = await api.tx.sudo
			.sudo(api.tx.balances.setBalance(who, value, 0))
			.signAndSend(alice, { nonce: nonce, era: 0 }, (result) => {
				console.log(`Current status is ${result.status}`);
				if (result.status.isInBlock) {
					console.log(
						`Transaction included at blockHash ${result.status.asInBlock}`
					);
					if (finalization) {
						console.log("Waiting for finalization...");
					} else {
						unsub();
						resolvePromise();
					}
				} else if (result.status.isFinalized) {
					console.log(
						`Transaction finalized at blockHash ${result.status.asFinalized}`
					);
					unsub();
					resolvePromise();
				} else if (result.isError) {
					console.log(`Transaction Error`);
					reject(`Transaction Error`);
				}
			});
		nonce += 1;
	});
}

export async function sendHrmpMessage(
	api: ApiPromise,
	recipient: string,
	data: string,
	finalization: boolean = false
) {
	return new Promise<void>(async (resolvePromise, reject) => {
		await cryptoWaitReady();

		const keyring = new Keyring({ type: "sr25519" });
		const alice = keyring.addFromUri("//Alice");

		if (!nonce) {
			nonce = Number((await api.query.system.account(alice.address)).nonce);
		}

		let hrmpMessage = {
			recipient: recipient,
			data: data,
		};
		let message = api.createType("OutboundHrmpMessage", hrmpMessage);

		console.log(`--- Sending a message to ${recipient}. (nonce: ${nonce}) ---`);
		const unsub = await api.tx.sudo
			.sudo(api.tx.messageBroker.sudoSendHrmpMessage(message))
			.signAndSend(alice, { nonce: nonce, era: 0 }, (result) => {
				console.log(`Current status is ${result.status}`);
				if (result.status.isInBlock) {
					console.log(
						`Transaction included at blockHash ${result.status.asInBlock}`
					);
					if (finalization) {
						console.log("Waiting for finalization...");
					} else {
						unsub();
						resolvePromise();
					}
				} else if (result.status.isFinalized) {
					console.log(
						`Transaction finalized at blockHash ${result.status.asFinalized}`
					);
					unsub();
					resolvePromise();
				} else if (result.isError) {
					console.log(`Transaction Error`);
					reject(`Transaction Error`);
				}
			});
		nonce += 1;
	});
}
