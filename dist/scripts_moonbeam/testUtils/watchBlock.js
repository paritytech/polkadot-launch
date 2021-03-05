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
exports.listenForBlocks = void 0;
function listenForBlocks(web3) {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        web3.currentProvider.on("close", err => {
            console.error(`WebSocket connection closed. Error code ${err.code}, reason "${err.reason}"`);
            console.log(err);
            // invert your own error handling here
        });
        // setup listeners for web3_1
        const subscription1 = web3.eth
            .subscribe("pendingTransactions")
            .on("data", function (transaction) {
            console.log("pending transaction", transaction);
        });
        const subscription2 = web3.eth
            .subscribe("newBlockHeaders")
            .on("data", function (blockHeader) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("+++++++++++++++++++++++++++++++++++++++++++++ New Block ++++++++++++++++++++++++=", blockHeader.number);
                console.log('getBlock says', (yield web3.eth.getBlock('latest')).number);
            });
        });
        console.log("listening for events");
        // Kill all processes when exiting.
        process.on("exit", function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("exit subs");
                yield new Promise((resolve, reject) => {
                    subscription1.unsubscribe((e, res) => {
                        if (e) {
                            console.log("error whiile clearing subscriptions", e);
                            reject(e);
                        }
                        else {
                            console.log("subscription1 cleared");
                            resolve(res);
                        }
                    });
                });
                yield new Promise((resolve, reject) => {
                    subscription2.unsubscribe((e, res) => {
                        if (e) {
                            console.log("error whiile clearing subscriptions", e);
                            reject(e);
                        }
                        else {
                            console.log("subscription2 cleared");
                            resolve(res);
                        }
                    });
                });
            });
        });
        // Handle ctrl+c to trigger `exit`.
        process.on("SIGINT", function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("SIGINT");
                yield new Promise((resolve, reject) => {
                    subscription1.unsubscribe((e, res) => {
                        if (e) {
                            console.log("error whiile clearing subscriptions", e);
                            reject(e);
                        }
                        else {
                            console.log("subscription1 cleared");
                            resolve(res);
                        }
                    });
                });
                yield new Promise((resolve, reject) => {
                    subscription2.unsubscribe((e, res) => {
                        if (e) {
                            console.log("error whiile clearing subscriptions", e);
                            reject(e);
                        }
                        else {
                            console.log("subscription2 cleared");
                            resolve(res);
                        }
                    });
                });
                process.exit(2);
            });
        });
    });
}
exports.listenForBlocks = listenForBlocks;
