#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const spawn_1 = require("./spawn");
const rpc_1 = require("./rpc");
const check_1 = require("./check");
const spec_1 = require("./spec");
const parachain_1 = require("./parachain");
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
// Special care is needed to handle paths to various files (binaries, spec, config, etc...)
// The user passes the path to `config.json`, and we use that as the starting point for any other
// relative path. So the `config.json` file is what we will be our starting point.
const { argv } = require("yargs");
// function sleep(ms: number) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms);
//   });
// }
function start(_config_file) {
    return __awaiter(this, void 0, void 0, function* () {
        const config_file = _config_file
            ? _config_file
            : argv._[0]
                ? argv._[0]
                : null;
        if (!config_file) {
            console.error("Missing config file argument...");
            process.exit();
        }
        let config_path = path_1.resolve(process.cwd(), config_file);
        let config_dir = path_1.dirname(config_path);
        if (!fs_1.default.existsSync(config_path)) {
            console.error("Config file does not exist: ", config_path);
            process.exit();
        }
        let config = require(config_path);
        // keep track of registered parachains
        let registeredParachains = {};
        // Verify that the `config.json` has all the expected properties.
        if (!check_1.checkConfig(config)) {
            return;
        }
        const relay_chain_bin = path_1.resolve(config_dir, config.relaychain.bin);
        if (!fs_1.default.existsSync(relay_chain_bin)) {
            console.error("Relay chain binary does not exist: ", relay_chain_bin);
            process.exit();
        }
        const chain = config.relaychain.chain;
        yield spawn_1.generateChainSpec(relay_chain_bin, chain);
        spec_1.clearAuthorities(`specFiles/${chain}.json`);
        for (const node of config.relaychain.nodes) {
            yield spec_1.addAuthority(`specFiles/${chain}.json`, node.name);
        }
        yield spawn_1.generateChainSpecRaw(relay_chain_bin, chain);
        const spec = path_1.resolve(`specFiles/${chain}-raw.json`);
        // First we launch each of the validators for the relay chain.
        for (const node of config.relaychain.nodes) {
            const { name, wsPort, port, flags } = node;
            console.log(`Starting ${name}...`);
            // We spawn a `child_process` starting a node, and then wait until we
            // able to connect to it using PolkadotJS in order to know its running.
            spawn_1.startNode(relay_chain_bin, name, wsPort, port, spec, flags);
        }
        // Connect to the first relay chain node to submit the extrinsic.
        let relayChainApi = yield rpc_1.connect(config.relaychain.nodes[0].wsPort, config.types);
        // Then launch each parachain
        yield new Promise((resolvePromise, reject) => __awaiter(this, void 0, void 0, function* () {
            let readyIndex = 0;
            function checkFinality() {
                readyIndex += 1;
                if (readyIndex === config.parachains.length) {
                    resolvePromise();
                }
            }
            for (const parachain of config.parachains) {
                const { id, wsPort, balance, port, flags, chain } = parachain;
                const bin = path_1.resolve(config_dir, parachain.bin);
                if (!fs_1.default.existsSync(bin)) {
                    console.error("Parachain binary does not exist: ", bin);
                    process.exit();
                }
                let account = parachain_1.parachainAccount(id);
                console.log(`Starting a Collator for parachain ${id}: ${account}, Collator port : ${port} wsPort : ${wsPort}`);
                yield spawn_1.startCollator(bin, id, wsPort, port, chain, spec, flags);
                // If it isn't registered yet, register the parachain on the relaychain
                if (!registeredParachains[id]) {
                    console.log(`Registering Parachain ${id}`);
                    // Get the information required to register the parachain on the relay chain.
                    let genesisState;
                    let genesisWasm;
                    try {
                        genesisState = yield spawn_1.exportGenesisState(bin, id, chain);
                        genesisWasm = yield spawn_1.exportGenesisWasm(bin, chain);
                    }
                    catch (err) {
                        console.error(err);
                        process.exit(1);
                    }
                    yield rpc_1.registerParachain(relayChainApi, id, genesisWasm, genesisState);
                    registeredParachains[id] = true;
                    // Allow time for the TX to complete, avoiding nonce issues.
                    // TODO: Handle nonce directly instead of this.
                    if (balance) {
                        yield rpc_1.setBalance(relayChainApi, account, balance);
                    }
                }
                checkFinality();
            }
        }));
        console.log("ALL PARACHAINS REGISTERED");
        // Then launch each simple parachain (e.g. an adder-collator)
        for (const simpleParachain of config.simpleParachains) {
            const { id, port, balance } = simpleParachain;
            const bin = path_1.resolve(config_dir, simpleParachain.bin);
            if (!fs_1.default.existsSync(bin)) {
                console.error("Simple parachain binary does not exist: ", bin);
                process.exit();
            }
            let account = parachain_1.parachainAccount(id);
            console.log(`Starting Parachain ${id}: ${account}`);
            spawn_1.startSimpleCollator(bin, id, spec, port);
            // Get the information required to register the parachain on the relay chain.
            let genesisState;
            let genesisWasm;
            try {
                // adder-collator does not support `--parachain-id` for export-genesis-state (and it is
                // not necessary for it anyway), so we don't pass it here.
                genesisState = yield spawn_1.exportGenesisState(bin);
                genesisWasm = yield spawn_1.exportGenesisWasm(bin);
            }
            catch (err) {
                console.error(err);
                process.exit(1);
            }
            console.log(`Registering Parachain ${id}`);
            yield rpc_1.registerParachain(relayChainApi, id, genesisWasm, genesisState);
            // Allow time for the TX to complete, avoiding nonce issues.
            // TODO: Handle nonce directly instead of this.
            if (balance) {
                yield rpc_1.setBalance(relayChainApi, account, balance);
            }
        }
        for (const hrmpChannel of config.hrmpChannels) {
            yield ensureOnboarded(relayChainApi, hrmpChannel.sender);
            yield ensureOnboarded(relayChainApi, hrmpChannel.recipient);
            const { sender, recipient, maxCapacity, maxMessageSize } = hrmpChannel;
            yield rpc_1.establishHrmpChannel(relayChainApi, sender, recipient, maxCapacity, maxMessageSize);
        }
    });
}
exports.start = start;
function ensureOnboarded(relayChainApi, paraId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            return __awaiter(this, void 0, void 0, function* () {
                // We subscribe to the heads as a simple way to tell that the chain onboarded.
                let unsub = yield relayChainApi.query.paras.heads(paraId, (response) => {
                    if (response.isSome) {
                        // Surprisingly, this ouroboros like subscription pattern seem to work.
                        unsub();
                        resolve();
                    }
                });
            });
        });
    });
}
// log unhandledRejection
process.on("unhandledRejection", (error) => {
    if (error.message) {
        console.trace(error);
    }
    else {
        console.log("unhandledRejection: error thrown without a message");
    }
});
// Kill all processes when exiting.
process.on("exit", function () {
    console.log("exit index spawn");
    spawn_1.killAll();
});
// Handle ctrl+c to trigger `exit`.
process.on("SIGINT", function () {
    console.log("SIGINT spawn");
    process.exit(2);
});
// start();
