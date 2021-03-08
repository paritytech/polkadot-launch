import { hexToNumber, assert } from "@polkadot/util";
import Web3 from "web3";
import { parallelSend, startNodes } from "../scripts_moonbeam/testUtils";
import { readEveryBlock } from "../scripts_moonbeam/testUtils/testChecks";
import { listenForBlocks } from "../scripts_moonbeam/testUtils/watchBlock";
import {
  //sendTxSync,
  sendTxWrapped,
} from "../scripts_moonbeam/testUtils/web3Calls";
//import fs from "fs";
import {
  startNode,
  startCollator,
  killAll,
  generateChainSpec,
  generateChainSpecRaw,
  exportGenesisWasm,
  exportGenesisState,
  //@ts-ignore
} from "../src/spawn";
//@ts-ignore
import { clearAuthorities, addAuthority } from "../src/spec";
//@ts-ignore
import { parachainAccount } from "../src/parachain";
//@ts-ignore
import { connect, registerParachain, setBalance } from "../src/rpc";
import fs from 'fs'
import  { resolve, dirname } from 'path'
//const fs=require('fs')
import {LaunchConfig} from '../src/types'
import { start } from "../src";

export const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
//const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
const GENESIS_ACCOUNT_PRIVATE_KEY =
  "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";
const TRANSFER_VALUE = "0x2000";
const INITIAL_NODE_BALANCE = "0x200000000";

//const { argv } = require("yargs");
const NUMBER_TX: number = 10;
// argv._ &&argv._[0] ? Number(argv._[0]) : 2;
// if (!argv._ ||!argv._[0]) {
//   console.error("Missing tx number argument... tx number set to 2");
// }

//const config = require("../config_moonbeam_antoine.json");
//const { resolve, dirname } = require("path");

interface ParachainConfig {
  bin: string;
  id: string;
  rpcPort: number;
  wsPort: number;
  port: number;
  balance: string;
  flags: string[];
}

export {start} from '../src'



export default async function main() {
  const config_file = "config_moonbeam.json";
  if (!config_file) {
    console.error("Missing config file argument... 1");
    process.exit();
  }
  let config_path = resolve(process.cwd(), config_file);
  let config_dir = dirname(config_path);
  if (!fs.existsSync(config_path)) {
    console.error("Config file does not exist: ", config_path);
    process.exit();
  }
  let config:LaunchConfig = require(config_path);

  let clientList: Web3[];
  let accounts: string[];
  // set a value for the transfers
  const value: string = TRANSFER_VALUE;
  const initialNodeBalance: string = INITIAL_NODE_BALANCE;
  console.log("transfer value is ", hexToNumber(value));
  console.log("initial node balance is ", hexToNumber(initialNodeBalance));
  console.log("config_file",config_file)
  await start(config_file)
  console.log("ALL PARACHAINS REGISTERED");

  console.log("GREAT SUCCESS, nodes ready");
  // instantiate apis
  clientList = config.parachains.map((parachain: ParachainConfig) => {
    console.log("connecting new web3 instance to wsport:" + parachain.wsPort);
    return new Web3(`ws://127.0.0.1:${parachain.wsPort}`);
  });

  //TODO add check on each client, or not...

  // listen for block updates
  listenForBlocks(clientList[0]);

  // add genesis account to wallet of client 0
  await clientList[0].eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
  console.log("wallet genesis added");

  // add these accounts to the other nodes
  accounts = await Promise.all(
    config.parachains.map(async (_:ParachainConfig, i:number) => {
      if (i > 0) {
        const wallet = await clientList[i].eth.accounts.wallet.create(1);
        return wallet[0].address;
      } else {
        return GENESIS_ACCOUNT;
      }
    })
  );

  //send money from genesis to other accounts
  for (let i = 1; i < config.parachains.length; i++) {
    await sendTxWrapped(clientList[0], {
      from: GENESIS_ACCOUNT,
      to: accounts[i],
      value: initialNodeBalance,
      gasPrice: "0x01",
      gas: "0x100000",
    });
    assert(
      Number(await clientList[0].eth.getBalance(accounts[i])) ===
        hexToNumber(initialNodeBalance),
      "balance for node not correctly set"
    );
  }
  console.log("money ditributed to other nodes");

  //assert(false).to.be.true
  // get the nonces of each node
  let nonces: number[];
  try {
    nonces = await Promise.all(
      config.parachains.map(async (_:ParachainConfig, i:number) => {
        return clientList[i].eth.getTransactionCount(accounts[i]);
      })
    );
  } catch (e) {
    console.log("nonce error", e);
  }
  //check initial balance and block for comparaison
  const initialBalance = await clientList[0].eth.getBalance(TEST_ACCOUNT);
  let initialBlockNumber = (await clientList[0].eth.getBlock("latest")).number;

  //have all nodes send their transfers in parallel
  config.parachains.forEach((_:ParachainConfig, i:number) => {
    parallelSend(
      clientList[i],
      nonces[i],
      value,
      NUMBER_TX,
      accounts[i],
      TEST_ACCOUNT
    );
  });

  // Function to check that all nodes hold the same balance of the test account
  async function checkBalanceSync(web3: Web3) {
    console.log(
      "xxxxxxxx Balance check xxxxxxxxxxxx block:",
      (await web3.eth.getBlock("latest")).number
    );
    //check balance again
    let balance_web3_1: string = await web3.eth.getBalance(GENESIS_ACCOUNT);
    console.log("balance web3 1", balance_web3_1);
    let balance_web3_2: string = await web3.eth.getBalance(GENESIS_ACCOUNT);
    console.log("balance web3 2", balance_web3_2);
    assert(
      balance_web3_1 === balance_web3_2,
      "web3 balances should be the same"
    );
    let recipientBalance: string = await web3.eth.getBalance(TEST_ACCOUNT);
    console.log("recipient balance is ", recipientBalance);
    console.log(
      "it should be         ",
      Number(initialBalance) +
        NUMBER_TX * hexToNumber(value) * config.parachains.length
    );
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    return Number(recipientBalance);
  }

  // Check balances until test account has reached target balance

  let balance = 0;
  while (
    balance <
    Number(initialBalance) +
      NUMBER_TX * hexToNumber(value) * config.parachains.length
  ) {
    await new Promise<number>((resolve, reject) => {
      setTimeout(async () => {
        balance = await checkBalanceSync(clientList[0]);
        resolve(balance);
      }, 6000);
    });
  }

  // log end of test information
  console.log(
    "======================================= THE END ==================================================="
  );
  console.log(
    "block interval ",
    (await clientList[0].eth.getBlock("latest")).number,
    initialBlockNumber
  );
  console.log(
    "Should contain ",
    config.parachains.length - 1 + NUMBER_TX * config.parachains.length,
    " tx"
  );
  // log the tx for each block
  let nbTx: number = await readEveryBlock(clientList[0], initialBlockNumber);
  assert(
    nbTx ===
      config.parachains.length - 1 + NUMBER_TX * config.parachains.length,
    "Not all tx were included in a block"
  );
  //process.exit(0);
  //process.kill(process.pid, 'SIGINT');
  process.exit(0);
}
main();

// log unhandledRejection
process.on("unhandledRejection", (error: any) => {
  if (error.message) {
    console.trace(error);
  } else {
    console.log("unhandledRejection: error thrown without a message");
    console.trace(error);
  }
});

// Kill all processes when exiting.
process.on("exit", function () {
  console.log("exit index spawn");
  killAll();
});

// Handle ctrl+c to trigger `exit`.
process.on("SIGINT", function () {
  console.log("SIGINT spawn");
  process.exit(2);
});
