import { assert, hexToNumber } from "@polkadot/util";
import Web3 from "web3";
import { readEveryBlock } from "./testUtils/testChecks";
import { listenForBlocks } from "./testUtils/watchBlock";
import { sendTxSync, sendTxWrapped } from "./testUtils/web3Calls";

export const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
const GENESIS_ACCOUNT_PRIVATE_KEY =
  "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";

const { argv } = require('yargs')
const NUMBER_TX:number = argv._[0] ? Number(argv._[0]) : 2;
if (!argv._[0]) {
	console.error("Missing tx number argument... tx number set to 2");
}

const config = require("../config_moonbeam_many_nodes.json");

//simple test sequence that checks balances and sends one and then 10 transactions
async function main() {
  // instantiate apis
  const clientList: Web3[] = config.parachains.map((parachain) => {
    return new Web3(`ws://localhost:${parachain.wsPort}`);
  });

  // listen for block updates
  listenForBlocks(clientList[0]);

  // add genesis account to wallet of client 0
  await clientList[0].eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
  console.log("wallet genesis added");

  // add these accounts to the other nodes
  let accounts: string[] = await Promise.all(
    config.parachains.map(async (_, i) => {
      if (i > 0) {
        const wallet = await clientList[i].eth.accounts.wallet.create(1);
        return wallet[0].address;
      } else {
        return GENESIS_ACCOUNT;
      }
    })
  );

  // chose a value for the transfers
  const value: string = "0x2000";
  const initialNodeBalance: string = "0x200000000";
  console.log("value is ", hexToNumber(value));
  console.log("initial node balance is ", hexToNumber(initialNodeBalance));

  //send money from genesis to other accounts
  for (let i = 1; i < config.parachains.length; i++) {
    await sendTxWrapped(clientList[0], {
      from: GENESIS_ACCOUNT,
      to: accounts[i],
      value: initialNodeBalance,
      gasPrice: "0x01",
      gas: "0x100000",
    });
    assert(Number(await clientList[0].eth.getBalance(accounts[i]))===hexToNumber(initialNodeBalance),"balance for node not correctly set")
  }
  console.log("money ditributed to other nodes");

  const nonces: number[] = await Promise.all(
    config.parachains.map(async (_, i) => {
      return clientList[i].eth.getTransactionCount(accounts[i]);
    })
  );
  const initialBalance = await clientList[0].eth.getBalance(TEST_ACCOUNT);

  // Send a series of 10 transactions
  function parallelSend(
    web3: Web3,
    startingNonce: number,
    _value: string,
    nbIterations: number,
    account: string
  ) {
    for (let i = 0; i < nbIterations; i++) {
      console.log("---------- Starting Tx send #", i);
      sendTxSync(web3, {
        from: account,
        to: TEST_ACCOUNT,
        value: _value, // Must me higher than ExistentialDeposit (500)
        gasPrice: "0x01",
        gas: "0x100000",
        nonce: startingNonce + i,
      });
    }
  }

  config.parachains.forEach((_, i) => {
    parallelSend(clientList[i], nonces[i], value, NUMBER_TX, accounts[i]);
  });

  async function checkBalanceSync(web3:Web3) {
    console.log("xxxxxxxx Balance check xxxxxxxxxxxx block:",(await web3.eth.getBlock('latest')).number);
    //check balance again
    let balance_web3_1: string = await web3.eth.getBalance(
      GENESIS_ACCOUNT
    );
    console.log("balance web3 1", balance_web3_1);
    let balance_web3_2: string = await web3.eth.getBalance(
      GENESIS_ACCOUNT
    );
    console.log("balance web3 2", balance_web3_2);
    // assert(
    //   balance_web3_1 === balance_web3_2,
    //   "web3 balances should be the same"
    // );
    let recipientBalance: string = await web3.eth.getBalance(
      TEST_ACCOUNT
    );
    console.log("recipient balance is ", recipientBalance);
    console.log(
      "it should be         ",
      Number(initialBalance) +
        NUMBER_TX * hexToNumber(value) * config.parachains.length
    );
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    return Number(recipientBalance);
  }
  let initialBlockNumber = (await clientList[0].eth.getBlock("latest")).number;
  let balance = 0;
  while (balance < Number(initialBalance) + NUMBER_TX * hexToNumber(value) * config.parachains.length) {
    await new Promise<number>((resolve, reject) => {
      setTimeout(async () => {
        balance = await checkBalanceSync(clientList[0]);
        resolve(balance);
      }, 6000);
    });
  }
  console.log('balance',balance,'target',Number(initialBalance) + NUMBER_TX * hexToNumber(value) * config.parachains.length)
  await new Promise<number>((resolve, reject) => {
    setTimeout(async () => {
      balance = await checkBalanceSync(clientList[0]);
      resolve(balance);
    }, 6000);
  });
  console.log(
    "======================================= THE END ==================================================="
  );
  console.log(
    "block interval ",
    (await clientList[0].eth.getBlock("latest")).number,
    initialBlockNumber
  );
  console.log('Should contain ',config.parachains.length-1+NUMBER_TX*(config.parachains.length),' tx')
  await readEveryBlock(clientList[0])
  process.exit(0);
}

main();
