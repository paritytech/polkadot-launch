import { startNode, startCollator } from './spawn';
import { connect, follow, registerParachain } from './rpc';

let config = require("../config.json");

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function main() {

	if (!config.relaychain || !config.parachains) {
		console.log("Bad Config");
		return
	}

	const spec = config.relaychain.spec;

	// for (const node of config.relaychain.nodes) {
	// 	const bin = "./" + config.relaychain.bin;
	// 	const { name, wsPort, port } = node;
	// 	// Show Node output
	// 	const show = false;
	// 	startNode(bin, name, wsPort, port, spec, show);
	// 	console.log(`Launched ${name}`);
	// 	await sleep(5000);
	// 	const api = await connect(wsPort);
	// 	await registerParachain(api, 200, )

	// 	// follow(name, api);
	// 	// console.log(name, " Peer Id", await api.rpc.system.localPeerId())


	// 	break;
	// }


	for (const parachain of config.parachains) {
		const { id, wsPort, port } = parachain;
		const bin = "./" + parachain.bin;
		// Show Node output
		const show = true;
		startCollator(bin, id, wsPort, port, spec, show)

		await sleep(5000);
		const api = await connect(wsPort);
		//let header = await getHeader(api);
	}



	console.log("HI Shawn")
}

main();
