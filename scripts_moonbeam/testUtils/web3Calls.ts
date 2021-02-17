import { TransactionReceipt, TransactionConfig } from "web3-core";
import Web3 from "web3";
export async function sendTxWrapped(
  web3: Web3,
  txConfig: TransactionConfig
): Promise<TransactionReceipt> {
  return new Promise<TransactionReceipt>((resolve, reject) => {
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
        console.log("error on sendTxWrapped","+"+error+"+");
        const ERROR_NOT_MINED_50_BLOCKS:string="Error: Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!"
        if (error.toString()===ERROR_NOT_MINED_50_BLOCKS){
          console.log(ERROR_NOT_MINED_50_BLOCKS)
          console.log('(error ignored)')
        }
        reject(`Failed to send tx: ${error.message || error.toString()}`);
      })
      .then(function (receipt) {
        console.log("==== TX Receipt ===");
        resolve(receipt);
      });
  });
}
export function sendTxSync(web3: Web3, txConfig: TransactionConfig) {
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
      console.log("error on sendTxSync",error);
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
