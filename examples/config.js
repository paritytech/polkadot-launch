// Collator flags
const flags = ["--", "--execution=wasm"];

const config = {
	relaychain: {
		bin: "/home/jimmychu/remote-builds/polkadot/target/release/polkadot",
		chain: "rococo-local",
		nodes: [
			{
				name: "alice",
				wsPort: 9944,
				rpcPort: 9844,
				port: 30444,
			},
			{
				name: "bob",
				wsPort: 9955,
				rpcPort: 9855,
				port: 30555,
			},
			{
				name: "charlie",
				wsPort: 9966,
				rpcPort: 9866,
				port: 30666,
			},
			// {
			// 	name: "dave",
			// 	wsPort: 9977,
			// 	rpcPort: 9877,
			// 	port: 30777,
			// },
		],
		genesis: {
			runtime: {
				runtime_genesis_config: {
					configuration: {
						config: {
							validation_upgrade_frequency: 1,
							validation_upgrade_delay: 1,
						},
					},
				},
			},
		},
	},
	parachains: [
		{
			bin: "/home/jimmychu/remote-builds/substrate-parachain-template/target/release/parachain-collator",
			id: 200,
			protocolId: "para-first",
			balance: "1000000000000000000000",
			nodes: [
				{
					name: "alice",
					wsPort: 9988,
					rpcPort: 9888,
					port: 31200,
					flags,
				},
		// 		{
		// 			wsPort: 9999,
		// 			rpcPort: 9899,
		// 			port: 31300,
		// 			name: "bob",
		// 			flags,
		// 		},
		// 	],
		},
		{
			bin: "/home/jimmychu/remote-builds/substrate-parachain-template/target/release/parachain-collator",
			id: 300,
			protocolId: "para-second",
			balance: "1000000000000000000000",
			nodes: [
				{
					name: "bob",
					wsPort: 9999,
					rpcPort: 9899,
					port: 31300,
					flags,
				},
			],
		},
	],
	simpleParachains: [
		// {
		// 	bin: "./bin/adder-collator",
		// 	id: "400",
		// 	port: "31400",
		// 	name: "alice",
		// 	balance: "1000000000000000000000",
		// },
	],
	hrmpChannels: [
		// {
		// 	sender: 200,
		// 	recipient: 300,
		// 	maxCapacity: 8,
		// 	maxMessageSize: 512,
		// },
	],
	types: {},
	finalization: false,
};

module.exports = config;
