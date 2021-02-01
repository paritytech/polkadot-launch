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
exports.killAll = exports.startNodes = exports.parallelSend = void 0;
const web3Calls_1 = require("./web3Calls");
//const { spawn, exec } = require("child_process");
const child_process_1 = require("child_process");
const fs = require('fs');
// Send a series of transactions in parallel, meaning they don't wait
// for one to be finished before sending the next one
function parallelSend(web3, startingNonce, _value, nbIterations, fromAccount, toAccount) {
    for (let i = 0; i < nbIterations; i++) {
        console.log("---------- Starting Tx send #", i);
        web3Calls_1.sendTxSync(web3, {
            from: fromAccount,
            to: toAccount,
            value: _value,
            gasPrice: "0x01",
            gas: "0x100000",
            nonce: startingNonce + i,
        });
    }
}
exports.parallelSend = parallelSend;
let p = {};
function startNodes() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("START NODES");
        return new Promise((resolve, reject) => {
            try {
                p["start_nodes"] = child_process_1.spawn("./start_nodes.sh", []);
                let log = fs.createWriteStream(`start_nodes.log`);
                p["start_nodes"].stdout.on("data", function (chunk) {
                    let message = chunk.toString();
                    console.log("START NODES LOGS : ", message.substring(0, message.length - 1));
                    if (message.substring(0, message.length - 1) == "ALL PARACHAINS REGISTERED") {
                        resolve();
                    }
                    log.write(message);
                });
                p["start_nodes"].stderr.on("data", function (chunk) {
                    let message = chunk.toString();
                    console.log("ERROR IN START NODES", message.substring(0, message.length - 1));
                    log.write(message);
                    //throw new Error(message);
                });
            }
            catch (e) {
                console.log("ERROR IN startNodes", reject(e));
            }
        });
    });
}
exports.startNodes = startNodes;
// Kill all processes spawned and tracked by this file.
function killAll() {
    console.log("\nKilling all processes... (tests)");
    for (const key of Object.keys(p)) {
        p[key].kill('SIGINT');
    }
}
exports.killAll = killAll;
// Kill all processes when exiting.
process.on("exit", function () {
    console.log("exit index test");
    killAll();
});
// Handle ctrl+c to trigger `exit`.
process.on("SIGINT", function () {
    console.log("SIGINT test");
    process.exit(2);
});
