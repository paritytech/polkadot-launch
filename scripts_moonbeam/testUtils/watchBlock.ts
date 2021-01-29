import Web3 from "web3";
import { Subscription } from "web3-core-subscriptions";
import { BlockHeader } from "web3-eth";


export async function listenForBlocks(web3: Web3) {
  //@ts-ignore
  web3.currentProvider.on("close", err => {
    console.error(`WebSocket connection closed. Error code ${err.code}, reason "${err.reason}"`);
    console.log(err)
    // invert your own error handling here
  });

  // setup listeners for web3_1
  const subscription1: Subscription<string> = web3.eth
    .subscribe("pendingTransactions")
    .on("data", function (transaction) {
      console.log("pending transaction", transaction);
    });
  const subscription2: Subscription<BlockHeader> = web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async function (blockHeader) {
      console.log(
        "+++++++++++++++++++++++++++++++++++++++++++++ New Block ++++++++++++++++++++++++=",
        blockHeader.number
      );
        console.log('getBlock says',(await web3.eth.getBlock('latest')).number)
    });
  console.log("listening for events");

  // Kill all processes when exiting.
  process.on("exit", async function () {
    console.log("exit subs");
    await new Promise<boolean>((resolve, reject) => {
      subscription1.unsubscribe((e, res) => {
        if (e) {
          console.log("error whiile clearing subscriptions", e);
          reject(e);
        } else {
          console.log("subscription1 cleared");
          resolve(res);
        }
      });
    });
    await new Promise<boolean>((resolve, reject) => {
      subscription2.unsubscribe((e, res) => {
        if (e) {
          console.log("error whiile clearing subscriptions", e);
          reject(e);
        } else {
          console.log("subscription2 cleared");
          resolve(res);
        }
      });
    });
  });


  // Handle ctrl+c to trigger `exit`.
  process.on("SIGINT", async function () {
    console.log("SIGINT");
    await new Promise<boolean>((resolve, reject) => {
      subscription1.unsubscribe((e, res) => {
        if (e) {
          console.log("error whiile clearing subscriptions", e);
          reject(e);
        } else {
          console.log("subscription1 cleared");
          resolve(res);
        }
      });
    });
    await new Promise<boolean>((resolve, reject) => {
      subscription2.unsubscribe((e, res) => {
        if (e) {
          console.log("error whiile clearing subscriptions", e);
          reject(e);
        } else {
          console.log("subscription2 cleared");
          resolve(res);
        }
      });
    });
    process.exit(2);
  });
}
