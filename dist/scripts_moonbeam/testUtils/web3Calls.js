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
exports.sendTxSync = exports.sendTxWrapped = void 0;
function sendTxWrapped(web3, txConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            web3.eth
                .sendTransaction(txConfig)
                .once("sending", function (payload) {
                console.log("==== Sending Tx ===");
            })
                // .once('sent', function(payload){ console.log('sent')  })
                // .once('transactionHash', function(hash){ console.log('transactionHash')  })
                //.once('receipt', function(receipt){ console.log('receipt')  })
                .on("confirmation", function (confNumber, receipt, latestBlockHash) {
                if (confNumber < 8) {
                    console.log("confirmation :", receipt.transactionHash, confNumber);
                }
            })
                .on("error", function (error) {
                console.log("error on sendTxWrapped", "+" + error + "+");
                const ERROR_NOT_MINED_50_BLOCKS = "Error: Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!";
                if (error.toString() === ERROR_NOT_MINED_50_BLOCKS) {
                    console.log(ERROR_NOT_MINED_50_BLOCKS);
                    console.log('(error ignored)');
                }
                reject(`Failed to send tx: ${error.message || error.toString()}`);
            })
                .then(function (receipt) {
                console.log("==== TX Receipt ===");
                resolve(receipt);
            });
        });
    });
}
exports.sendTxWrapped = sendTxWrapped;
function sendTxSync(web3, txConfig) {
    //return new Promise<TransactionReceipt>((resolve, reject) => {
    return web3.eth
        .sendTransaction(txConfig)
        .once("sending", function (payload) {
        console.log("==== Sending Tx ===");
    })
        // .once('sent', function(payload){ console.log('sent')  })
        // .once('transactionHash', function(hash){ console.log('transactionHash')  })
        //.once('receipt', function(receipt){ console.log('receipt')  })
        .on("confirmation", function (confNumber, receipt, latestBlockHash) {
        if (confNumber < 8) {
            console.log("confirmation :", receipt.transactionHash, confNumber);
        }
    })
        .on("error", function (error) {
        console.log("error on sendTxSync", error);
        // reject(
        //           `Failed to send tx: ${
        //             error.message || error.toString()
        //           }`
        //         )
    })
        .then(function (receipt) {
        console.log("==== TX Receipt ===");
        //resolve(receipt);
    });
    //});
}
exports.sendTxSync = sendTxSync;
