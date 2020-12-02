// This tracks all the processes that we spawn from this file.
// Used to clean up processes when exiting this program.
const p = {};

const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const { spawn } = require("child_process");
const fs = require('fs');

// Output the chainspec of a node.
export async function generateChainSpec(bin, chain) {
	return new Promise(function (resolve, reject) {
		let args = [
			"build-spec",
			"--chain=" + chain,
			"--disable-default-bootnode"
		];

		p['spec'] = spawn(bin, args);
		let spec = fs.createWriteStream(`${chain}.json`);

		// `pipe` since it deals with flushing and  we need to guarantee that the data is flushed
		// before we resolve the promise.
		p['spec'].stdout.pipe(spec);

		p['spec'].stderr.pipe(process.stderr)

		p['spec'].on('close', () => {
			resolve();
		});

		p['spec'].on('error', (err) => {
			reject(err);
		});
	})
}

// Output the chainspec of a node using `--raw` from a JSON file.
export async function generateChainSpecRaw(bin, chain) {
	return new Promise(function (resolve, reject) {
		let args = [
			"build-spec",
			"--chain=" + chain + '.json',
			"--raw",
		];

		p['spec'] = spawn(bin, args);
		let spec = fs.createWriteStream(`${chain}-raw.json`);

		// `pipe` since it deals with flushing and  we need to guarantee that the data is flushed
		// before we resolve the promise.
		p['spec'].stdout.pipe(spec)
		p['spec'].stderr.pipe(process.stderr)

		p['spec'].on('close', () => {
			resolve();
		});

		p['spec'].on('error', (err) => {
			reject(err);
		});
	})
}

// Spawn a new relay chain node.
// `name` must be `alice`, `bob`, `charlie`, etc... (hardcoded in Substrate).
export function startNode(bin, name, wsPort, port, spec, flags) {
	// TODO: Make DB directory configurable rather than just `tmp`
	let args = [
		"--chain=" + spec,
		"--tmp",
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--" + name.toLowerCase(),
	];

	if (flags) {
		// Add any additional flags to the CLI
		args = args.concat(flags);
		console.log(`Added ${flags}`);
	}

	p[name] = spawn(bin, args);

	let log = fs.createWriteStream(`${name}.log`)

	p[name].stdout.pipe(log)
	p[name].stderr.pipe(log)
}

// Export the genesis wasm for a parachain and return it as a hex encoded string starting with 0x.
// Used for registering the parachain on the relay chain.
export async function exportGenesisWasm(bin, chain) {
	let args = ["export-genesis-wasm"]
	if (chain) {
		args.push("--chain=" + chain)
	}

	// wasm files are typically large and `exec` requires us to supply the maximum buffer size in
	// advance. Hopefully, this generous limit will be enough.
	let opts = { maxBuffer: 5 * 1024 * 1024 }
	let { stdout, stderr } = await execFile(bin, args, opts)
	if (stderr) {
		console.error(stderr)
	}
	return stdout.trim()
}

/// Export the genesis state aka genesis head.
export async function exportGenesisState(bin, id, chain) {
	let args = [
		"export-genesis-state",
	]
	if (id) {
		args.push("--parachain-id=" + id)
	}
	if (chain) {
		args.push("--chain=" + chain)
	}

	// wasm files are typically large and `exec` requires us to supply the maximum buffer size in
	// advance. Hopefully, this generous limit will be enough.
	let opts = { maxBuffer: 5 * 1024 * 1024 }
	let { stdout, stderr } = await execFile(bin, args, opts)
	if (stderr) {
		console.error(stderr)
	}
	return stdout.trim()
}

// Start a collator node for a parachain.
export function startCollator(bin, id, wsPort, port, chain, spec, flags) {
	// TODO: Make DB directory configurable rather than just `tmp`
	let args = [
		"--tmp",
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--parachain-id=" + id,
		"--validator",
	];

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
		flags_parachain = flags.slice(0, split_index);
		flags_collator = flags.slice(split_index + 1);
	}

	if (flags_parachain) {
		// Add any additional flags to the CLI
		args = args.concat(flags_parachain);
		console.log(`Added ${flags_parachain} to parachain`);
	}

	// Arguments for the relay chain node part of the collator binary.
	args = args.concat([
		"--",
		"--chain=" + spec
	]);

	if (flags_collator) {
		// Add any additional flags to the CLI
		args = args.concat(flags_collator);
		console.log(`Added ${flags_collator} to collator`);
	}

	p[id] = spawn(bin, args);

	let log = fs.createWriteStream(`${id}.log`)

	p[id].stdout.pipe(log)
	p[id].stderr.pipe(log)
}

export function startSimpleCollator(bin, id, spec, port) {
	let args = [
		"--tmp",
		"--parachain-id=" + id,
		"--port=" + port,
		"--chain=" + spec,
		"--execution=wasm"
	];

	p[id] = spawn(bin, args);

	let log = fs.createWriteStream(`${id}.log`)

	p[id].stdout.on('data', function (chunk) {
		let message = chunk.toString();
		log.write(message);
	});

	p[id].stderr.on('data', function (chunk) {
		let message = chunk.toString();
		log.write(message);
	});
}

// Purge the chain for any node.
// You shouldn't need to use this function since every node starts with `--tmp`
// TODO: Make DB directory configurable rather than just `tmp`
export function purgeChain(bin, spec) {
	console.log("Purging Chain...");
	let args = ["purge-chain"];

	if (spec) {
		args.push("--chain=" + spec);
	}

	// Avoid prompt to confirm.
	args.push("-y");

	p['purge'] = spawn(bin, args);

	p['purge'].stdout.on('data', function (chunk) {
		let message = chunk.toString();
		console.log(message);
	});

	p['purge'].stderr.on('data', function (chunk) {
		let message = chunk.toString();
		console.log(message);
	});
}

// Kill all processes spawned and tracked by this file.
export function killAll() {
	console.log("\nKilling all processes...")
	for (const key of Object.keys(p)) {
		p[key].kill();
	}
}
