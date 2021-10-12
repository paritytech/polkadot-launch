import Keyring from "@polkadot/keyring";
import { expect } from "chai";

//import { ALITH, GENESIS_ACCOUNT, GENESIS_ACCOUNT_BALANCE } from "../../util/constants";
import { describeParachain } from "../test-utils/setup-para-tests";

const MOONRIVER_SUDO_ACCOUNT = "0xb728c13034c3b6c6447f399d25b097216a0081ea";

describeParachain("Balance genesis", { chain: "./rococo-local.json" }, (context) => {
  it("should be accessible through web3", async function () {
    const keyring = new Keyring({ type: "sr25519" });
    const aliceRelay = keyring.addFromUri("//Alice");
    expect(
      (await context.polkadotApiParaone.query.system.account(aliceRelay.addressRaw)).data.free.toHuman()
    ).to.eq("1.2078 MMOVR");
  });
});
