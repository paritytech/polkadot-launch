const fs = require('fs');

const bufferToHex = buffer => {
	return Array.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
};

// Read the wasm file and convert it to its hex format for extrinsic submission.
export function wasmHex(path) {
	let buffer = fs.readFileSync(path);
	let hex = bufferToHex(buffer);
	return "0x" + hex;
}
