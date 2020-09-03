export function checkConfig(config) {
	if (!config.relaychain) {
		console.error("Missing `relaychain` object")
		return false
	}

	if (!config.relaychain.bin) {
		console.error("Missing `relaychain.bin`")
		return false
	}

	if (!config.relaychain.spec) {
		console.error("Missing `relaychain.spec`")
		return false
	}

	if (config.relaychain.nodes.length == 0) {
		console.error("No relaychain nodes defined")
		return false
	}

	if (!config.parachains) {
		console.error("Missing `parachains` object")
		return false
	}

	if (config.parachains.length >= config.relaychain.nodes.length) {
		console.error("Must have more relaychain nodes than parachains.")
		return false
	}

	return true;
}
