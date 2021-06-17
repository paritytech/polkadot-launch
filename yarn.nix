{ fetchurl, fetchgit, linkFarm, runCommandNoCC, gnutar }: rec {
  offline_cache = linkFarm "offline" packages;
  packages = [
    {
      name = "_babel_runtime___runtime_7.14.0.tgz";
      path = fetchurl {
        name = "_babel_runtime___runtime_7.14.0.tgz";
        url  = "https://registry.yarnpkg.com/@babel/runtime/-/runtime-7.14.0.tgz";
        sha1 = "46794bc20b612c5f75e62dd071e24dfd95f1cbe6";
      };
    }
    {
      name = "_polkadot_api_derive___api_derive_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_api_derive___api_derive_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/api-derive/-/api-derive-4.11.1.tgz";
        sha1 = "d4b78a2e26084b13af17e759978c9bb502172bcc";
      };
    }
    {
      name = "_polkadot_api___api_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_api___api_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/api/-/api-4.11.1.tgz";
        sha1 = "286006c85855dbf858badb3187987b0d2a19fbe7";
      };
    }
    {
      name = "_polkadot_keyring___keyring_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_keyring___keyring_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/keyring/-/keyring-6.5.1.tgz";
        sha1 = "6ef650514cf7a890bd1e04ad793574ed4354d2ff";
      };
    }
    {
      name = "_polkadot_metadata___metadata_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_metadata___metadata_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/metadata/-/metadata-4.11.1.tgz";
        sha1 = "30bbc3ae08e5b9e5dd872fd6df1746b78545324c";
      };
    }
    {
      name = "_polkadot_networks___networks_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_networks___networks_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/networks/-/networks-6.5.1.tgz";
        sha1 = "97c29922a924286919927149f5ba869026d07a53";
      };
    }
    {
      name = "_polkadot_rpc_core___rpc_core_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_rpc_core___rpc_core_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/rpc-core/-/rpc-core-4.11.1.tgz";
        sha1 = "00aa062a9e03faefd720e21d5916757195931aa9";
      };
    }
    {
      name = "_polkadot_rpc_provider___rpc_provider_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_rpc_provider___rpc_provider_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/rpc-provider/-/rpc-provider-4.11.1.tgz";
        sha1 = "8a93a9d32d863498f8312e3a10fd33b98c89654e";
      };
    }
    {
      name = "_polkadot_types_known___types_known_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_types_known___types_known_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/types-known/-/types-known-4.11.1.tgz";
        sha1 = "755e8287e63841779ac1b3ca14e49c493818216f";
      };
    }
    {
      name = "_polkadot_types___types_4.11.1.tgz";
      path = fetchurl {
        name = "_polkadot_types___types_4.11.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/types/-/types-4.11.1.tgz";
        sha1 = "217ac72b82c96701bc380d6b8683f8faa0b966b0";
      };
    }
    {
      name = "_polkadot_util_crypto___util_crypto_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_util_crypto___util_crypto_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/util-crypto/-/util-crypto-6.5.1.tgz";
        sha1 = "d0b63eaa2372665fd2b0610c36444962bc751b68";
      };
    }
    {
      name = "_polkadot_util___util_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_util___util_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/util/-/util-6.5.1.tgz";
        sha1 = "27f75c53df9e990ed37c2edf7aab87ac1a63afb5";
      };
    }
    {
      name = "_polkadot_wasm_crypto_asmjs___wasm_crypto_asmjs_4.0.2.tgz";
      path = fetchurl {
        name = "_polkadot_wasm_crypto_asmjs___wasm_crypto_asmjs_4.0.2.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/wasm-crypto-asmjs/-/wasm-crypto-asmjs-4.0.2.tgz";
        sha1 = "f42c353a64e1243841daf90e4bd54eff01a4e3cf";
      };
    }
    {
      name = "_polkadot_wasm_crypto_wasm___wasm_crypto_wasm_4.0.2.tgz";
      path = fetchurl {
        name = "_polkadot_wasm_crypto_wasm___wasm_crypto_wasm_4.0.2.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/wasm-crypto-wasm/-/wasm-crypto-wasm-4.0.2.tgz";
        sha1 = "89f9e0a1e4d076784d4a42bea37fc8b06bdd8bb6";
      };
    }
    {
      name = "_polkadot_wasm_crypto___wasm_crypto_4.0.2.tgz";
      path = fetchurl {
        name = "_polkadot_wasm_crypto___wasm_crypto_4.0.2.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/wasm-crypto/-/wasm-crypto-4.0.2.tgz";
        sha1 = "9649057adee8383cc86433d107ba526b718c5a3b";
      };
    }
    {
      name = "_polkadot_x_fetch___x_fetch_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_fetch___x_fetch_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-fetch/-/x-fetch-6.5.1.tgz";
        sha1 = "94dec3e81637b55a1270d7bf7bd4cdc0ae22ad08";
      };
    }
    {
      name = "_polkadot_x_global___x_global_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_global___x_global_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-global/-/x-global-6.5.1.tgz";
        sha1 = "cdc42c200cd0182845284d237c3cd55fbf89898d";
      };
    }
    {
      name = "_polkadot_x_randomvalues___x_randomvalues_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_randomvalues___x_randomvalues_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-randomvalues/-/x-randomvalues-6.5.1.tgz";
        sha1 = "e04fb8f149ee1b6921e668ed22b5d65c0dfce8f2";
      };
    }
    {
      name = "_polkadot_x_rxjs___x_rxjs_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_rxjs___x_rxjs_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-rxjs/-/x-rxjs-6.5.1.tgz";
        sha1 = "4a4e3a6743bf15cc086edc57b4ee4d800274c073";
      };
    }
    {
      name = "_polkadot_x_textdecoder___x_textdecoder_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_textdecoder___x_textdecoder_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-textdecoder/-/x-textdecoder-6.5.1.tgz";
        sha1 = "430f9fa5e4f348effb0fb5b793fef49ae97a361a";
      };
    }
    {
      name = "_polkadot_x_textencoder___x_textencoder_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_textencoder___x_textencoder_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-textencoder/-/x-textencoder-6.5.1.tgz";
        sha1 = "06c66f0c5a1857d22729cebc9d72b4e404a81bf2";
      };
    }
    {
      name = "_polkadot_x_ws___x_ws_6.5.1.tgz";
      path = fetchurl {
        name = "_polkadot_x_ws___x_ws_6.5.1.tgz";
        url  = "https://registry.yarnpkg.com/@polkadot/x-ws/-/x-ws-6.5.1.tgz";
        sha1 = "662076ee835108381e83b7f6b1da3e8c60d27a70";
      };
    }
    {
      name = "_types_bn.js___bn.js_4.11.6.tgz";
      path = fetchurl {
        name = "_types_bn.js___bn.js_4.11.6.tgz";
        url  = "https://registry.yarnpkg.com/@types/bn.js/-/bn.js-4.11.6.tgz";
        sha1 = "c306c70d9358aaea33cd4eda092a742b9505967c";
      };
    }
    {
      name = "_types_node_fetch___node_fetch_2.5.10.tgz";
      path = fetchurl {
        name = "_types_node_fetch___node_fetch_2.5.10.tgz";
        url  = "https://registry.yarnpkg.com/@types/node-fetch/-/node-fetch-2.5.10.tgz";
        sha1 = "9b4d4a0425562f9fcea70b12cb3fcdd946ca8132";
      };
    }
    {
      name = "_types_node___node_15.3.0.tgz";
      path = fetchurl {
        name = "_types_node___node_15.3.0.tgz";
        url  = "https://registry.yarnpkg.com/@types/node/-/node-15.3.0.tgz";
        sha1 = "d6fed7d6bc6854306da3dea1af9f874b00783e26";
      };
    }
    {
      name = "_types_websocket___websocket_1.0.2.tgz";
      path = fetchurl {
        name = "_types_websocket___websocket_1.0.2.tgz";
        url  = "https://registry.yarnpkg.com/@types/websocket/-/websocket-1.0.2.tgz";
        sha1 = "d2855c6a312b7da73ed16ba6781815bf30c6187a";
      };
    }
    {
      name = "ansi_regex___ansi_regex_5.0.0.tgz";
      path = fetchurl {
        name = "ansi_regex___ansi_regex_5.0.0.tgz";
        url  = "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-5.0.0.tgz";
        sha1 = "388539f55179bf39339c81af30a654d69f87cb75";
      };
    }
    {
      name = "ansi_styles___ansi_styles_4.3.0.tgz";
      path = fetchurl {
        name = "ansi_styles___ansi_styles_4.3.0.tgz";
        url  = "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-4.3.0.tgz";
        sha1 = "edd803628ae71c04c85ae7a0906edad34b648937";
      };
    }
    {
      name = "asynckit___asynckit_0.4.0.tgz";
      path = fetchurl {
        name = "asynckit___asynckit_0.4.0.tgz";
        url  = "https://registry.yarnpkg.com/asynckit/-/asynckit-0.4.0.tgz";
        sha1 = "c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79";
      };
    }
    {
      name = "base_x___base_x_3.0.8.tgz";
      path = fetchurl {
        name = "base_x___base_x_3.0.8.tgz";
        url  = "https://registry.yarnpkg.com/base-x/-/base-x-3.0.8.tgz";
        sha1 = "1e1106c2537f0162e8b52474a557ebb09000018d";
      };
    }
    {
      name = "base64_js___base64_js_1.5.1.tgz";
      path = fetchurl {
        name = "base64_js___base64_js_1.5.1.tgz";
        url  = "https://registry.yarnpkg.com/base64-js/-/base64-js-1.5.1.tgz";
        sha1 = "1b1b440160a5bf7ad40b650f095963481903930a";
      };
    }
    {
      name = "blakejs___blakejs_1.1.0.tgz";
      path = fetchurl {
        name = "blakejs___blakejs_1.1.0.tgz";
        url  = "https://registry.yarnpkg.com/blakejs/-/blakejs-1.1.0.tgz";
        sha1 = "69df92ef953aa88ca51a32df6ab1c54a155fc7a5";
      };
    }
    {
      name = "bn.js___bn.js_4.12.0.tgz";
      path = fetchurl {
        name = "bn.js___bn.js_4.12.0.tgz";
        url  = "https://registry.yarnpkg.com/bn.js/-/bn.js-4.12.0.tgz";
        sha1 = "775b3f278efbb9718eec7361f483fb36fbbfea88";
      };
    }
    {
      name = "brorand___brorand_1.1.0.tgz";
      path = fetchurl {
        name = "brorand___brorand_1.1.0.tgz";
        url  = "https://registry.yarnpkg.com/brorand/-/brorand-1.1.0.tgz";
        sha1 = "12c25efe40a45e3c323eb8675a0a0ce57b22371f";
      };
    }
    {
      name = "bufferutil___bufferutil_4.0.3.tgz";
      path = fetchurl {
        name = "bufferutil___bufferutil_4.0.3.tgz";
        url  = "https://registry.yarnpkg.com/bufferutil/-/bufferutil-4.0.3.tgz";
        sha1 = "66724b756bed23cd7c28c4d306d7994f9943cc6b";
      };
    }
    {
      name = "camelcase___camelcase_5.3.1.tgz";
      path = fetchurl {
        name = "camelcase___camelcase_5.3.1.tgz";
        url  = "https://registry.yarnpkg.com/camelcase/-/camelcase-5.3.1.tgz";
        sha1 = "e3c9b31569e106811df242f715725a1f4c494320";
      };
    }
    {
      name = "cipher_base___cipher_base_1.0.4.tgz";
      path = fetchurl {
        name = "cipher_base___cipher_base_1.0.4.tgz";
        url  = "https://registry.yarnpkg.com/cipher-base/-/cipher-base-1.0.4.tgz";
        sha1 = "8760e4ecc272f4c363532f926d874aae2c1397de";
      };
    }
    {
      name = "cliui___cliui_6.0.0.tgz";
      path = fetchurl {
        name = "cliui___cliui_6.0.0.tgz";
        url  = "https://registry.yarnpkg.com/cliui/-/cliui-6.0.0.tgz";
        sha1 = "511d702c0c4e41ca156d7d0e96021f23e13225b1";
      };
    }
    {
      name = "color_convert___color_convert_2.0.1.tgz";
      path = fetchurl {
        name = "color_convert___color_convert_2.0.1.tgz";
        url  = "https://registry.yarnpkg.com/color-convert/-/color-convert-2.0.1.tgz";
        sha1 = "72d3a68d598c9bdb3af2ad1e84f21d896abd4de3";
      };
    }
    {
      name = "color_name___color_name_1.1.4.tgz";
      path = fetchurl {
        name = "color_name___color_name_1.1.4.tgz";
        url  = "https://registry.yarnpkg.com/color-name/-/color-name-1.1.4.tgz";
        sha1 = "c2a09a87acbde69543de6f63fa3995c826c536a2";
      };
    }
    {
      name = "combined_stream___combined_stream_1.0.8.tgz";
      path = fetchurl {
        name = "combined_stream___combined_stream_1.0.8.tgz";
        url  = "https://registry.yarnpkg.com/combined-stream/-/combined-stream-1.0.8.tgz";
        sha1 = "c3d45a8b34fd730631a110a8a2520682b31d5a7f";
      };
    }
    {
      name = "create_hash___create_hash_1.2.0.tgz";
      path = fetchurl {
        name = "create_hash___create_hash_1.2.0.tgz";
        url  = "https://registry.yarnpkg.com/create-hash/-/create-hash-1.2.0.tgz";
        sha1 = "889078af11a63756bcfb59bd221996be3a9ef196";
      };
    }
    {
      name = "cuint___cuint_0.2.2.tgz";
      path = fetchurl {
        name = "cuint___cuint_0.2.2.tgz";
        url  = "https://registry.yarnpkg.com/cuint/-/cuint-0.2.2.tgz";
        sha1 = "408086d409550c2631155619e9fa7bcadc3b991b";
      };
    }
    {
      name = "d___d_1.0.1.tgz";
      path = fetchurl {
        name = "d___d_1.0.1.tgz";
        url  = "https://registry.yarnpkg.com/d/-/d-1.0.1.tgz";
        sha1 = "8698095372d58dbee346ffd0c7093f99f8f9eb5a";
      };
    }
    {
      name = "debug___debug_2.6.9.tgz";
      path = fetchurl {
        name = "debug___debug_2.6.9.tgz";
        url  = "https://registry.yarnpkg.com/debug/-/debug-2.6.9.tgz";
        sha1 = "5d128515df134ff327e90a4c93f4e077a536341f";
      };
    }
    {
      name = "decamelize___decamelize_1.2.0.tgz";
      path = fetchurl {
        name = "decamelize___decamelize_1.2.0.tgz";
        url  = "https://registry.yarnpkg.com/decamelize/-/decamelize-1.2.0.tgz";
        sha1 = "f6534d15148269b20352e7bee26f501f9a191290";
      };
    }
    {
      name = "delayed_stream___delayed_stream_1.0.0.tgz";
      path = fetchurl {
        name = "delayed_stream___delayed_stream_1.0.0.tgz";
        url  = "https://registry.yarnpkg.com/delayed-stream/-/delayed-stream-1.0.0.tgz";
        sha1 = "df3ae199acadfb7d440aaae0b29e2272b24ec619";
      };
    }
    {
      name = "elliptic___elliptic_6.5.4.tgz";
      path = fetchurl {
        name = "elliptic___elliptic_6.5.4.tgz";
        url  = "https://registry.yarnpkg.com/elliptic/-/elliptic-6.5.4.tgz";
        sha1 = "da37cebd31e79a1367e941b592ed1fbebd58abbb";
      };
    }
    {
      name = "emoji_regex___emoji_regex_8.0.0.tgz";
      path = fetchurl {
        name = "emoji_regex___emoji_regex_8.0.0.tgz";
        url  = "https://registry.yarnpkg.com/emoji-regex/-/emoji-regex-8.0.0.tgz";
        sha1 = "e818fd69ce5ccfcb404594f842963bf53164cc37";
      };
    }
    {
      name = "es5_ext___es5_ext_0.10.53.tgz";
      path = fetchurl {
        name = "es5_ext___es5_ext_0.10.53.tgz";
        url  = "https://registry.yarnpkg.com/es5-ext/-/es5-ext-0.10.53.tgz";
        sha1 = "93c5a3acfdbef275220ad72644ad02ee18368de1";
      };
    }
    {
      name = "es6_iterator___es6_iterator_2.0.3.tgz";
      path = fetchurl {
        name = "es6_iterator___es6_iterator_2.0.3.tgz";
        url  = "https://registry.yarnpkg.com/es6-iterator/-/es6-iterator-2.0.3.tgz";
        sha1 = "a7de889141a05a94b0854403b2d0a0fbfa98f3b7";
      };
    }
    {
      name = "es6_symbol___es6_symbol_3.1.3.tgz";
      path = fetchurl {
        name = "es6_symbol___es6_symbol_3.1.3.tgz";
        url  = "https://registry.yarnpkg.com/es6-symbol/-/es6-symbol-3.1.3.tgz";
        sha1 = "bad5d3c1bcdac28269f4cb331e431c78ac705d18";
      };
    }
    {
      name = "eventemitter3___eventemitter3_4.0.7.tgz";
      path = fetchurl {
        name = "eventemitter3___eventemitter3_4.0.7.tgz";
        url  = "https://registry.yarnpkg.com/eventemitter3/-/eventemitter3-4.0.7.tgz";
        sha1 = "2de9b68f6528d5644ef5c59526a1b4a07306169f";
      };
    }
    {
      name = "ext___ext_1.4.0.tgz";
      path = fetchurl {
        name = "ext___ext_1.4.0.tgz";
        url  = "https://registry.yarnpkg.com/ext/-/ext-1.4.0.tgz";
        sha1 = "89ae7a07158f79d35517882904324077e4379244";
      };
    }
    {
      name = "filter_console___filter_console_0.1.1.tgz";
      path = fetchurl {
        name = "filter_console___filter_console_0.1.1.tgz";
        url  = "https://registry.yarnpkg.com/filter-console/-/filter-console-0.1.1.tgz";
        sha1 = "6242be28982bba7415bcc6db74a79f4a294fa67c";
      };
    }
    {
      name = "find_up___find_up_4.1.0.tgz";
      path = fetchurl {
        name = "find_up___find_up_4.1.0.tgz";
        url  = "https://registry.yarnpkg.com/find-up/-/find-up-4.1.0.tgz";
        sha1 = "97afe7d6cdc0bc5928584b7c8d7b16e8a9aa5d19";
      };
    }
    {
      name = "form_data___form_data_3.0.1.tgz";
      path = fetchurl {
        name = "form_data___form_data_3.0.1.tgz";
        url  = "https://registry.yarnpkg.com/form-data/-/form-data-3.0.1.tgz";
        sha1 = "ebd53791b78356a99af9a300d4282c4d5eb9755f";
      };
    }
    {
      name = "get_caller_file___get_caller_file_2.0.5.tgz";
      path = fetchurl {
        name = "get_caller_file___get_caller_file_2.0.5.tgz";
        url  = "https://registry.yarnpkg.com/get-caller-file/-/get-caller-file-2.0.5.tgz";
        sha1 = "4f94412a82db32f36e3b0b9741f8a97feb031f7e";
      };
    }
    {
      name = "hash_base___hash_base_3.1.0.tgz";
      path = fetchurl {
        name = "hash_base___hash_base_3.1.0.tgz";
        url  = "https://registry.yarnpkg.com/hash-base/-/hash-base-3.1.0.tgz";
        sha1 = "55c381d9e06e1d2997a883b4a3fddfe7f0d3af33";
      };
    }
    {
      name = "hash.js___hash.js_1.1.7.tgz";
      path = fetchurl {
        name = "hash.js___hash.js_1.1.7.tgz";
        url  = "https://registry.yarnpkg.com/hash.js/-/hash.js-1.1.7.tgz";
        sha1 = "0babca538e8d4ee4a0f8988d68866537a003cf42";
      };
    }
    {
      name = "hmac_drbg___hmac_drbg_1.0.1.tgz";
      path = fetchurl {
        name = "hmac_drbg___hmac_drbg_1.0.1.tgz";
        url  = "https://registry.yarnpkg.com/hmac-drbg/-/hmac-drbg-1.0.1.tgz";
        sha1 = "d2745701025a6c775a6c545793ed502fc0c649a1";
      };
    }
    {
      name = "inherits___inherits_2.0.4.tgz";
      path = fetchurl {
        name = "inherits___inherits_2.0.4.tgz";
        url  = "https://registry.yarnpkg.com/inherits/-/inherits-2.0.4.tgz";
        sha1 = "0fa2c64f932917c3433a0ded55363aae37416b7c";
      };
    }
    {
      name = "ip_regex___ip_regex_4.3.0.tgz";
      path = fetchurl {
        name = "ip_regex___ip_regex_4.3.0.tgz";
        url  = "https://registry.yarnpkg.com/ip-regex/-/ip-regex-4.3.0.tgz";
        sha1 = "687275ab0f57fa76978ff8f4dddc8a23d5990db5";
      };
    }
    {
      name = "is_fullwidth_code_point___is_fullwidth_code_point_3.0.0.tgz";
      path = fetchurl {
        name = "is_fullwidth_code_point___is_fullwidth_code_point_3.0.0.tgz";
        url  = "https://registry.yarnpkg.com/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz";
        sha1 = "f116f8064fe90b3f7844a38997c0b75051269f1d";
      };
    }
    {
      name = "is_typedarray___is_typedarray_1.0.0.tgz";
      path = fetchurl {
        name = "is_typedarray___is_typedarray_1.0.0.tgz";
        url  = "https://registry.yarnpkg.com/is-typedarray/-/is-typedarray-1.0.0.tgz";
        sha1 = "e479c80858df0c1b11ddda6940f96011fcda4a9a";
      };
    }
    {
      name = "js_sha3___js_sha3_0.8.0.tgz";
      path = fetchurl {
        name = "js_sha3___js_sha3_0.8.0.tgz";
        url  = "https://registry.yarnpkg.com/js-sha3/-/js-sha3-0.8.0.tgz";
        sha1 = "b9b7a5da73afad7dedd0f8c463954cbde6818840";
      };
    }
    {
      name = "locate_path___locate_path_5.0.0.tgz";
      path = fetchurl {
        name = "locate_path___locate_path_5.0.0.tgz";
        url  = "https://registry.yarnpkg.com/locate-path/-/locate-path-5.0.0.tgz";
        sha1 = "1afba396afd676a6d42504d0a67a3a7eb9f62aa0";
      };
    }
    {
      name = "md5.js___md5.js_1.3.5.tgz";
      path = fetchurl {
        name = "md5.js___md5.js_1.3.5.tgz";
        url  = "https://registry.yarnpkg.com/md5.js/-/md5.js-1.3.5.tgz";
        sha1 = "b5d07b8e3216e3e27cd728d72f70d1e6a342005f";
      };
    }
    {
      name = "mime_db___mime_db_1.47.0.tgz";
      path = fetchurl {
        name = "mime_db___mime_db_1.47.0.tgz";
        url  = "https://registry.yarnpkg.com/mime-db/-/mime-db-1.47.0.tgz";
        sha1 = "8cb313e59965d3c05cfbf898915a267af46a335c";
      };
    }
    {
      name = "mime_types___mime_types_2.1.30.tgz";
      path = fetchurl {
        name = "mime_types___mime_types_2.1.30.tgz";
        url  = "https://registry.yarnpkg.com/mime-types/-/mime-types-2.1.30.tgz";
        sha1 = "6e7be8b4c479825f85ed6326695db73f9305d62d";
      };
    }
    {
      name = "minimalistic_assert___minimalistic_assert_1.0.1.tgz";
      path = fetchurl {
        name = "minimalistic_assert___minimalistic_assert_1.0.1.tgz";
        url  = "https://registry.yarnpkg.com/minimalistic-assert/-/minimalistic-assert-1.0.1.tgz";
        sha1 = "2e194de044626d4a10e7f7fbc00ce73e83e4d5c7";
      };
    }
    {
      name = "minimalistic_crypto_utils___minimalistic_crypto_utils_1.0.1.tgz";
      path = fetchurl {
        name = "minimalistic_crypto_utils___minimalistic_crypto_utils_1.0.1.tgz";
        url  = "https://registry.yarnpkg.com/minimalistic-crypto-utils/-/minimalistic-crypto-utils-1.0.1.tgz";
        sha1 = "f6c00c1c0b082246e5c4d99dfb8c7c083b2b582a";
      };
    }
    {
      name = "ms___ms_2.0.0.tgz";
      path = fetchurl {
        name = "ms___ms_2.0.0.tgz";
        url  = "https://registry.yarnpkg.com/ms/-/ms-2.0.0.tgz";
        sha1 = "5608aeadfc00be6c2901df5f9861788de0d597c8";
      };
    }
    {
      name = "next_tick___next_tick_1.0.0.tgz";
      path = fetchurl {
        name = "next_tick___next_tick_1.0.0.tgz";
        url  = "https://registry.yarnpkg.com/next-tick/-/next-tick-1.0.0.tgz";
        sha1 = "ca86d1fe8828169b0120208e3dc8424b9db8342c";
      };
    }
    {
      name = "node_fetch___node_fetch_2.6.1.tgz";
      path = fetchurl {
        name = "node_fetch___node_fetch_2.6.1.tgz";
        url  = "https://registry.yarnpkg.com/node-fetch/-/node-fetch-2.6.1.tgz";
        sha1 = "045bd323631f76ed2e2b55573394416b639a0052";
      };
    }
    {
      name = "node_gyp_build___node_gyp_build_4.2.3.tgz";
      path = fetchurl {
        name = "node_gyp_build___node_gyp_build_4.2.3.tgz";
        url  = "https://registry.yarnpkg.com/node-gyp-build/-/node-gyp-build-4.2.3.tgz";
        sha1 = "ce6277f853835f718829efb47db20f3e4d9c4739";
      };
    }
    {
      name = "p_limit___p_limit_2.3.0.tgz";
      path = fetchurl {
        name = "p_limit___p_limit_2.3.0.tgz";
        url  = "https://registry.yarnpkg.com/p-limit/-/p-limit-2.3.0.tgz";
        sha1 = "3dd33c647a214fdfffd835933eb086da0dc21db1";
      };
    }
    {
      name = "p_locate___p_locate_4.1.0.tgz";
      path = fetchurl {
        name = "p_locate___p_locate_4.1.0.tgz";
        url  = "https://registry.yarnpkg.com/p-locate/-/p-locate-4.1.0.tgz";
        sha1 = "a3428bb7088b3a60292f66919278b7c297ad4f07";
      };
    }
    {
      name = "p_try___p_try_2.2.0.tgz";
      path = fetchurl {
        name = "p_try___p_try_2.2.0.tgz";
        url  = "https://registry.yarnpkg.com/p-try/-/p-try-2.2.0.tgz";
        sha1 = "cb2868540e313d61de58fafbe35ce9004d5540e6";
      };
    }
    {
      name = "path_exists___path_exists_4.0.0.tgz";
      path = fetchurl {
        name = "path_exists___path_exists_4.0.0.tgz";
        url  = "https://registry.yarnpkg.com/path-exists/-/path-exists-4.0.0.tgz";
        sha1 = "513bdbe2d3b95d7762e8c1137efa195c6c61b5b3";
      };
    }
    {
      name = "prettier___prettier_2.2.1.tgz";
      path = fetchurl {
        name = "prettier___prettier_2.2.1.tgz";
        url  = "https://registry.yarnpkg.com/prettier/-/prettier-2.2.1.tgz";
        sha1 = "795a1a78dd52f073da0cd42b21f9c91381923ff5";
      };
    }
    {
      name = "readable_stream___readable_stream_3.6.0.tgz";
      path = fetchurl {
        name = "readable_stream___readable_stream_3.6.0.tgz";
        url  = "https://registry.yarnpkg.com/readable-stream/-/readable-stream-3.6.0.tgz";
        sha1 = "337bbda3adc0706bd3e024426a286d4b4b2c9198";
      };
    }
    {
      name = "regenerator_runtime___regenerator_runtime_0.13.7.tgz";
      path = fetchurl {
        name = "regenerator_runtime___regenerator_runtime_0.13.7.tgz";
        url  = "https://registry.yarnpkg.com/regenerator-runtime/-/regenerator-runtime-0.13.7.tgz";
        sha1 = "cac2dacc8a1ea675feaabaeb8ae833898ae46f55";
      };
    }
    {
      name = "require_directory___require_directory_2.1.1.tgz";
      path = fetchurl {
        name = "require_directory___require_directory_2.1.1.tgz";
        url  = "https://registry.yarnpkg.com/require-directory/-/require-directory-2.1.1.tgz";
        sha1 = "8c64ad5fd30dab1c976e2344ffe7f792a6a6df42";
      };
    }
    {
      name = "require_main_filename___require_main_filename_2.0.0.tgz";
      path = fetchurl {
        name = "require_main_filename___require_main_filename_2.0.0.tgz";
        url  = "https://registry.yarnpkg.com/require-main-filename/-/require-main-filename-2.0.0.tgz";
        sha1 = "d0b329ecc7cc0f61649f62215be69af54aa8989b";
      };
    }
    {
      name = "ripemd160___ripemd160_2.0.2.tgz";
      path = fetchurl {
        name = "ripemd160___ripemd160_2.0.2.tgz";
        url  = "https://registry.yarnpkg.com/ripemd160/-/ripemd160-2.0.2.tgz";
        sha1 = "a1c1a6f624751577ba5d07914cbc92850585890c";
      };
    }
    {
      name = "rxjs___rxjs_6.6.7.tgz";
      path = fetchurl {
        name = "rxjs___rxjs_6.6.7.tgz";
        url  = "https://registry.yarnpkg.com/rxjs/-/rxjs-6.6.7.tgz";
        sha1 = "90ac018acabf491bf65044235d5863c4dab804c9";
      };
    }
    {
      name = "safe_buffer___safe_buffer_5.2.1.tgz";
      path = fetchurl {
        name = "safe_buffer___safe_buffer_5.2.1.tgz";
        url  = "https://registry.yarnpkg.com/safe-buffer/-/safe-buffer-5.2.1.tgz";
        sha1 = "1eaf9fa9bdb1fdd4ec75f58f9cdb4e6b7827eec6";
      };
    }
    {
      name = "scryptsy___scryptsy_2.1.0.tgz";
      path = fetchurl {
        name = "scryptsy___scryptsy_2.1.0.tgz";
        url  = "https://registry.yarnpkg.com/scryptsy/-/scryptsy-2.1.0.tgz";
        sha1 = "8d1e8d0c025b58fdd25b6fa9a0dc905ee8faa790";
      };
    }
    {
      name = "set_blocking___set_blocking_2.0.0.tgz";
      path = fetchurl {
        name = "set_blocking___set_blocking_2.0.0.tgz";
        url  = "https://registry.yarnpkg.com/set-blocking/-/set-blocking-2.0.0.tgz";
        sha1 = "045f9782d011ae9a6803ddd382b24392b3d890f7";
      };
    }
    {
      name = "sha.js___sha.js_2.4.11.tgz";
      path = fetchurl {
        name = "sha.js___sha.js_2.4.11.tgz";
        url  = "https://registry.yarnpkg.com/sha.js/-/sha.js-2.4.11.tgz";
        sha1 = "37a5cf0b81ecbc6943de109ba2960d1b26584ae7";
      };
    }
    {
      name = "string_width___string_width_4.2.0.tgz";
      path = fetchurl {
        name = "string_width___string_width_4.2.0.tgz";
        url  = "https://registry.yarnpkg.com/string-width/-/string-width-4.2.0.tgz";
        sha1 = "952182c46cc7b2c313d1596e623992bd163b72b5";
      };
    }
    {
      name = "string_decoder___string_decoder_1.3.0.tgz";
      path = fetchurl {
        name = "string_decoder___string_decoder_1.3.0.tgz";
        url  = "https://registry.yarnpkg.com/string_decoder/-/string_decoder-1.3.0.tgz";
        sha1 = "42f114594a46cf1a8e30b0a84f56c78c3edac21e";
      };
    }
    {
      name = "strip_ansi___strip_ansi_6.0.0.tgz";
      path = fetchurl {
        name = "strip_ansi___strip_ansi_6.0.0.tgz";
        url  = "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-6.0.0.tgz";
        sha1 = "0b1571dd7669ccd4f3e06e14ef1eed26225ae532";
      };
    }
    {
      name = "tslib___tslib_1.14.1.tgz";
      path = fetchurl {
        name = "tslib___tslib_1.14.1.tgz";
        url  = "https://registry.yarnpkg.com/tslib/-/tslib-1.14.1.tgz";
        sha1 = "cf2d38bdc34a134bcaf1091c41f6619e2f672d00";
      };
    }
    {
      name = "tweetnacl___tweetnacl_1.0.3.tgz";
      path = fetchurl {
        name = "tweetnacl___tweetnacl_1.0.3.tgz";
        url  = "https://registry.yarnpkg.com/tweetnacl/-/tweetnacl-1.0.3.tgz";
        sha1 = "ac0af71680458d8a6378d0d0d050ab1407d35596";
      };
    }
    {
      name = "type___type_1.2.0.tgz";
      path = fetchurl {
        name = "type___type_1.2.0.tgz";
        url  = "https://registry.yarnpkg.com/type/-/type-1.2.0.tgz";
        sha1 = "848dd7698dafa3e54a6c479e759c4bc3f18847a0";
      };
    }
    {
      name = "type___type_2.5.0.tgz";
      path = fetchurl {
        name = "type___type_2.5.0.tgz";
        url  = "https://registry.yarnpkg.com/type/-/type-2.5.0.tgz";
        sha1 = "0a2e78c2e77907b252abe5f298c1b01c63f0db3d";
      };
    }
    {
      name = "typedarray_to_buffer___typedarray_to_buffer_3.1.5.tgz";
      path = fetchurl {
        name = "typedarray_to_buffer___typedarray_to_buffer_3.1.5.tgz";
        url  = "https://registry.yarnpkg.com/typedarray-to-buffer/-/typedarray-to-buffer-3.1.5.tgz";
        sha1 = "a97ee7a9ff42691b9f783ff1bc5112fe3fca9080";
      };
    }
    {
      name = "typescript___typescript_4.1.5.tgz";
      path = fetchurl {
        name = "typescript___typescript_4.1.5.tgz";
        url  = "https://registry.yarnpkg.com/typescript/-/typescript-4.1.5.tgz";
        sha1 = "123a3b214aaff3be32926f0d8f1f6e704eb89a72";
      };
    }
    {
      name = "utf_8_validate___utf_8_validate_5.0.5.tgz";
      path = fetchurl {
        name = "utf_8_validate___utf_8_validate_5.0.5.tgz";
        url  = "https://registry.yarnpkg.com/utf-8-validate/-/utf-8-validate-5.0.5.tgz";
        sha1 = "dd32c2e82c72002dc9f02eb67ba6761f43456ca1";
      };
    }
    {
      name = "util_deprecate___util_deprecate_1.0.2.tgz";
      path = fetchurl {
        name = "util_deprecate___util_deprecate_1.0.2.tgz";
        url  = "https://registry.yarnpkg.com/util-deprecate/-/util-deprecate-1.0.2.tgz";
        sha1 = "450d4dc9fa70de732762fbd2d4a28981419a0ccf";
      };
    }
    {
      name = "websocket___websocket_1.0.34.tgz";
      path = fetchurl {
        name = "websocket___websocket_1.0.34.tgz";
        url  = "https://registry.yarnpkg.com/websocket/-/websocket-1.0.34.tgz";
        sha1 = "2bdc2602c08bf2c82253b730655c0ef7dcab3111";
      };
    }
    {
      name = "which_module___which_module_2.0.0.tgz";
      path = fetchurl {
        name = "which_module___which_module_2.0.0.tgz";
        url  = "https://registry.yarnpkg.com/which-module/-/which-module-2.0.0.tgz";
        sha1 = "d9ef07dce77b9902b8a3a8fa4b31c3e3f7e6e87a";
      };
    }
    {
      name = "wrap_ansi___wrap_ansi_6.2.0.tgz";
      path = fetchurl {
        name = "wrap_ansi___wrap_ansi_6.2.0.tgz";
        url  = "https://registry.yarnpkg.com/wrap-ansi/-/wrap-ansi-6.2.0.tgz";
        sha1 = "e9393ba07102e6c91a3b221478f0257cd2856e53";
      };
    }
    {
      name = "xxhashjs___xxhashjs_0.2.2.tgz";
      path = fetchurl {
        name = "xxhashjs___xxhashjs_0.2.2.tgz";
        url  = "https://registry.yarnpkg.com/xxhashjs/-/xxhashjs-0.2.2.tgz";
        sha1 = "8a6251567621a1c46a5ae204da0249c7f8caa9d8";
      };
    }
    {
      name = "y18n___y18n_4.0.1.tgz";
      path = fetchurl {
        name = "y18n___y18n_4.0.1.tgz";
        url  = "https://registry.yarnpkg.com/y18n/-/y18n-4.0.1.tgz";
        sha1 = "8db2b83c31c5d75099bb890b23f3094891e247d4";
      };
    }
    {
      name = "yaeti___yaeti_0.0.6.tgz";
      path = fetchurl {
        name = "yaeti___yaeti_0.0.6.tgz";
        url  = "https://registry.yarnpkg.com/yaeti/-/yaeti-0.0.6.tgz";
        sha1 = "f26f484d72684cf42bedfb76970aa1608fbf9577";
      };
    }
    {
      name = "yargs_parser___yargs_parser_18.1.3.tgz";
      path = fetchurl {
        name = "yargs_parser___yargs_parser_18.1.3.tgz";
        url  = "https://registry.yarnpkg.com/yargs-parser/-/yargs-parser-18.1.3.tgz";
        sha1 = "be68c4975c6b2abf469236b0c870362fab09a7b0";
      };
    }
    {
      name = "yargs___yargs_15.4.1.tgz";
      path = fetchurl {
        name = "yargs___yargs_15.4.1.tgz";
        url  = "https://registry.yarnpkg.com/yargs/-/yargs-15.4.1.tgz";
        sha1 = "0d87a16de01aee9d8bec2bfbf74f67851730f4f8";
      };
    }
    {
      name = "yarn___yarn_1.22.10.tgz";
      path = fetchurl {
        name = "yarn___yarn_1.22.10.tgz";
        url  = "https://registry.yarnpkg.com/yarn/-/yarn-1.22.10.tgz";
        sha1 = "c99daa06257c80f8fa2c3f1490724e394c26b18c";
      };
    }
  ];
}
