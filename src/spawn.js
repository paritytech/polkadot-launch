const p = {};

const { spawn } = require("child_process");
const fs = require('fs');

export function startNode(bin, name, wsPort, port, spec, show) {
	let args = [
		"--chain=" + spec,
		"--tmp",
		"--ws-port=" + wsPort,
		"--port=" + port,
		"--" + name.toLowerCase()
	];

	p[name] = spawn(bin, args);

	p[name].stdout.on('data', function (chunk) {
		let message = chunk.toString();
		console.log(name, message);
	});

	if (show) {
		p[name].stderr.on('data', function (chunk) {
			let message = chunk.toString();
			console.log(name, message);
		});
	}
}

export function generateWasm(bin, id) {
	let wasm = fs.createWriteStream(`${id}.wasm`);

	let outputWasm = spawn(bin, [
		"export-genesis-wasm"
	]);

	outputWasm.stdout.on('data', function (chunk) {
		wasm.write(chunk);
	});
}

export function startCollator(bin, id, wsPort, port, spec, show) {

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
	p[id].stdout.on('data', function (chunk) {
		let message = chunk.toString();
		console.log("P", id, message);
	});

	if (show) {
		p[id].stderr.on('data', function (chunk) {
			let message = chunk.toString();
			console.log("P", id, message);
		});
	}
}
