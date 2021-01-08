import Web3 from "web3";
import { sendTxSync } from "./web3Calls";
//const { spawn, exec } = require("child_process");
import {spawn} from "child_process"

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

  let p={}

  export async function startNodes(){
    console.log('START NODES')
    // let args = [
    // 	"--tmp",
    // 	"--parachain-id=" + id,
    // 	"--port=" + port,
    // 	"--chain=" + spec,
    // 	"--execution=wasm"
    // ];
  
    // p['tests'] = exec("./test-only.sh", (error, stdout, stderr) => {
    // 	if (error) {
    // 		console.log(`error: ${error.message}`);
    // 		return;
    // 	}
    // 	if (stderr) {
    // 		console.log(`stderr: ${stderr}`);
    // 		return;
    // 	}
    // 	console.log(`stdout: ${stdout}`);
    // });
    return new Promise<void>((resolve,reject)=>{
      console.log('spawning...')
      p['tests'] = spawn('yarn start',['config_moonbeam_antoine.json']);
      console.log('spawned...')
    
      //let log = fs.createWriteStream(`tests.log`)
    
      p['tests'].stdout.on('data', function (chunk) {
        let message = chunk.toString();
        console.log("1"+message.substring(0,message.length-1)+"2")
        if (message=="bravo"){
          resolve()
        }
        //log.write(message);
      });
    
      p['tests'].stderr.on('data', function (chunk) {
        let message = chunk.toString();
        console.log('ERROR',message)
        //log.write(message);
        throw new Error(message)
      });
    })
  }
  // Kill all processes spawned and tracked by this file.
  export function killAll() {
    console.log("\nKilling all processes...")
    for (const key of Object.keys(p)) {
      p[key].kill();
    }
  }

// Kill all processes when exiting.
process.on('exit', function () {
	console.log('exit index')
	killAll();
});

// Handle ctrl+c to trigger `exit`.
process.on('SIGINT', function () {
	console.log('SIGINT')
	process.exit(2);
});
console.log('PROCESS CAUGHT')
  