import {
	spawn,
	ChildProcessWithoutNullStreams,
	execFile as ex,
} from "child_process";
import util from "util";
import fs from "fs";
import path from "path";
import { CollatorOptions, RunConfig } from "./types";

// This tracks all the processes that we spawn from this file.
// Used to clean up processes when exiting this program.
const p: { [key: string]: ChildProcessWithoutNullStreams } = {};

const execFile = util.promisify(ex);

// Output the chainspec of a node.
export async function generateChainSpec(bin: string, chainType: string, outPath: string, runConfig: RunConfig) {
	return new Promise<void>(function (resolve, reject) {
		let args = ["build-spec", `--chain=${chainType}`, "--disable-default-bootnode"];
		p["spec"] = spawnCmd(bin, args, runConfig.verbose);
		let spec = fs.createWriteStream(`${runConfig.out}/outPath`);

		// `pipe` since it deals with flushing and  we need to guarantee that the data is flushed
		// before we resolve the promise.
		p["spec"].stdout.pipe(spec);

		p["spec"].stderr.pipe(process.stderr);

		p["spec"].on("close", () => {
			resolve();
		});

		p["spec"].on("error", (err) => {
			reject(err);
		});
	});
}

// Output the chainspec of a node using `--raw` from a JSON file.
interface GenerateChainSpecRawIn {
	type: 'path' | 'chainType',
	chain: string
};

export async function generateChainSpecRaw(
	bin: string,
	chainIn: GenerateChainSpecRawIn,
	chainOut: string,
	runConfig: RunConfig
) {
	console.log(); // Add a newline in output
	return new Promise<void>(function (resolve, reject) {
		const rsChainIn = chainIn.type === 'chainType' ? `${chainIn.chain}.json` : chainIn.chain;
		let args = ["build-spec", `--chain=${rsChainIn}`, "--raw"];
		p["spec"] = spawnCmd(bin, args, runConfig.verbose);
		let spec = fs.createWriteStream(chainOut);

		// `pipe` since it deals with flushing and we need to guarantee that the data is flushed
		// before we resolve the promise.
		p["spec"].stdout.pipe(spec);
		p["spec"].stderr.pipe(process.stderr);

		p["spec"].on("close", () => {
			resolve();
		});

		p["spec"].on("error", (err) => {
			reject(err);
		});
	});
}

export async function getParachainIdFromSpec(
	bin: string,
	chain: string,
	runConfig: RunConfig,
): Promise<number> {
	const data = await new Promise<string>(function (resolve, reject) {
		let args = ["build-spec"];
		if (chain) {
			args.push("--chain=" + chain);
		}

		let data = "";

		p["spec"] = spawnCmd(bin, args, runConfig.verbose);
		p["spec"].stdout.on("data", (chunk) => {
			data += chunk;
		});

		p["spec"].stderr.pipe(process.stderr);

		p["spec"].on("close", () => {
			resolve(data);
		});

		p["spec"].on("error", (err) => {
			reject(err);
		});
	});

	const spec = JSON.parse(data);
	return spec.para_id;
}

// Spawn a new relay chain node.
// `name` must be `alice`, `bob`, `charlie`, etc... (hardcoded in Substrate).
export function startNode(
	bin: string,
	name: string,
	wsPort: number,
	rpcPort: number | undefined,
	port: number,
	nodeKey: string,
	spec: string,
	flags: string[],
	basePath: string | undefined,
	runConfig: RunConfig
) {
	// TODO: Make DB directory configurable rather than just `tmp`
	let args = [
		"--chain=" + spec,
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--node-key=" + nodeKey,
		"--" + name.toLowerCase(),
	];
	if (rpcPort) {
		args.push("--rpc-port=" + rpcPort);
	}

	if (basePath) {
		args.push("--base-path=" + basePath);
	} else {
		args.push("--tmp");
	}

	if (flags) {
		// Add any additional flags to the CLI
		args = args.concat(flags);
		console.log(`Added ${flags}`);
	}

	p[name] = spawnCmd(bin, args, runConfig.verbose);
	const logPath = path.resolve(runConfig.out, 'logs', `${name}.log`)
	const log = fs.createWriteStream(logPath);

	p[name].stdout.pipe(log);
	p[name].stderr.pipe(log);
}

// Export the genesis wasm for a parachain and return it as a hex encoded string starting with 0x.
// Used for registering the parachain on the relay chain.
export async function exportGenesisWasm(
	bin: string,
	chain?: string
): Promise<string> {
	let args = ["export-genesis-wasm"];
	chain && args.push("--chain=" + chain);

	// wasm files are typically large and `exec` requires us to supply the maximum buffer size in
	// advance. Hopefully, this generous limit will be enough.
	let opts = { maxBuffer: 10 * 1024 * 1024 };
	let { stdout, stderr } = await execFile(bin, args, opts);
	if (stderr) {
		console.error(stderr);
	}
	return stdout.trim();
}

/// Export the genesis state aka genesis head.
export async function exportGenesisState(
	bin: string,
	chain?: string,
): Promise<string> {
	let args = ["export-genesis-state"];
	chain && args.push("--chain=" + chain);

	// wasm files are typically large and `exec` requires us to supply the maximum buffer size in
	// advance. Hopefully, this generous limit will be enough.
	let opts = { maxBuffer: 5 * 1024 * 1024 };
	let { stdout, stderr } = await execFile(bin, args, opts);
	stderr && console.error(stderr);
	return stdout.trim();
}

// Start a collator node for a parachain.
export function startCollator(
	bin: string,
	id: string,
	wsPort: number,
	rpcPort: number | undefined,
	port: number,
	options: CollatorOptions,
	runConfig: RunConfig
) {
	return new Promise<void>(function (resolve) {
		// TODO: Make DB directory configurable rather than just `tmp`
		let args = ["--ws-port=" + wsPort, "--port=" + port];
		const {
			basePath,
			name,
			onlyOneParachainNode,
			chain,
			flags,
			spec,
		} = options;

		if (rpcPort) {
			args.push("--rpc-port=" + rpcPort);
			console.log(`Added --rpc-port=" + ${rpcPort}`);
		}
		args.push("--collator");
		basePath ? args.push("--base-path=" + basePath) : args.push("--tmp");

		if (name) {
			args.push(`--${name.toLowerCase()}`);
			console.log(`Added --${name.toLowerCase()}`);
		}
		if (onlyOneParachainNode) {
			args.push("--force-authoring");
			console.log(`Added --force-authoring`);
		}
		if (chain) {
			args.push("--chain=" + chain);
			console.log(`Added --chain=${chain}`);
		}

		let flags_collator = null;
		let flags_parachain = null;
		let split_index = flags ? flags.findIndex((value) => value == "--") : -1;

		if (split_index < 0) {
			flags_parachain = flags;
		} else {
			flags_parachain = flags ? flags.slice(0, split_index) : null;
			flags_collator = flags ? flags.slice(split_index + 1) : null;
		}

		if (flags_parachain) {
			// Add any additional flags to the CLI
			args = args.concat(flags_parachain);
			console.log(`Added ${flags_parachain} to parachain`);
		}

		// Arguments for the relay chain node part of the collator binary.
		args = args.concat(["--", "--chain=" + spec]);

		if (flags_collator) {
			// Add any additional flags to the CLI
			args = args.concat(flags_collator);
			console.log(`Added ${flags_collator} to collator`);
		}

		p[wsPort] = spawnCmd(bin, args, runConfig.verbose);

		const logPath = path.resolve(runConfig.out, 'logs', `${wsPort}.log`)
		const log = fs.createWriteStream(logPath);

		p[wsPort].stdout.pipe(log);
		p[wsPort].stderr.on("data", function (chunk) {
			let message = chunk.toString();
			if (message.includes("Listening for new connections")) {
				resolve();
			}
			log.write(message);
		});
	});
}

export function startSimpleCollator(
	bin: string,
	id: string,
	chainType: string,
	port: string,
	skip_id_arg: boolean,
	runConfig: RunConfig
) {
	return new Promise<void>(function (resolve) {
		let args = [
			"--tmp",
			"--port=" + port,
			"--chain=" + chainType,
			"--execution=wasm",
		];

		if (!skip_id_arg) {
			args.push("--parachain-id=" + id);
			console.log(`Added --parachain-id=${id}`);
		}

		p[port] = spawnCmd(bin, args, runConfig.verbose);

		const logPath = path.resolve(runConfig.out, 'logs', `${port}.log`)
		const log = fs.createWriteStream(logPath);

		p[port].stdout.pipe(log);
		p[port].stderr.on("data", function (chunk) {
			let message = chunk.toString();
			if (message.includes("Listening for new connections")) {
				resolve();
			}
			log.write(message);
		});
	});
}

// Purge the chain for any node.
// You shouldn't need to use this function since every node starts with `--tmp`
// TODO: Make DB directory configurable rather than just `tmp`
export function purgeChain(bin: string, spec: string, runConfig: RunConfig) {
	console.log("Purging Chain...");
	let args = ["purge-chain"];

	if (spec) {
		args.push("--chain=" + spec);
	}

	// Avoid prompt to confirm.
	args.push("-y");

	p["purge"] = spawnCmd(bin, args, runConfig.verbose);

	p["purge"].stdout.on("data", function (chunk) {
		let message = chunk.toString();
		console.log(message);
	});

	p["purge"].stderr.on("data", function (chunk) {
		let message = chunk.toString();
		console.log(message);
	});
}

// Kill all processes spawned and tracked by this file.
export function killAll() {
	console.log("\nKilling all processes...");
	for (const key of Object.keys(p)) {
		p[key].kill();
	}
}

function spawnCmd(cmd: string, args: Array<string>, verbose: number) {
	verbose > 0 && console.debug(`Running cmd: ${cmd} ${args.join(' ')}`);
	return spawn(cmd, args);
}
