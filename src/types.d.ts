interface LaunchConfig {
  relaychain: RelayChainConfig;
  parachains: ParachainConfig[];
  simpleParachains: SimpleParachainConfig[];
  hrmpChannels: HrmpChannelsConfig[];
  types: any;
}
interface ParachainConfig {
  bin: string;
  id: string;
  rpcPort: number;
  wsPort: number;
  port: number;
  balance: string;
  flags: string[];
  chain?: string;
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
    flags?: string[];
  }[];
}

interface ChainSpec {
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
    runtime: {
      frameSystem: {
        changesTrieConfig: null;
        code: string;
        palletBabe: {
          authorities: string[];
        };
        palletIndices: {
          indices: string[];
        };
        palletBalances: {
          balances: [[string, number]];
        };
        "palletSession": {
            "keys": [
              [
                string,
                string,
                any
                // {
                //   "grandpa": "5FA9nQDVg267DEd8m1ZypXLBnvN7SFxYwV7ndqSYGiN9TTpu",
                //   "babe": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                //   "im_online": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                //   "parachain_validator": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                //   "authority_discovery": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                //   "para_validator": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
                //   "para_assignment": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                // }
              ],
            ]
        }
      };
    };
    raw: {
      top: {
        [key: string]: string;
      };
    };
  };
}
