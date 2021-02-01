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
//simple test sequence that checks balances and sends one and then 10 transactions
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // instantiate apis
        const web3_1 = new web3_3.default(`ws://localhost:${WS_PORT}`);
        const web3_2 = new web3_3.default(`ws://localhost:${WS_PORT_2}`);
        // listen for block updates
        watchBlock_1.listenForBlocks(web3_2);
        //check that genesis balance is setup correctly 
        let balance_web3_1 = yield web3_1.eth.getBalance(exports.GENESIS_ACCOUNT);
        let previousBalance = balance_web3_1;
        console.log("balance web3 1", balance_web3_1);
        let balance_web3_2 = yield web3_2.eth.getBalance(exports.GENESIS_ACCOUNT);
        console.log("balance web3 2", balance_web3_2);
        util_1.assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
        util_1.assert((balance_web3_1).toString() === GENESIS_ACCOUNT_BALANCE, 'wrong balance');
        // add genesis account to wallet
        yield web3_1.eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
        console.log("wallet added");
        // send one simple transfer
        const value = "0x20000";
        const resp = yield web3Calls_1.sendTxWrapped(web3_1, {
            from: exports.GENESIS_ACCOUNT,
            to: TEST_ACCOUNT,
            value,
            gasPrice: "0x01",
            gas: "0x100000"
        });
        //check balances
        balance_web3_1 = yield web3_1.eth.getBalance(exports.GENESIS_ACCOUNT);
        console.log("balance web3 1", balance_web3_1);
        balance_web3_2 = yield web3_2.eth.getBalance(exports.GENESIS_ACCOUNT);
        console.log("balance web3 2", balance_web3_2);
        util_1.assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
        const transferCost = resp.gasUsed + util_1.hexToNumber(value);
        console.log("gas that should have be used", resp.gasUsed, util_1.hexToNumber(value), transferCost);
        console.log(Number(balance_web3_1) - Number(previousBalance));
        previousBalance = balance_web3_1;
        //   assert(
        //     balance_web3_1 === previousBalance - transferCost,
        //     transferCost + " should have been substracted"
        //   );
        // Send a series of 10 transactions
        function serialSend(_value, nbIterations) {
            return __awaiter(this, void 0, void 0, function* () {
                let res;
                for (let i = 0; i < nbIterations; i++) {
                    console.log("---------- Starting Tx send #", i);
                    res = yield web3Calls_1.sendTxWrapped(web3_1, {
                        from: exports.GENESIS_ACCOUNT,
                        to: TEST_ACCOUNT,
                        value: _value,
                        gasPrice: "0x01",
                        gas: "0x100000",
                    });
                    console.log("---------- Tx " + i + " included in Block : ", res.blockNumber);
                }
                return (res.gasUsed + util_1.hexToNumber(value)) * nbIterations;
            });
        }
        const cost = yield serialSend(value, 10);
        //check balance again
        balance_web3_1 = yield web3_1.eth.getBalance(exports.GENESIS_ACCOUNT);
        console.log("balance web3 1", balance_web3_1);
        balance_web3_2 = yield web3_2.eth.getBalance(exports.GENESIS_ACCOUNT);
        console.log("balance web3 2", balance_web3_2);
        util_1.assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
        console.log("balance change", Number(balance_web3_1) - Number(previousBalance));
        console.log("should have cost ", cost);
    });
}
main();
