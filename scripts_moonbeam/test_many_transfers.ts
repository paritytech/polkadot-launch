import { assert, hexToNumber } from "@polkadot/util";
import Web3 from "web3";
import { readEveryBlock } from "./testUtils/testChecks";
import { listenForBlocks } from "./testUtils/watchBlock";
import { sendTxSync, sendTxWrapped } from "./testUtils/web3Calls";
//const Web3 = require("web3");
const PORT_1 = 9846;
const RPC_PORT = 9846;
const WS_PORT = 9946;

const PORT_2 = 9847;
const RPC_PORT_2 = 9847;
const WS_PORT_2 = 9947;

export const GENESIS_ACCOUNT = "0x6be02d1d3665660d22ff9624b7be0551ee1ac91b";
const GENESIS_ACCOUNT_BALANCE = "1152921504606846976";
const GENESIS_ACCOUNT_PRIVATE_KEY =
  "0x99B3C12287537E38C90A9219D4CB074A89A16E9CDB20BF85728EBD97C343E342";
const TEST_ACCOUNT = "0x1111111111111111111111111111111111111111";

const NUMBER_TX: number = 500;

//simple test sequence that checks balances and sends one and then 10 transactions
async function main() {
  // instantiate apis
  const web3_1: Web3 = new Web3(`ws://localhost:${WS_PORT}`);
  const web3_2: Web3 = new Web3(`ws://localhost:${WS_PORT_2}`);

  // listen for block updates
  listenForBlocks(web3_2);

  // add genesis account to wallet
  await web3_1.eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
  console.log("wallet added");

  // chose a value for the transfers
  const value: string = "0x20000";
  console.log("value is ", hexToNumber(value));

  const nonce = await web3_1.eth.getTransactionCount(GENESIS_ACCOUNT);
  const initialBalance = await web3_1.eth.getBalance(TEST_ACCOUNT);

  // Send a series of 10 transactions
  function parallelSend(_value: string, nbIterations: number) {
    for (let i = 0; i < nbIterations; i++) {
      console.log("---------- Starting Tx send #", i);
      sendTxSync(web3_1, {
        from: GENESIS_ACCOUNT,
        to: TEST_ACCOUNT,
        value: _value, // Must me higher than ExistentialDeposit (500)
        gasPrice: "0x01",
        gas: "0x100000",
        nonce: nonce + i,
      });
    }
  }
  parallelSend(value, NUMBER_TX);

  async function checkBalanceSync(web3:Web3) {
    console.log("xxxxxxxx Balance check xxxxxxxxxxxx block:",(await web3.eth.getBlock('latest')).number);
    //check balance again
    let balance_web3_1: string = await web3.eth.getBalance(GENESIS_ACCOUNT);
    console.log("balance web3 1", balance_web3_1);
    let balance_web3_2: string = await web3.eth.getBalance(GENESIS_ACCOUNT);
    console.log("balance web3 2", balance_web3_2);
    // assert(
    //   balance_web3_1 === balance_web3_2,
    //   "web3 balances should be the same"
    // );
    let recipientBalance: string = await web3.eth.getBalance(TEST_ACCOUNT);
    console.log("recipient balance is ", recipientBalance);
    console.log(
      "it should be         ",
      Number(initialBalance) + NUMBER_TX * hexToNumber(value)
    );
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    return Number(recipientBalance);
  }
  let initialBlockNumber = (await web3_2.eth.getBlock("latest")).number;
  let balance = 0;
  while (balance < Number(initialBalance) + NUMBER_TX * hexToNumber(value)) {
    await new Promise<number>((resolve, reject) => {
      setTimeout(async () => {
        balance = await checkBalanceSync(web3_2);
        resolve(balance);
      }, 3000);
    });
  }
  console.log('balance',balance,'target',Number(initialBalance) + NUMBER_TX * hexToNumber(value))
  await new Promise<number>((resolve, reject) => {
    setTimeout(async () => {
      balance = await checkBalanceSync(web3_2);
      resolve(balance);
    }, 6000);
  });
  console.log(
    "======================================= THE END ==================================================="
  );
  console.log(
    "block interval ",
    (await web3_2.eth.getBlock("latest")).number,
    initialBlockNumber
  );
  console.log('Should contain ',NUMBER_TX,' tx')
  await readEveryBlock(web3_2)
  //process.exit(2);
}

main();
