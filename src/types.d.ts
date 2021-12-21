export interface CollatorOptions {
	name?: string;
	relayChainSpecRawPath: string;
	paraChainSpecRawPath: string;
	flags?: string[];
	basePath?: string;
	onlyOneParachainNode?: boolean;
}
export interface LaunchConfig {
	relaychain: RelayChainConfig;
	parachains: ParachainConfig[];
	simpleParachains: SimpleParachainConfig[];
	hrmpChannels: HrmpChannelsConfig[];
	types: any;
	finalization: boolean;
}
export interface RunConfig {
	verbose: number;
	out: string;
}
export interface ParachainNodeConfig {
	rpcPort?: number;
	wsPort: number;
	port: number;
	basePath?: string;
	name?: string;
	flags: string[];
}
export interface ParachainConfig {
	bin: string;
	id?: number;
	balance: string;
	chain?: string;
	nodes: ParachainNodeConfig[];
}
export interface SimpleParachainConfig {
	bin: string;
	id: number;
	port: string;
	balance: string;
}
export interface HrmpChannelsConfig {
	sender: number;
	recipient: number;
	maxCapacity: number;
	maxMessageSize: number;
}
interface ObjectJSON {
	[key: string]: ObjectJSON | number | string;
}
export interface RelayChainConfig {
	bin: string;
	chain: string;
	nodes: {
		name: string;
		basePath?: string;
		wsPort: number;
		rpcPort?: number;
		nodeKey?: string;
		port: number;
		flags?: string[];
	}[];
	genesis?: JSON | ObjectJSON;
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

export interface GenesisParachain {
	isSimple: boolean;
	id?: number;
	resolvedId: number;
	chain?: string;
	protocolId?: string;
	bin: string;
}

export interface ResolvedParachainConfig extends ParachainConfig {
	resolvedId: number;
}
export interface ResolvedSimpleParachainConfig extends SimpleParachainConfig {
	resolvedId: number;
}
export interface ResolvedLaunchConfig extends LaunchConfig {
	parachains: ResolvedParachainConfig[];
	simpleParachains: ResolvedSimpleParachainConfig[];
}
