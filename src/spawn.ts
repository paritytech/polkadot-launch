import {
	spawn,
	ChildProcessWithoutNullStreams,
	execFile as ex,
} from "child_process";
import util from "util";
import fs from "fs";

// This tracks all the processes that we spawn from this file.
// Used to clean up processes when exiting this program.
const p: { [key: string]: ChildProcessWithoutNullStreams } = {};

const execFile = util.promisify(ex);

// Output the chainspec of a node.
export async function generateChainSpec(bin: string, chain: string) {
	return new Promise<void>(function (resolve, reject) {
		let args = ["build-spec", "--chain=" + chain, "--disable-default-bootnode"];

		p["spec"] = spawn(bin, args);
		let spec = fs.createWriteStream(`${chain}.json`);

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
export async function generateChainSpecRaw(bin: string, chain: string) {
	console.log(); // Add a newline in output
	return new Promise<void>(function (resolve, reject) {
		let args = ["build-spec", "--chain=" + chain + ".json", "--raw"];

		p["spec"] = spawn(bin, args);
		let spec = fs.createWriteStream(`${chain}-raw.json`);

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

export async function getParachainIdFromSpec(
	bin: string,
	chain?: string
): Promise<number> {
	const data = await new Promise<string>(function (resolve, reject) {
		let args = ["build-spec"];
		if (chain) {
			args.push("--chain=" + chain);
		}

		let data = "";

		p["spec"] = spawn(bin, args);
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
	port: number,
	spec: string,
	flags?: string[],
	basePath?: string
) {
	// TODO: Make DB directory configurable rather than just `tmp`
	let args = [
		"--chain=" + spec,
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--" + name.toLowerCase(),
	];

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

	p[name] = spawn(bin, args);

	let log = fs.createWriteStream(`${name}.log`);

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
	if (chain) {
		args.push("--chain=" + chain);
	}

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
	id?: string,
	chain?: string
): Promise<string> {
	let args = ["export-genesis-state"];
	if (id) {
		args.push("--parachain-id=" + id);
	}
	if (chain) {
		args.push("--chain=" + chain);
	}

	// wasm files are typically large and `exec` requires us to supply the maximum buffer size in
	// advance. Hopefully, this generous limit will be enough.
	let opts = { maxBuffer: 5 * 1024 * 1024 };
	let { stdout, stderr } = await execFile(bin, args, opts);
	if (stderr) {
		console.error(stderr);
	}
	return stdout.trim();
}

// Start a collator node for a parachain.
export function startCollator(
	bin: string,
	id: string,
	wsPort: number,
	port: number,
	name?: string,
	chain?: string,
	spec?: string,
	flags?: string[],
	basePath?: string,
	skip_id_arg?: boolean
) {
	return new Promise<void>(function (resolve) {
		// TODO: Make DB directory configurable rather than just `tmp`
		let args = [
			"--ws-port=" + wsPort,
			"--port=" + port,
			"--collator",
			"--force-authoring",
		];

		if (basePath) {
			args.push("--base-path=" + basePath);
		} else {
			args.push("--tmp");
		}

		if (name) {
			args.push(`--${name.toLowerCase()}`);
			console.log(`Added --${name.toLowerCase()}`);
		}
		if (!skip_id_arg) {
			args.push("--parachain-id=" + id);
			console.log(`Added --parachain-id=${id}`);
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

		p[wsPort] = spawn(bin, args);

		let log = fs.createWriteStream(`${wsPort}.log`);

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
	spec: string,
	port: string,
	skip_id_arg?: boolean
) {
	return new Promise<void>(function (resolve) {
		let args = [
			"--tmp",
			"--port=" + port,
			"--chain=" + spec,
			"--execution=wasm",
		];

		if (!skip_id_arg) {
			args.push("--parachain-id=" + id);
			console.log(`Added --parachain-id=${id}`);
		}

		p[port] = spawn(bin, args);

		let log = fs.createWriteStream(`${port}.log`);

		p[port].stdout.on("data", function (chunk) {
			let message = chunk.toString();
			log.write(message);
		});
		p[port].stderr.on("data", function (chunk) {
			let message = chunk.toString();
			if (message.substring(21, 50) === "Listening for new connections") {
				resolve();
			}
			log.write(message);
		});
	});
}

// Purge the chain for any node.
// You shouldn't need to use this function since every node starts with `--tmp`
// TODO: Make DB directory configurable rather than just `tmp`
export function purgeChain(bin: string, spec: string) {
	console.log("Purging Chain...");
	let args = ["purge-chain"];

	if (spec) {
		args.push("--chain=" + spec);
	}

	// Avoid prompt to confirm.
	args.push("-y");

	p["purge"] = spawn(bin, args);

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
