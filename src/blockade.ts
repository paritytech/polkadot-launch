import { execFile as ex } from "child_process";
import YAML from "yaml";
import fs from "fs/promises";
import util from "util";

import { ParachainConfig, RelayChainConfig, SimpleParachainConfig } from "./types";

const execFile = util.promisify(ex);

export async function generateBlockadeConfig(
    relaychain: RelayChainConfig,
    parachains: ParachainConfig[],
    simpleParachains: SimpleParachainConfig[],
    specFilename: string,
) {
    const containers: any = {};

    if (!relaychain.dockerImage) {
        console.error("Missing docker image config for relaychain nodes");
        process.exit();
    }

    var n = 1;
    for (const node of relaychain.nodes) {
        let args = [
            "--chain=/data/spec.json",
            "--tmp",
            "--ws-port=" + node.wsPort,
            "--port=" + node.port,
            "--" + node.name.toLowerCase(),
        ];

        if (node.flags) {
            args = args.concat(node.flags);
        }

        let config: any = {
            image: relaychain.dockerImage,
            command: args.join(" "),
            expose: [node.port],
            volumes: {
                [`./${specFilename}`]: "/data/spec.json"
            }
        };

        // expose the websockets port on the first container
        if (n == 1) {
            config.ports = { [node.wsPort]: node.wsPort }
            config.command += " --ws-external";
        }

        containers[`relay${n}`] = config;

        n += 1;
    }

    var n = 1;
    for (const parachain of parachains) {
        if (!parachain.dockerImage) {
            console.error("Missing docker image config for parachain: " + parachain.id);
            process.exit();
        }

        let args = [
            "--tmp",
            "--ws-port=" + parachain.wsPort,
            "--port=" + parachain.port,
            "--parachain-id=" + parachain.id,
            "--collator",
            "--",
            "--chain=/data/spec.json"
        ];

        let config: any = {
            image: parachain.dockerImage,
            command: args.join(" "),
            expose: [parachain.port],
            volumes: {
                [`./${specFilename}`]: "/data/spec.json"
            }
        };

        containers[`parachain${n}`] = config;

        n += 1;
    }

    var n = 1;
    for (const simpleParachain of simpleParachains) {
        if (!simpleParachain.dockerImage) {
            console.error("Missing docker image config for simple parachain: " + simpleParachain.id);
            process.exit();
        }

        let args = [
            "--tmp",
            "--parachain-id=" + simpleParachain.id,
            "--port=" + simpleParachain.port,
            "--chain=/data/spec.json",
            "--execution=wasm",
        ];

        let config: any = {
            image: simpleParachain.dockerImage,
            command: args.join(" "),
            expose: [simpleParachain.port],
            volumes: {
                [`./${specFilename}`]: "/data/spec.json"
            }
        };

        containers[`simpleParachain${n}`] = config;

        n += 1;
    }

    const config = {
        containers: containers,
        network: {
            flaky: "30%",
            slow: "300ms 1000ms distribution normal"
        }
    };

    return fs.writeFile("blockade.yaml", YAML.stringify(config));
}

export async function startBlockade() {
    execFile("blockade", ["up"]);
}

export async function stopBlockade() {
    execFile("blockade", ["destroy"]);
}
