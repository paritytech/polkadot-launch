const fs = require('fs');

const bufferToHex = buffer => {
	return Array.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
};

export function wasmHex(path) {
	let hex;
	fs.readFile(path, function (err, data) {
		if (err) {
			return console.log(err);
		}
		hex = bufferToHex(data);
	});

	return "0x" + hex;
}
