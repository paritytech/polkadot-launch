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
const web3_3 = __importDefault(require("web3"));
const testChecks_1 = require("./testUtils/testChecks");
const watchBlock_1 = require("./testUtils/watchBlock");
const web3Calls_1 = require("./testUtils/web3Calls");
//const Web3 = require("web3");
const PORT_1 = 9846;
const RPC_PORT = 9846;
const WS_PORT = 9946;
const PORT_2 = 9847;
const RPC_PORT_2 = 9847;
const WS_PORT_2 = 9947;
exports.GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
const GENESIS_ACCOUNT_PRIVATE_KEY = "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";
const { argv } = require('yargs');
const NUMBER_TX = argv._[0] ? Number(argv._[0]) : 100;
if (!argv._[0]) {
    console.error("Missing tx number argument... tx number set to 100");
}
//simple test sequence that checks balances and sends one and then 10 transactions
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // instantiate apis
        const web3_1 = new web3_3.default(`ws://localhost:${WS_PORT}`);
        const web3_2 = new web3_3.default(`ws://localhost:${WS_PORT_2}`);
        // listen for block updates
        watchBlock_1.listenForBlocks(web3_2);
        // add genesis account to wallet
        yield web3_1.eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
        console.log("wallet added");
        // chose a value for the transfers
        const value = "0x20000";
        console.log("value is ", util_1.hexToNumber(value));
        const nonce = yield web3_1.eth.getTransactionCount(exports.GENESIS_ACCOUNT);
        const initialBalance = yield web3_1.eth.getBalance(TEST_ACCOUNT);
        // Send a series of 10 transactions
        function parallelSend(_value, nbIterations) {
            for (let i = 0; i < nbIterations; i++) {
                console.log("---------- Starting Tx send #", i);
                web3Calls_1.sendTxSync(web3_1, {
                    from: exports.GENESIS_ACCOUNT,
                    to: TEST_ACCOUNT,
                    value: _value,
                    gasPrice: "0x01",
                    gas: "0x100000",
                    nonce: nonce + i,
                });
            }
        }
        parallelSend(value, NUMBER_TX);
        function checkBalanceSync(web3) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("xxxxxxxx Balance check xxxxxxxxxxxx block:", (yield web3.eth.getBlock('latest')).number);
                //check balance again
                let balance_web3_1 = yield web3.eth.getBalance(exports.GENESIS_ACCOUNT);
                console.log("balance web3 1", balance_web3_1);
                let balance_web3_2 = yield web3.eth.getBalance(exports.GENESIS_ACCOUNT);
                console.log("balance web3 2", balance_web3_2);
                // assert(
                //   balance_web3_1 === balance_web3_2,
                //   "web3 balances should be the same"
                // );
                let recipientBalance = yield web3.eth.getBalance(TEST_ACCOUNT);
                console.log("recipient balance is ", recipientBalance);
                console.log("it should be         ", Number(initialBalance) + NUMBER_TX * util_1.hexToNumber(value));
                console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
                return Number(recipientBalance);
            });
        }
        let initialBlockNumber = (yield web3_2.eth.getBlock("latest")).number;
        let balance = 0;
        while (balance < Number(initialBalance) + NUMBER_TX * util_1.hexToNumber(value)) {
            yield new Promise((resolve, reject) => {
                setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    balance = yield checkBalanceSync(web3_2);
                    resolve(balance);
                }), 3000);
            });
        }
        console.log('balance', balance, 'target', Number(initialBalance) + NUMBER_TX * util_1.hexToNumber(value));
        yield new Promise((resolve, reject) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                balance = yield checkBalanceSync(web3_2);
                resolve(balance);
            }), 6000);
        });
        console.log("======================================= THE END ===================================================");
        console.log("block interval ", (yield web3_2.eth.getBlock("latest")).number, initialBlockNumber);
        console.log('Should contain ', NUMBER_TX, ' tx');
        yield testChecks_1.readEveryBlock(web3_2, 0);
        process.exit(0);
    });
}
main();
