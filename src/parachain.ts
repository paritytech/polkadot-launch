import { bnToHex, stringToHex, hexStripPrefix } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";

export function parachainAccount(id: string) {
	let prefix = stringToHex("para");
	let encoded_id = bnToHex(parseInt(id), { isLe: true });
	let address_bytes = (prefix + hexStripPrefix(encoded_id)).padEnd(64 + 2, "0");
	let address = encodeAddress(address_bytes);

	return address;
}
