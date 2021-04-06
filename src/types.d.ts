export interface LaunchConfig {
	blockade?: boolean;
	relaychain: RelayChainConfig;
	parachains: ParachainConfig[];
	simpleParachains: SimpleParachainConfig[];
	hrmpChannels: HrmpChannelsConfig[];
	types: any;
	finalization: boolean;
}
export interface ParachainConfig {
	bin: string;
	dockerImage?: string;
	id: string;
	rpcPort: number;
	wsPort: number;
	port: number;
	balance: string;
	flags: string[];
	chain?: string;
}
export interface SimpleParachainConfig {
	bin: string;
	dockerImage?: string;
	id: string;
	port: string;
	balance: string;
}
export interface HrmpChannelsConfig {
	sender: number;
	recipient: number;
	maxCapacity: number;
	maxMessageSize: number;
}
export interface RelayChainConfig {
	bin: string;
	dockerImage?: string;
	chain: string;
	nodes: {
		name: string;
		wsPort: number;
		port: number;
		flags?: string[];
	}[];
}

export interface ChainSpec {
	name: string;
	id: string;
	chainType: string;
	bootNodes: string[];
	telemetryEndpoints: null;
	protocolId: string;
	properties: null;
	forkBlocks: null;
	badBlocks: null;
	consensusEngine: null;
	lightSyncState: null;
	genesis: {
		runtime: any; // this can change depending on the versions
		raw: {
			top: {
				[key: string]: string;
			};
		};
	};
}
