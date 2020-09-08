// This tracks all the processes that we spawn from this file.
// Used to clean up processes when exiting this program.
const p = {};

const { spawn } = require("child_process");
const { resolve, dirname } = require('path');
const chalk = require('chalk');
const fs = require('fs');

// This is a simple tracker to change the output color of different nodes we spawn.
let colorUsed = 0;
let availableColors = [
	chalk.red,
	chalk.green,
	chalk.blue,
	chalk.yellow,
	chalk.cyan,
]

// Spawn a new relay chain node.
// `name` must be `alice`, `bob`, `charlie`, etc... (hardcoded in Substrate).
export function startNode(bin, name, wsPort, port, spec, show) {
	// TODO: Make DB directory configurable rather than just `tmp`
	let args = [
		"--chain=" + spec,
		"--tmp",
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--" + name.toLowerCase()
	];

	p[name] = spawn(bin, args);

	let log = fs.createWriteStream(`${name}.log`)

	p[name].stdout.on('data', function (chunk) {
		let message = chunk.toString();
		log.write(message);
		if (show) {
			console.log(name, message);
		}
	});

	p[name].stderr.on('data', function (chunk) {
		let message = chunk.toString();
		log.write(message);
		if (show) {
			console.log(name, message);
		}
	});
}

// Export the genesis wasm for a parachain.
// Used for registering the parachain on the relay chain.
export function generateWasm(bin, id) {
	let bin_path = dirname(bin);
	let wasm_file = resolve(bin_path, `${id}.wasm`);
	let wasm = fs.createWriteStream(wasm_file);
	let outputWasm = spawn(bin, [
		"export-genesis-wasm"
	]);
	outputWasm.stdout.on('data', function (chunk) {
		wasm.write(chunk);
	});
}

// Start a collator node for a parachain.
export function startCollator(bin, id, wsPort, port, spec, show) {
	// Generate a wasm file for the collator. Used in registration.
	generateWasm(bin, id);

	// TODO: Make DB directory configurable rather than just `tmp`
	let args = [
		"--tmp",
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--parachain-id=" + id,
		"--validator",
		"--",
		"--chain=" + spec
	];

	p[id] = spawn(bin, args);

	let log = fs.createWriteStream(`${id}.log`)

	// Provide each node with a different color output in console.
	let color = availableColors[colorUsed % 5];
	colorUsed += 1;

	p[id].stdout.on('data', function (chunk) {
		let message = chunk.toString();
		log.write(message);
		if (show) {
			console.log(color("P", id, message));
		}
	});

	p[id].stderr.on('data', function (chunk) {
		let message = chunk.toString();
		log.write(message);
		if (show) {
			console.log(color("P", id, message));
		}
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
