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
exports.GENESIS_ACCOUNT = void 0;
const util_1 = require("@polkadot/util");
const web3_1 = __importDefault(require("web3"));
const testUtils_1 = require("../scripts_moonbeam/testUtils");
const testChecks_1 = require("../scripts_moonbeam/testUtils/testChecks");
const watchBlock_1 = require("../scripts_moonbeam/testUtils/watchBlock");
const web3Calls_1 = require("../scripts_moonbeam/testUtils/web3Calls");
//import fs from "fs";
const spawn_1 = require("../src/spawn");
//@ts-ignore
const spec_1 = require("../src/spec");
//@ts-ignore
const parachain_1 = require("../src/parachain");
//@ts-ignore
const rpc_1 = require("../src/rpc");
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
//const fs=require('fs')
exports.GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
//const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";
const TRANSFER_VALUE = "0x2000";
const INITIAL_NODE_BALANCE = "0x200000000";
//const { argv } = require("yargs");
const NUMBER_TX = 10;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let clientList;
        let accounts;
        // set a value for the transfers
        const value = TRANSFER_VALUE;
        const initialNodeBalance = INITIAL_NODE_BALANCE;
        console.log("transfer value is ", util_1.hexToNumber(value));
        console.log("initial node balance is ", util_1.hexToNumber(initialNodeBalance));
        // keep track of registered parachains
        let registeredParachains = {};
        // Verify that the `config.json` has all the expected properties.
        // if (!checkConfig(config)) {
        // 	return;
        // }
        const config_file = "config_moonbeam.json"; //argv._[0] ? argv._[0] : null;
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
                console.log('chain', chain);
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
                    try {
                        yield rpc_1.registerParachain(relayChainApi, id, genesisWasm, genesisState);
                        //checkFinality('isRegistered')
                    }
                    catch (e) {
                        console.log("error during register", e);
                    }
                    registeredParachains[id] = true;
                    // Allow time for the TX to complete, avoiding nonce issues.
                    // TODO: Handle nonce directly instead of this.
                    if (balance) {
                        yield rpc_1.setBalance(relayChainApi, account, balance);
                        //checkFinality('isBalanceSet')
                    }
                }
                checkFinality();
            }
        }));
        console.log("ALL PARACHAINS REGISTERED");
        console.log("GREAT SUCCESS, nodes ready");
        // instantiate apis
        clientList = config.parachains.map((parachain) => {
            console.log("connecting new web3 instance to wsport:" + parachain.wsPort);
            return new web3_1.default(`ws://127.0.0.1:${parachain.wsPort}`);
        });
        //TODO add check on each client, or not...
        // listen for block updates
        watchBlock_1.listenForBlocks(clientList[0]);
        // add genesis account to wallet of client 0
        yield clientList[0].eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
        console.log("wallet genesis added");
        // add these accounts to the other nodes
        accounts = yield Promise.all(config.parachains.map((_, i) => __awaiter(this, void 0, void 0, function* () {
            if (i > 0) {
                const wallet = yield clientList[i].eth.accounts.wallet.create(1);
                return wallet[0].address;
            }
            else {
                return exports.GENESIS_ACCOUNT;
            }
        })));
        //send money from genesis to other accounts
        for (let i = 1; i < config.parachains.length; i++) {
            yield web3Calls_1.sendTxWrapped(clientList[0], {
                from: exports.GENESIS_ACCOUNT,
                to: accounts[i],
                value: initialNodeBalance,
                gasPrice: "0x01",
                gas: "0x100000",
            });
            util_1.assert(Number(yield clientList[0].eth.getBalance(accounts[i])) ===
                util_1.hexToNumber(initialNodeBalance), "balance for node not correctly set");
        }
        console.log("money ditributed to other nodes");
        //assert(false).to.be.true
        // get the nonces of each node
        let nonces;
        try {
            nonces = yield Promise.all(config.parachains.map((_, i) => __awaiter(this, void 0, void 0, function* () {
                return clientList[i].eth.getTransactionCount(accounts[i]);
            })));
        }
        catch (e) {
            console.log("nonce error", e);
        }
        //check initial balance and block for comparaison
        const initialBalance = yield clientList[0].eth.getBalance(TEST_ACCOUNT);
        let initialBlockNumber = (yield clientList[0].eth.getBlock("latest")).number;
        //have all nodes send their transfers in parallel
        config.parachains.forEach((_, i) => {
            testUtils_1.parallelSend(clientList[i], nonces[i], value, NUMBER_TX, accounts[i], TEST_ACCOUNT);
        });
        // Function to check that all nodes hold the same balance of the test account
        function checkBalanceSync(web3) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("xxxxxxxx Balance check xxxxxxxxxxxx block:", (yield web3.eth.getBlock("latest")).number);
                //check balance again
                let balance_web3_1 = yield web3.eth.getBalance(exports.GENESIS_ACCOUNT);
                console.log("balance web3 1", balance_web3_1);
                let balance_web3_2 = yield web3.eth.getBalance(exports.GENESIS_ACCOUNT);
                console.log("balance web3 2", balance_web3_2);
                util_1.assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
                let recipientBalance = yield web3.eth.getBalance(TEST_ACCOUNT);
                console.log("recipient balance is ", recipientBalance);
                console.log("it should be         ", Number(initialBalance) +
                    NUMBER_TX * util_1.hexToNumber(value) * config.parachains.length);
                console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                return Number(recipientBalance);
            });
        }
        // Check balances until test account has reached target balance
        let balance = 0;
        while (balance <
            Number(initialBalance) +
                NUMBER_TX * util_1.hexToNumber(value) * config.parachains.length) {
            yield new Promise((resolve, reject) => {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    balance = yield checkBalanceSync(clientList[0]);
                    resolve(balance);
                }), 6000);
            });
        }
        // log end of test information
        console.log("======================================= THE END ===================================================");
        console.log("block interval ", (yield clientList[0].eth.getBlock("latest")).number, initialBlockNumber);
        console.log("Should contain ", config.parachains.length - 1 + NUMBER_TX * config.parachains.length, " tx");
        // log the tx for each block
        let nbTx = yield testChecks_1.readEveryBlock(clientList[0], initialBlockNumber);
        util_1.assert(nbTx ===
            config.parachains.length - 1 + NUMBER_TX * config.parachains.length, "Not all tx were included in a block");
        //process.exit(0);
        //process.kill(process.pid, 'SIGINT');
        process.exit(0);
    });
}
exports.default = main;
//main();
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
