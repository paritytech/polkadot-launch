"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAuthority = exports.clearAuthorities = void 0;
const api_1 = require("@polkadot/api");
const util_crypto_1 = require("@polkadot/util-crypto");
const fs = require('fs');
function nameCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Get authority keys from within chainSpec data
function getAuthorityKeys(chainSpec) {
    if (chainSpec.genesis.runtime.runtime_genesis_config) {
        return chainSpec.genesis.runtime.runtime_genesis_config.palletSession.keys;
    }
    return chainSpec.genesis.runtime.palletSession.keys;
}
// Remove all existing keys from `session.keys`
function clearAuthorities(spec) {
    let rawdata = fs.readFileSync(spec);
    let chainSpec;
    try {
        chainSpec = JSON.parse(rawdata);
    }
    catch (_a) {
        console.error("failed to parse the chain spec");
        process.exit(1);
    }
    let keys = getAuthorityKeys(chainSpec);
    keys.length = 0;
    let data = JSON.stringify(chainSpec, null, 2);
    fs.writeFileSync(spec, data);
    console.log(`Starting with a fresh authority set:`);
}
exports.clearAuthorities = clearAuthorities;
// Add additional authorities to chain spec in `session.keys`
function addAuthority(spec, name) {
    return __awaiter(this, void 0, void 0, function* () {
        yield util_crypto_1.cryptoWaitReady();
        const sr_keyring = new api_1.Keyring({ type: 'sr25519' });
        const sr_account = sr_keyring.createFromUri(`//${nameCase(name)}`);
        const sr_stash = sr_keyring.createFromUri(`//${nameCase(name)}//stash`);
        const ed_keyring = new api_1.Keyring({ type: 'ed25519' });
        const ed_account = ed_keyring.createFromUri(`//${nameCase(name)}`);
        let key = [
            sr_stash.address,
            sr_stash.address,
            {
                "grandpa": ed_account.address,
                "babe": sr_account.address,
                "im_online": sr_account.address,
                "parachain_validator": sr_account.address,
                "authority_discovery": sr_account.address,
                "para_validator": sr_account.address,
                "para_assignment": sr_account.address,
            }
        ];
        let rawdata = fs.readFileSync(spec);
        let chainSpec = JSON.parse(rawdata);
        let keys = getAuthorityKeys(chainSpec);
        keys.push(key);
        let data = JSON.stringify(chainSpec, null, 2);
        fs.writeFileSync(spec, data);
        console.log(`Added Authority ${name}`);
    });
}
exports.addAuthority = addAuthority;
