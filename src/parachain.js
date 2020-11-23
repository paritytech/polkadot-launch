import polkadot_util from '@polkadot/util';
const { bnToHex, stringToHex, hexStripPrefix } = polkadot_util;
import polkadot_util_crypto from '@polkadot/util-crypto';
const { encodeAddress } = polkadot_util_crypto;

export function parachainAccount(id) {
	let prefix = stringToHex("para");
	let encoded_id = bnToHex(parseInt(id), { isLe: true });
	let address_bytes = (prefix + hexStripPrefix(encoded_id)).padEnd(64 + 2, 0);
	let address = encodeAddress(address_bytes);

	return address;
}
