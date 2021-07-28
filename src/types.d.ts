export interface LaunchConfig {
	relaychain: RelayChainConfig;
	parachains: ParachainConfig[];
	simpleParachains: SimpleParachainConfig[];
	hrmpChannels: HrmpChannelsConfig[];
	types: any;
	finalization: boolean;
}
export interface ParachainNodeConfig {
	rpcPort: number;
	wsPort: number;
	port: number;
	basePath?: string;
	name?: string;
	flags: string[];
}
export interface ParachainConfig {
	bin: string;
	id?: string;
	balance: string;
	chain?: string;
	nodes: ParachainNodeConfig[];
}
export interface SimpleParachainConfig {
	bin: string;
	id?: string;
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
	chain: string;
	nodes: {
		name: string;
		basePath?: string;
		wsPort: number;
		port: number;
		flags?: string[];
	}[];
	genesis?: JSON;
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

export interface ResolvedParachainConfig extends ParachainConfig {
	resolvedId: string;
}
export interface ResolvedSimpleParachainConfig extends SimpleParachainConfig {
	resolvedId: string;
}
export interface ResolvedLaunchConfig extends LaunchConfig {
	parachains: ResolvedParachainConfig[];
	simpleParachains: ResolvedSimpleParachainConfig[];
}
