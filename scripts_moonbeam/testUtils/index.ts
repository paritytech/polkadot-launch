import Web3 from "web3";
import { sendTxSync } from "./web3Calls";
//const { spawn, exec } = require("child_process");
import { spawn, exec, ChildProcessWithoutNullStreams } from "child_process";
const fs = require('fs');

// Send a series of transactions in parallel, meaning they don't wait
// for one to be finished before sending the next one
export function parallelSend(
  web3: Web3,
  startingNonce: number,
  _value: string,
  nbIterations: number,
  fromAccount: string,
  toAccount: string
) {
  for (let i = 0; i < nbIterations; i++) {
    console.log("---------- Starting Tx send #", i);
    sendTxSync(web3, {
      from: fromAccount,
      to: toAccount,
      value: _value, // Must me higher than ExistentialDeposit (500) //TODO add check
      gasPrice: "0x01",
      gas: "0x100000",
      nonce: startingNonce + i,
    });
  }
}

let p:{[key:string]:ChildProcessWithoutNullStreams} = {};

export async function startNodes() {
  console.log("START NODES");

  return new Promise<void>((resolve, reject) => {
    p["tests"] = spawn("./start_nodes.sh", []);

    let log = fs.createWriteStream(`tests.log`)
    try {
      p["tests"].stdout.on("data", function (chunk) {
        let message = chunk.toString();
        console.log( "START NODES LOGS : ",message.substring(0, message.length - 1));
        if (message.substring(0, message.length - 1) == "ALL PARACHAINS REGISTERED") {
          resolve();
        }
        log.write(message);
      });

      p["tests"].stderr.on("data", function (chunk) {
        let message = chunk.toString();
        console.log("ERROR IN START NODES", message.substring(0, message.length - 1));
        log.write(message);
        //throw new Error(message);
      });
    } catch (e) {
      console.log("ERROR IN startNodes", reject(e));
    }
  });
}
// Kill all processes spawned and tracked by this file.
export function killAll() {
  console.log("\nKilling all processes... (tests)");
  for (const key of Object.keys(p)) {
    p[key]
    p[key].kill();
  }
}

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
