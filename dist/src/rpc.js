"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBalance = exports.registerParachain = exports.getHeader = exports.follow = exports.peerId = exports.connect = void 0;
const api_1 = require("@polkadot/api");
const api_2 = require("@polkadot/api");
const util_crypto_1 = require("@polkadot/util-crypto");
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
function connect(port, types) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new api_1.WsProvider("ws://127.0.0.1:" + port);
        const api = new api_1.ApiPromise({ provider, types });
        try {
            yield api.isReady;
        }
        catch (e) {
            console.log("error during api is ready", e);
        }
        return api;
    });
}
exports.connect = connect;
// Get the PeerId for a running node. Can be used when defining bootnodes for future nodes.
function peerId(api) {
    return __awaiter(this, void 0, void 0, function* () {
        let peerId = yield api.rpc.system.localPeerId();
        return peerId.toString();
    });
}
exports.peerId = peerId;
// Track and display basic information about a chain each block it produces.
function follow(name, api) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Following ${name}`);
        yield api.rpc.chain.subscribeNewHeads((header) => __awaiter(this, void 0, void 0, function* () {
            let peers = yield api.rpc.system.peers();
            console.log(`${name} is at block: #${header.number} (${peers.length} Peers)`);
        }));
    });
}
exports.follow = follow;
// Get the genesis header of a node. Used for registering a parachain on the relay chain.
function getHeader(api) {
    return __awaiter(this, void 0, void 0, function* () {
        let genesis_hash = yield api.rpc.chain.getBlockHash(0);
        let genesis_header = yield api.rpc.chain.getHeader(genesis_hash);
        return genesis_header.toHex();
    });
}
exports.getHeader = getHeader;
// Submit an extrinsic to the relay chain to register a parachain.
// Uses the Alice account which is known to be Sudo for the relay chain.
function registerParachain(api, id, wasm, header) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolvePromise, reject) => __awaiter(this, void 0, void 0, function* () {
            yield util_crypto_1.cryptoWaitReady();
            const keyring = new api_2.Keyring({ type: "sr25519" });
            const alice = keyring.addFromUri("//Alice");
            let paraGenesisArgs = {
                genesis_head: header,
                validation_code: wasm,
                parachain: true,
            };
            let genesis = api.createType("ParaGenesisArgs", paraGenesisArgs);
            console.log(`--- Submitting extrinsic to register parachain ${id}. (nonce: ${nonce}) ---`);
            const unsub = yield api.tx.sudo
                .sudo(api.tx.parasSudoWrapper.sudoScheduleParaInitialize(id, genesis))
                .signAndSend(alice, { nonce: nonce, era: 0 }, (result) => {
                console.log(`Current registration status is ${result.status}`);
                if (result.status.isInBlock) {
                    console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
                }
                else if (result.status.isFinalized) {
                    console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
                    unsub();
                    console.log("one REGISTRATION DONE");
                    resolvePromise();
                }
            });
            nonce += 1;
        }));
    });
}
exports.registerParachain = registerParachain;
// Set the balance of an account on the relay chain.
function setBalance(api, who, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolvePromise, reject) => __awaiter(this, void 0, void 0, function* () {
            console.log("SETBALANCE");
            yield util_crypto_1.cryptoWaitReady();
            const keyring = new api_2.Keyring({ type: "sr25519" });
            const alice = keyring.addFromUri("//Alice");
            if (!nonce) {
                console.log("ha, no nonce");
                nonce = (yield api.query.system.account(alice.address)).nonce;
            }
            //nonce =Number((await api.query.system.account(alice.address)).nonce)+1;
            console.log("NONCE", Number((yield api.query.system.account(alice.address)).nonce));
            console.log(`--- Submitting extrinsic to set balance of ${who} to ${value}. (nonce: ${nonce}) ---`);
            //await new Promise(async(resolve,reject)=>{
            const unsub = yield api.tx.sudo
                .sudo(api.tx.balances.setBalance(who, value, 0))
                .signAndSend(alice, { nonce: nonce, era: 0 }, (result) => {
                console.log(`Current setBalance status is ${result.status}`);
                if (result.status.isInBlock) {
                    console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
                }
                else if (result.status.isFinalized) {
                    console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
                    unsub();
                    resolvePromise();
                    //resolve()
                }
            });
            //})
            nonce += 1;
            // console.log('nonce after inc',nonce)
            console.log("setbalance finished");
        }));
    });
}
exports.setBalance = setBalance;
