import Keyring from "@polkadot/keyring";
import { expect } from "chai";

import { describeParachain } from "../test-utils/setup-para-tests";

describeParachain(
	"Balance genesis",
	{ chain: "rococo-local", numberOfParachains: 2 },
	(context) => {
		it("should be accessible through web3", async function () {
			const keyring = new Keyring({ type: "sr25519" });
			const aliceRelay = keyring.addFromUri("//Alice");

			//check parachain id
			expect(
				(
					(await context._polkadotApiRelaychains[0].query.paras.parachains()) as any
				)[0].toString()
			).to.eq("1000");
			expect(
				(
					(await context._polkadotApiRelaychains[0].query.paras.parachains()) as any
				)[1].toString()
			).to.eq("2000");
			expect(
				(
					await context.polkadotApiParaone.query.system.account(
						aliceRelay.addressRaw
					)
				).data.free.toHuman()
			).to.eq("1,152,921,504,606,846,976");
		});
	}
);
