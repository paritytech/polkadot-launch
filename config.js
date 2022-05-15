// Collator flags
var flags = ["--force-authoring", "--", "--execution=wasm"];

var config = {
	relaychain: {
		bin: "./bin/polkadot",
		chain: "rococo-local",
		nodes: [
			{
				name: "alice",
				wsPort: 9944,
				port: 30444,
			},
			{
				name: "bob",
				wsPort: 9955,
				port: 30555,
			},
			{
				name: "charlie",
				wsPort: 9966,
				port: 30666,
			},
			{
				name: "dave",
				wsPort: 9977,
				port: 30777,
			},
		],
		genesis: {
			runtime: {
				runtime_genesis_config: {
					configuration: {
						config: {
							validation_upgrade_frequency: 10,
							validation_upgrade_delay: 10,
						},
					},
				},
			},
		},
	},
	parachains: [
		{
			bin: "./bin/polkadot-parachain",
			id: "200",
			balance: "1000000000000000000000",
			nodes: [
				{
					wsPort: 9988,
					port: 31200,
					name: "alice",
					flags,
				},
			],
		},
		{
			bin: "./bin/polkadot-parachain",
			id: "300",
			balance: "1000000000000000000000",
			nodes: [
				{
					wsPort: 9999,
					port: 31300,
					name: "alice",
					flags,
				},
			],
		},
	],
	simpleParachains: [
		{
			bin: "./bin/adder-collator",
			id: "400",
			port: "31400",
			name: "alice",
			balance: "1000000000000000000000",
		},
	],
	hrmpChannels: [
		{
			sender: 200,
			recipient: 300,
			maxCapacity: 8,
			maxMessageSize: 512,
		},
	],
	types: {},
	finalization: false,
};

module.exports = config;
