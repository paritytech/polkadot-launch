interface LaunchConfig {
    relaychain: RelayChainConfig;
    parachains: ParachainConfig[];
    simpleParachains: SimpleParachainConfig[];
    hrmpChannels: HrmpChannelsConfig[];
    types:any;
  }
  interface ParachainConfig {
    bin: string;
    id: string;
    rpcPort: number;
    wsPort: number;
    port: number;
    balance: string;
    flags: string[];
    chain?:string;
  }
  interface SimpleParachainConfig {
    bin: string;
    id: string;
    port: string;
    balance: string;
  }
  interface HrmpChannelsConfig {
    sender: "200";
    recipient: "300";
    maxCapacity: 8;
    maxMessageSize: 512;
  }
  interface RelayChainConfig {
    bin: string;
    chain: string;
    nodes: {
      name: string;
      wsPort: number;
      port: number;
      flags?:string[]
    }[];
  }
  