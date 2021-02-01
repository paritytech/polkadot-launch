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
//const fs=require('fs')

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
const { resolve, dirname } = require("path");

interface ParachainConfig {
  bin: string;
  id: string;
  rpcPort: number;
  wsPort: number;
  port: number;
  balance: string;
  flags: string[];
}

export default async function main() {
  let clientList: Web3[];
  let accounts: string[];
  // set a value for the transfers
  const value: string = TRANSFER_VALUE;
  const initialNodeBalance: string = INITIAL_NODE_BALANCE;
  console.log("transfer value is ", hexToNumber(value));
  console.log("initial node balance is ", hexToNumber(initialNodeBalance));

  // keep track of registered parachains
  let registeredParachains: { [key: string]: boolean } = {};

  // Verify that the `config.json` has all the expected properties.
  // if (!checkConfig(config)) {
  // 	return;
  // }

  const config_file = "config_moonbeam_antoine.json"; //argv._[0] ? argv._[0] : null;
  if (!config_file) {
    console.error("Missing config file argument...");
    process.exit();
  }
  let config_path = resolve(process.cwd(), config_file);
  let config_dir = dirname(config_path);
  if (!fs.existsSync(config_path)) {
    console.error("Config file does not exist: ", config_path);
    process.exit();
  }
  let config = require(config_path);
  const relay_chain_bin = resolve(config_dir, config.relaychain.bin);
  if (!fs.existsSync(relay_chain_bin)) {
    console.error("Relay chain binary does not exist: ", relay_chain_bin);
    process.exit();
  }
  const chain = config.relaychain.chain;
  await generateChainSpec(relay_chain_bin, chain);
  clearAuthorities(`${chain}.json`);
  for (const node of config.relaychain.nodes) {
    await addAuthority(`${chain}.json`, node.name);
  }
  await generateChainSpecRaw(relay_chain_bin, chain);
  const spec = resolve(`${chain}-raw.json`);

  // First we launch each of the validators for the relay chain.
  for (const node of config.relaychain.nodes) {
    const { name, wsPort, port, flags } = node;
    console.log(`Starting ${name}...`);
    // We spawn a `child_process` starting a node, and then wait until we
    // able to connect to it using PolkadotJS in order to know its running.
    startNode(relay_chain_bin, name, wsPort, port, spec, flags);
  }

  // Connect to the first relay chain node to submit the extrinsic.
  let relayChainApi = await connect(
    config.relaychain.nodes[0].wsPort,
    config.types
  );

  // Then launch each parachain
  await new Promise<void>(async (resolvePromise, reject) => {
    let readyIndex = 0;
    function checkFinality() {
      readyIndex += 1;
      if (readyIndex === config.parachains.length) {
        resolvePromise();
      }
    }
    for (const parachain of config.parachains) {
      const { id, wsPort, balance, port, flags, chain } = parachain;
      const bin = resolve(config_dir, parachain.bin);
      if (!fs.existsSync(bin)) {
        console.error("Parachain binary does not exist: ", bin);
        process.exit();
      }
      let account = parachainAccount(id);
      console.log(
        `Starting a Collator for parachain ${id}: ${account}, Collator port : ${port} wsPort : ${wsPort}`
      );
      await startCollator(bin, id, wsPort, port, chain, spec, flags);

      // If it isn't registered yet, register the parachain on the relaychain
      if (!registeredParachains[id]) {
        console.log(`Registering Parachain ${id}`);

        // Get the information required to register the parachain on the relay chain.
        let genesisState;
        let genesisWasm;
        try {
          genesisState = await exportGenesisState(bin, id, chain);
          genesisWasm = await exportGenesisWasm(bin, chain);
        } catch (err) {
          console.error(err);
          process.exit(1);
        }
        try {
          await registerParachain(relayChainApi, id, genesisWasm, genesisState);
          //checkFinality('isRegistered')
        } catch (e) {
          console.log("error during register", e);
        }

        registeredParachains[id] = true;

        // Allow time for the TX to complete, avoiding nonce issues.
        // TODO: Handle nonce directly instead of this.
        if (balance) {
          await setBalance(relayChainApi, account, balance);
          //checkFinality('isBalanceSet')
        }
      }
      checkFinality();
    }
  });
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
  console.log(4);

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
