import Web3 from "web3";
import { sendTxSync } from "./web3Calls";

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