import Keyring from "@polkadot/keyring";
import { expect } from "chai";

import { describeParachain } from "../test-utils/setup-para-tests";

describeParachain("Balance genesis", { chain: "rococo-local" }, (context) => {
	it("should be accessible through web3", async function () {
		const keyring = new Keyring({ type: "sr25519" });
		const aliceRelay = keyring.addFromUri("//Alice");
		expect(
			(
				await context.polkadotApiParaone.query.system.account(
					aliceRelay.addressRaw
				)
			).data.free.toHuman()
		).to.eq("1,152,921,504,606,846,976");
	});
});
