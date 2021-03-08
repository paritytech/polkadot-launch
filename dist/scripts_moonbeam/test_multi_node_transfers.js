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
exports.start = exports.GENESIS_ACCOUNT = void 0;
const util_1 = require("@polkadot/util");
const web3_1 = __importDefault(require("web3"));
const testUtils_1 = require("../scripts_moonbeam/testUtils");
const testChecks_1 = require("../scripts_moonbeam/testUtils/testChecks");
const watchBlock_1 = require("../scripts_moonbeam/testUtils/watchBlock");
const web3Calls_1 = require("../scripts_moonbeam/testUtils/web3Calls");
//import fs from "fs";
const spawn_1 = require("../src/spawn");
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const src_1 = require("../src");
exports.GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
//const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";
const TRANSFER_VALUE = "0x2000";
const INITIAL_NODE_BALANCE = "0x200000000";
//const { argv } = require("yargs");
const NUMBER_TX = 10;
var src_2 = require("../src");
Object.defineProperty(exports, "start", { enumerable: true, get: function () { return src_2.start; } });
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const config_file = "config_moonbeam.json";
        if (!config_file) {
            console.error("Missing config file argument... 1");
            process.exit();
        }
        let config_path = path_1.resolve(process.cwd(), config_file);
        // let config_dir = dirname(config_path);
        if (!fs_1.default.existsSync(config_path)) {
            console.error("Config file does not exist: ", config_path);
            process.exit();
        }
        let config = require(config_path);
        let clientList;
        let accounts;
        // set a value for the transfers
        const value = TRANSFER_VALUE;
        const initialNodeBalance = INITIAL_NODE_BALANCE;
        yield src_1.start(config_file);
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
main();
// log unhandledRejection
process.on("unhandledRejection", (error) => {
    if (error.message) {
        console.trace(error);
    }
    else {
        console.log("unhandledRejection: error thrown without a message");
        console.trace(error);
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
