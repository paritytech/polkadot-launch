import { assert, hexToNumber } from "@polkadot/util";
import Web3 from "web3";
import { listenForBlocks } from "./testUtils/watchBlock";
import { sendTxWrapped } from "./testUtils/webCalls";
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

//simple test sequence that checks balances and sends one and then 10 transactions
async function main() {
  // instantiate apis
  const web3_1: Web3 = new Web3(`ws://localhost:${WS_PORT}`);
  const web3_2: Web3 = new Web3(`ws://localhost:${WS_PORT_2}`);

  // listen for block updates
  listenForBlocks(web3_2);

  //check that genesis balance is setup correctly 
  let balance_web3_1: string = await web3_1.eth.getBalance(GENESIS_ACCOUNT);
  let previousBalance: string = balance_web3_1;
  console.log("balance web3 1", balance_web3_1);
  let balance_web3_2: string = await web3_2.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 2", balance_web3_2);
  assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
  assert((balance_web3_1).toString()===GENESIS_ACCOUNT_BALANCE,'wrong balance');

  // add genesis account to wallet
  await web3_1.eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
  console.log("wallet added");

  // send one simple transfer
  const value: string = "0x20000";

  const resp = await sendTxWrapped(web3_1, {
    from: GENESIS_ACCOUNT,
    to: TEST_ACCOUNT,
    value, // Must me higher than ExistentialDeposit (500)
    gasPrice: "0x01",
    gas: "0x100000"
  });

  //check balances
  balance_web3_1 = await web3_1.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 1", balance_web3_1);
  balance_web3_2 = await web3_2.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 2", balance_web3_2);
  assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
  const transferCost: number = resp.gasUsed + hexToNumber(value);
  console.log(
    "gas that should have be used",
    resp.gasUsed,
    hexToNumber(value),
    transferCost
  );
  console.log(Number(balance_web3_1) - Number(previousBalance));
  previousBalance = balance_web3_1;
  //   assert(
  //     balance_web3_1 === previousBalance - transferCost,
  //     transferCost + " should have been substracted"
  //   );


  // Send a series of 10 transactions
  async function serialSend(
    _value: string,
    nbIterations: number
  ): Promise<number> {
    for (let i = 0; i < nbIterations; i++) {
      console.log("---------- Starting Tx send #", i);
      const resp = await sendTxWrapped(web3_1, {
        from: GENESIS_ACCOUNT,
        to: TEST_ACCOUNT,
        value: _value, // Must me higher than ExistentialDeposit (500)
        gasPrice: "0x01",
        gas: "0x100000",
      });
      console.log(
        "---------- Tx " + i + " included in Block : ",
        resp.blockNumber
      );
    }
    return (resp.gasUsed + hexToNumber(value)) * nbIterations;
  }
  const cost: number = await serialSend(value, 10);

  //check balance again
  balance_web3_1 = await web3_1.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 1", balance_web3_1);
  balance_web3_2 = await web3_2.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 2", balance_web3_2);
  assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
  console.log(
    "balance change",
    Number(balance_web3_1) - Number(previousBalance)
  );
  console.log("should have cost ",cost)
}

main();
