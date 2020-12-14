import { assert, hexToNumber } from "@polkadot/util";
//import Web3 from 'web3'
const Web3 = require("web3");
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

async function main() {
  // instantiate apis
  //const web3_1 = new Web3(`http://localhost:${RPC_PORT}`);
  const web3_1 = new Web3(`ws://localhost:${WS_PORT}`); // TODO: use wsport, port is p2p port
  // @ts-ignore
  //const web3_2 = new Web3(`http://localhost:${RPC_PORT_2}`);
  const web3_2 = new Web3(`ws://localhost:${WS_PORT_2}`);

  // setup listeners for web3_1
  const subscription1=web3_2.eth
    .subscribe("pendingTransactions", (error, result) => {
      console.log("pendingTransactions");
      if (!error) console.log(result);
      else console.log(error);
    })
    .on("data", function (transaction) {
      console.log("transaction", transaction);
    });
  const subscription2=web3_2.eth
    .subscribe("newBlockHeaders", (error, result) => {
      console.log("newBlockHeaders");
      if (!error) console.log(result.number);
      else console.log(error);
    })
    .on("data", function (blockHeader) {
      console.log("blockHeader", blockHeader.number);
    });

  // Kill all processes when exiting.
  process.on("exit", function () {
    subscription1.unsubscribe(function(error, success){
        if(success)
            console.log('Successfully unsubscribed sub1 !');
    });
    subscription2.unsubscribe(function(error, success){
        if(success)
            console.log('Successfully unsubscribed sub2 !');
    });
  });

  // Handle ctrl+c to trigger `exit`.
  process.on("SIGINT", function () {
    process.exit(2);
  });

  //"genesis balance is setup correctly (web3)", async function () {
  let balance_web3_1: number = await web3_1.eth.getBalance(GENESIS_ACCOUNT);
  let previousBalance: number = balance_web3_1;
  console.log("balance web3 1", balance_web3_1);
  let balance_web3_2: number = await web3_2.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 2", balance_web3_2);
  assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
  assert((balance_web3_1).toString()===GENESIS_ACCOUNT_BALANCE,'wrong balance');
  //});
  // //"genesis balance is setup correctly (polkadotJs)", async function () {
  //const account = await context.polkadotApi.query.system.account(GENESIS_ACCOUNT);
  //     expect(account.data.free.toString()).to.equal(GENESIS_ACCOUNT_BALANCE);
  //   //});

  // //"balance to be updated after transfer", async function () {
  //     this.timeout(15000);
  //console.log(await web3_1.eth.accounts.wallet)
  await web3_1.eth.accounts.wallet.add(GENESIS_ACCOUNT_PRIVATE_KEY);
  console.log("wallet added");

  let nonce: number = await web3_1.eth.getTransactionCount(GENESIS_ACCOUNT);
  console.log('nonce',nonce)
  //console.log(await web3_1.eth.accounts.wallet)
  const value: string = "0x20000";

  const resp = await web3_1.eth.sendTransaction(
    {
      from: GENESIS_ACCOUNT,
      to: TEST_ACCOUNT,
      value, // Must me higher than ExistentialDeposit (500)
      gasPrice: "0x01",
      gas: "0x100000",
      nonce
    },
    GENESIS_ACCOUNT_PRIVATE_KEY
  );
  console.log("block", resp.blockNumber);
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
  console.log(balance_web3_1 - previousBalance);
  previousBalance = balance_web3_1;
  //   assert(
  //     balance_web3_1 === previousBalance - transferCost,
  //     transferCost + " should have been substracted"
  //   );
  async function serialSend(
    _value: string,
    nbIterations: number
  ): Promise<number> {
    for (let i = 0; i < nbIterations; i++) {
      console.log("starting ", i);
      const resp = await web3_1.eth.sendTransaction(
        {
          from: GENESIS_ACCOUNT,
          to: TEST_ACCOUNT,
          value: _value, // Must me higher than ExistentialDeposit (500)
          gasPrice: "0x01",
          gas: "0x100000",
        },
        GENESIS_ACCOUNT_PRIVATE_KEY
      );
      console.log("block for " + i + " : ", resp.blockNumber);
    }
    return (resp.gasUsed + hexToNumber(value)) * nbIterations;
  }
  const cost: number = await serialSend(value, 100);
  balance_web3_1 = await web3_1.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 1", balance_web3_1);
  balance_web3_2 = await web3_2.eth.getBalance(GENESIS_ACCOUNT);
  console.log("balance web3 2", balance_web3_2);
  assert(balance_web3_1 === balance_web3_2, "web3 balances should be the same");
  console.log("balance change", balance_web3_1 - previousBalance);
}

main();

// const polkadotJsTypes = require("../../../polkadot-js/standalone-types.json");
// const polkadotJsRpc = require("../../../polkadot-js/frontier-rpc-types");

// const wsProvider = new WsProvider(`ws://localhost:${WS_PORT}`);
// const polkadotApi = await ApiPromise.create({
//   provider: wsProvider,
//   types: polkadotJsTypes,
//   rpc: polkadotJsRpc,
// });
