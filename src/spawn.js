const p = {};

const { spawn } = require("child_process");
const chalk = require('chalk');

let availableColors = [
	chalk.red,
	chalk.green,
	chalk.blue,
	chalk.yellow,
	chalk.cyan,
]

let colorUsed = 0;

export function startNode(bin, name, wsPort, port, spec, show) {
	let args = [
		"--chain=" + spec,
		"--tmp",
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--" + name.toLowerCase()
	];

	p[name] = spawn(bin, args);

	if (show) {
		p[name].stdout.on('data', function (chunk) {
			let message = chunk.toString();
			console.log(name, message);
		});

		p[name].stderr.on('data', function (chunk) {
			let message = chunk.toString();
			console.log(name, message);
		});
	}
}

export function generateWasm(bin, id) {
	const fs = require('fs');
	let wasm = fs.createWriteStream(`${id}.wasm`);
	let outputWasm = spawn(bin, [
		"export-genesis-wasm"
	]);
	outputWasm.stdout.on('data', function (chunk) {
		wasm.write(chunk);
	});
}

export function startCollator(bin, id, wsPort, port, spec, show) {
	// Generate a wasm file for the collator. Used in registration.
	generateWasm(bin, id);

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

	if (show) {
		let color = availableColors[colorUsed % 5];
		colorUsed += 1;

		p[id].stdout.on('data', function (chunk) {
			let message = chunk.toString();
			console.log(color("P", id, message));
		});

		p[id].stderr.on('data', function (chunk) {
			let message = chunk.toString();
			console.log(color("P", id, message));
		});
	}
}


export function purgeChain(bin, spec) {
	console.log("Purging Chain...");
	let args = ["purge-chain"];

	if (spec) {
		args.push("--chain=" + spec);
	}

	args.push("-y");

	let temp = spawn(bin, args);

	temp.stdout.on('data', function (chunk) {
		let message = chunk.toString();
		console.log(message);
	});

	temp.stderr.on('data', function (chunk) {
		let message = chunk.toString();
		console.log(message);
	});
}
