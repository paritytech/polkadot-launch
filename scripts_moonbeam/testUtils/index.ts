import Web3 from "web3";
import { sendTxSync } from "./web3Calls";
//const { spawn, exec } = require("child_process");
import { spawn, exec } from "child_process";
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

let p = {};

export async function startNodes() {
  console.log("START NODES");
  // let args = [
  // 	"--tmp",
  // 	"--parachain-id=" + id,
  // 	"--port=" + port,
  // 	"--chain=" + spec,
  // 	"--execution=wasm"
  // ];
  // return new Promise<void>((resolve, reject) => {
  //   p["tests"] = exec(
  //     "yarn start config_moonbeam_antoine.json",
  //     (error, stdout, stderr) => {
  //       console.log('oh')
  //       if (error) {
  //         console.log(`error: ${error.message}`);
  //         return;
  //       }
  //       if (stderr) {
  //         console.log(`stderr: ${stderr}`);
  //         return;
  //       }
  //       console.log(`stdout: ${stdout}`);
  //     }
  //   );
  // });
  return new Promise<void>((resolve, reject) => {
    console.log("spawning...");
    p["tests"] = spawn("./start.sh", []);
    console.log("spawned...");

    let log = fs.createWriteStream(`tests.log`)
    try {
      p["tests"].stdout.on("data", function (chunk) {
        let message = chunk.toString();
        console.log( message.substring(0, message.length - 1));
        if (message.substring(0, message.length - 1) == "ALL PARACHAINS REGISTERED") {
          console.log("RESOLVE");
          resolve();
        }
        log.write(message);
      });
      console.log(1)

      p["tests"].stderr.on("data", function (chunk) {
        let message = chunk.toString();
        console.log("ERROR", message.substring(0, message.length - 1));
        log.write(message);
        //throw new Error(message);
      });
      console.log(1)
    } catch (e) {
      console.log("ERROR IN SPAWN", e);
    }
    //resolve()
    // setTimeout(()=>{
    //   resolve()
    // },30000)
  });
}
// Kill all processes spawned and tracked by this file.
export function killAll() {
  console.log("\nKilling all processes... (tests)");
  for (const key of Object.keys(p)) {
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
console.log("PROCESS CAUGHT");
