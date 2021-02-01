"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parachainAccount = void 0;
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
function parachainAccount(id) {
    let prefix = util_1.stringToHex("para");
    let encoded_id = util_1.bnToHex(parseInt(id), { isLe: true });
    let address_bytes = (prefix + util_1.hexStripPrefix(encoded_id)).padEnd(64 + 2, 0);
    let address = util_crypto_1.encodeAddress(address_bytes);
    return address;
}
exports.parachainAccount = parachainAccount;
