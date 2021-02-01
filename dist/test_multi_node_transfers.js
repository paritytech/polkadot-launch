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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENESIS_ACCOUNT = void 0;
var util_1 = require("@polkadot/util");
var web3_1 = __importDefault(require("web3"));
var testUtils_1 = require("../scripts_moonbeam/testUtils");
var testChecks_1 = require("../scripts_moonbeam/testUtils/testChecks");
var watchBlock_1 = require("../scripts_moonbeam/testUtils/watchBlock");
var web3Calls_1 = require("../scripts_moonbeam/testUtils/web3Calls");
//import fs from "fs";
var spawn_1 = require("../src/spawn");
//@ts-ignore
var spec_1 = require("../src/spec");
//@ts-ignore
var parachain_1 = require("../src/parachain");
//@ts-ignore
var rpc_1 = require("../src/rpc");
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
//const fs=require('fs')
exports.GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
//const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
var GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
var TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";
var TRANSFER_VALUE = "0x2000";
var INITIAL_NODE_BALANCE = "0x200000000";
//const { argv } = require("yargs");
var NUMBER_TX = 10;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        // Function to check that all nodes hold the same balance of the test account
        function checkBalanceSync(web3) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, balance_web3_1, balance_web3_2, recipientBalance;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _b = (_a = console).log;
                            _c = ["xxxxxxxx Balance check xxxxxxxxxxxx block:"];
                            return [4 /*yield*/, web3.eth.getBlock("latest")];
                        case 1:
                            _b.apply(_a, _c.concat([(_d.sent()).number]));
                            return [4 /*yield*/, web3.eth.getBalance(exports.GENESIS_ACCOUNT)];
                        case 2:
                            balance_web3_1 = _d.sent();
                            console.log("balance web3 1", balance_web3_1);
                            return [4 /*yield*/, web3.eth.getBalance(exports.GENESIS_ACCOUNT)];
                        case 3:
                            balance_web3_2 = _d.sent();
                            console.log("balance web3 2", balance_web3_2);
                            util_1.assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
                            return [4 /*yield*/, web3.eth.getBalance(TEST_ACCOUNT)];
                        case 4:
                            recipientBalance = _d.sent();
                            console.log("recipient balance is ", recipientBalance);
                            console.log("it should be         ", Number(initialBalance) +
                                NUMBER_TX * util_1.hexToNumber(value) * config.parachains.length);
                            console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                            return [2 /*return*/, Number(recipientBalance)];
                    }
                });
            });
        }
        var clientList, accounts, value, initialNodeBalance, registeredParachains, config_file, config_path, config_dir, config, relay_chain_bin, chain, _i, _a, node, spec, _b, _c, node, name_1, wsPort, port, flags, relayChainApi, i, _d, _e, nonces, e_1, initialBalance, initialBlockNumber, balance, _f, _g, _h, nbTx;
        var _this = this;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    value = TRANSFER_VALUE;
                    initialNodeBalance = INITIAL_NODE_BALANCE;
                    console.log("transfer value is ", util_1.hexToNumber(value));
                    console.log("initial node balance is ", util_1.hexToNumber(initialNodeBalance));
                    registeredParachains = {};
                    config_file = "config_moonbeam_antoine.json";
                    if (!config_file) {
                        console.error("Missing config file argument...");
                        process.exit();
                    }
                    config_path = path_1.resolve(process.cwd(), config_file);
                    config_dir = path_1.dirname(config_path);
                    if (!fs_1.default.existsSync(config_path)) {
                        console.error("Config file does not exist: ", config_path);
                        process.exit();
                    }
                    config = require(config_path);
                    relay_chain_bin = path_1.resolve(config_dir, config.relaychain.bin);
                    if (!fs_1.default.existsSync(relay_chain_bin)) {
                        console.error("Relay chain binary does not exist: ", relay_chain_bin);
                        process.exit();
                    }
                    chain = config.relaychain.chain;
                    return [4 /*yield*/, spawn_1.generateChainSpec(relay_chain_bin, chain)];
                case 1:
                    _j.sent();
                    spec_1.clearAuthorities(chain + ".json");
                    _i = 0, _a = config.relaychain.nodes;
                    _j.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    node = _a[_i];
                    return [4 /*yield*/, spec_1.addAuthority(chain + ".json", node.name)];
                case 3:
                    _j.sent();
                    _j.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, spawn_1.generateChainSpecRaw(relay_chain_bin, chain)];
                case 6:
                    _j.sent();
                    spec = path_1.resolve(chain + "-raw.json");
                    // First we launch each of the validators for the relay chain.
                    for (_b = 0, _c = config.relaychain.nodes; _b < _c.length; _b++) {
                        node = _c[_b];
                        name_1 = node.name, wsPort = node.wsPort, port = node.port, flags = node.flags;
                        console.log("Starting " + name_1 + "...");
                        // We spawn a `child_process` starting a node, and then wait until we
                        // able to connect to it using PolkadotJS in order to know its running.
                        spawn_1.startNode(relay_chain_bin, name_1, wsPort, port, spec, flags);
                    }
                    return [4 /*yield*/, rpc_1.connect(config.relaychain.nodes[0].wsPort, config.types)];
                case 7:
                    relayChainApi = _j.sent();
                    // Then launch each parachain
                    return [4 /*yield*/, new Promise(function (resolvePromise, reject) { return __awaiter(_this, void 0, void 0, function () {
                            function checkFinality() {
                                readyIndex += 1;
                                if (readyIndex === config.parachains.length) {
                                    resolvePromise();
                                }
                            }
                            var readyIndex, _i, _a, parachain, id, wsPort, balance_1, port, flags, chain_1, bin, account, genesisState, genesisWasm, err_1, e_2;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        readyIndex = 0;
                                        _i = 0, _a = config.parachains;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_i < _a.length)) return [3 /*break*/, 14];
                                        parachain = _a[_i];
                                        id = parachain.id, wsPort = parachain.wsPort, balance_1 = parachain.balance, port = parachain.port, flags = parachain.flags, chain_1 = parachain.chain;
                                        bin = path_1.resolve(config_dir, parachain.bin);
                                        if (!fs_1.default.existsSync(bin)) {
                                            console.error("Parachain binary does not exist: ", bin);
                                            process.exit();
                                        }
                                        account = parachain_1.parachainAccount(id);
                                        console.log("Starting a Collator for parachain " + id + ": " + account + ", Collator port : " + port + " wsPort : " + wsPort);
                                        return [4 /*yield*/, spawn_1.startCollator(bin, id, wsPort, port, chain_1, spec, flags)];
                                    case 2:
                                        _b.sent();
                                        if (!!registeredParachains[id]) return [3 /*break*/, 12];
                                        console.log("Registering Parachain " + id);
                                        genesisState = void 0;
                                        genesisWasm = void 0;
                                        _b.label = 3;
                                    case 3:
                                        _b.trys.push([3, 6, , 7]);
                                        return [4 /*yield*/, spawn_1.exportGenesisState(bin, id, chain_1)];
                                    case 4:
                                        genesisState = _b.sent();
                                        return [4 /*yield*/, spawn_1.exportGenesisWasm(bin, chain_1)];
                                    case 5:
                                        genesisWasm = _b.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        err_1 = _b.sent();
                                        console.error(err_1);
                                        process.exit(1);
                                        return [3 /*break*/, 7];
                                    case 7:
                                        _b.trys.push([7, 9, , 10]);
                                        return [4 /*yield*/, rpc_1.registerParachain(relayChainApi, id, genesisWasm, genesisState)];
                                    case 8:
                                        _b.sent();
                                        return [3 /*break*/, 10];
                                    case 9:
                                        e_2 = _b.sent();
                                        console.log("error during register", e_2);
                                        return [3 /*break*/, 10];
                                    case 10:
                                        registeredParachains[id] = true;
                                        if (!balance_1) return [3 /*break*/, 12];
                                        return [4 /*yield*/, rpc_1.setBalance(relayChainApi, account, balance_1)];
                                    case 11:
                                        _b.sent();
                                        _b.label = 12;
                                    case 12:
                                        checkFinality();
                                        _b.label = 13;
                                    case 13:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 14: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 8:
                    // Then launch each parachain
                    _j.sent();
                    console.log("ALL PARACHAINS REGISTERED");
                    console.log("GREAT SUCCESS, nodes ready");
                    // instantiate apis
                    clientList = config.parachains.map(function (parachain) {
                        console.log("connecting new web3 instance to wsport:" + parachain.wsPort);
                        return new web3_1.default("ws://127.0.0.1:" + parachain.wsPort);
                    });
                    //TODO add check on each client, or not...
                    // listen for block updates
                    watchBlock_1.listenForBlocks(clientList[0]);
                    // add genesis account to wallet of client 0
                    return [4 /*yield*/, clientList[0].eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY)];
                case 9:
                    // add genesis account to wallet of client 0
                    _j.sent();
                    console.log("wallet genesis added");
                    return [4 /*yield*/, Promise.all(config.parachains.map(function (_, i) { return __awaiter(_this, void 0, void 0, function () {
                            var wallet;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(i > 0)) return [3 /*break*/, 2];
                                        return [4 /*yield*/, clientList[i].eth.accounts.wallet.create(1)];
                                    case 1:
                                        wallet = _a.sent();
                                        return [2 /*return*/, wallet[0].address];
                                    case 2: return [2 /*return*/, exports.GENESIS_ACCOUNT];
                                }
                            });
                        }); }))];
                case 10:
                    // add these accounts to the other nodes
                    accounts = _j.sent();
                    i = 1;
                    _j.label = 11;
                case 11:
                    if (!(i < config.parachains.length)) return [3 /*break*/, 15];
                    return [4 /*yield*/, web3Calls_1.sendTxWrapped(clientList[0], {
                            from: exports.GENESIS_ACCOUNT,
                            to: accounts[i],
                            value: initialNodeBalance,
                            gasPrice: "0x01",
                            gas: "0x100000",
                        })];
                case 12:
                    _j.sent();
                    _d = util_1.assert;
                    _e = Number;
                    return [4 /*yield*/, clientList[0].eth.getBalance(accounts[i])];
                case 13:
                    _d.apply(void 0, [_e.apply(void 0, [_j.sent()]) ===
                            util_1.hexToNumber(initialNodeBalance), "balance for node not correctly set"]);
                    _j.label = 14;
                case 14:
                    i++;
                    return [3 /*break*/, 11];
                case 15:
                    console.log("money ditributed to other nodes");
                    _j.label = 16;
                case 16:
                    _j.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, Promise.all(config.parachains.map(function (_, i) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, clientList[i].eth.getTransactionCount(accounts[i])];
                            });
                        }); }))];
                case 17:
                    nonces = _j.sent();
                    return [3 /*break*/, 19];
                case 18:
                    e_1 = _j.sent();
                    console.log("nonce error", e_1);
                    return [3 /*break*/, 19];
                case 19: return [4 /*yield*/, clientList[0].eth.getBalance(TEST_ACCOUNT)];
                case 20:
                    initialBalance = _j.sent();
                    return [4 /*yield*/, clientList[0].eth.getBlock("latest")];
                case 21:
                    initialBlockNumber = (_j.sent()).number;
                    //have all nodes send their transfers in parallel
                    config.parachains.forEach(function (_, i) {
                        testUtils_1.parallelSend(clientList[i], nonces[i], value, NUMBER_TX, accounts[i], TEST_ACCOUNT);
                    });
                    console.log(4);
                    balance = 0;
                    _j.label = 22;
                case 22:
                    if (!(balance <
                        Number(initialBalance) +
                            NUMBER_TX * util_1.hexToNumber(value) * config.parachains.length)) return [3 /*break*/, 24];
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, checkBalanceSync(clientList[0])];
                                        case 1:
                                            balance = _a.sent();
                                            resolve(balance);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 6000);
                        })];
                case 23:
                    _j.sent();
                    return [3 /*break*/, 22];
                case 24:
                    // log end of test information
                    console.log("======================================= THE END ===================================================");
                    _g = (_f = console).log;
                    _h = ["block interval "];
                    return [4 /*yield*/, clientList[0].eth.getBlock("latest")];
                case 25:
                    _g.apply(_f, _h.concat([(_j.sent()).number, initialBlockNumber]));
                    console.log("Should contain ", config.parachains.length - 1 + NUMBER_TX * config.parachains.length, " tx");
                    return [4 /*yield*/, testChecks_1.readEveryBlock(clientList[0], initialBlockNumber)];
                case 26:
                    nbTx = _j.sent();
                    util_1.assert(nbTx ===
                        config.parachains.length - 1 + NUMBER_TX * config.parachains.length, "Not all tx were included in a block");
                    //process.exit(0);
                    //process.kill(process.pid, 'SIGINT');
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = main;
main();
// log unhandledRejection
process.on("unhandledRejection", function (error) {
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
