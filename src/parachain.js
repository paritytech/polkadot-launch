import { bnToHex, stringToHex, hexStripPrefix } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';

export function parachainAccount(id) {
	console.log(id);
	let prefix = stringToHex("para");
	let encoded_id = bnToHex(parseInt(id), { isLe: true });
	console.log(prefix, encoded_id);
	let address_bytes = (prefix + hexStripPrefix(encoded_id)).padEnd(64 + 2, 0);
	console.log(address_bytes);
	let address = encodeAddress(address_bytes);

	return address;
}
