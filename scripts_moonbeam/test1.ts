import { assert } from '@polkadot/util'

const port_1=

//"genesis balance is setup correctly (web3)", async function () {
    expect(await context.web3.eth.getBalance(GENESIS_ACCOUNT)).to.equal(GENESIS_ACCOUNT_BALANCE);
  //});
//"genesis balance is setup correctly (polkadotJs)", async function () {
    const account = await context.polkadotApi.query.system.account(GENESIS_ACCOUNT);
    expect(account.data.free.toString()).to.equal(GENESIS_ACCOUNT_BALANCE);
  //});

//"balance to be updated after transfer", async function () {
    this.timeout(15000);

    const tx = await context.web3.eth.accounts.signTransaction(
      {
        from: GENESIS_ACCOUNT,
        to: TEST_ACCOUNT,
        value: "0x200", // Must me higher than ExistentialDeposit (500)
        gasPrice: "0x01",
        gas: "0x100000",
      },
      GENESIS_ACCOUNT_PRIVATE_KEY
    );
    await customRequest(context.web3, "eth_sendRawTransaction", [tx.rawTransaction]);
    await createAndFinalizeBlock(context.web3);
    expect(await context.web3.eth.getBalance(GENESIS_ACCOUNT)).to.equal(
      "340282366920938463463374607431768189943"
    );
    expect(await context.web3.eth.getBalance(TEST_ACCOUNT)).to.equal("512");
  //});