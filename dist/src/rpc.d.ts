import { ApiPromise } from "@polkadot/api";
export declare function connect(port: number, types: any): Promise<ApiPromise>;
export declare function peerId(api: ApiPromise): Promise<string>;
export declare function follow(name: string, api: ApiPromise): Promise<void>;
export declare function getHeader(api: ApiPromise): Promise<string>;
export declare function registerParachain(api: ApiPromise, id: string, wasm: string, header: string): Promise<void>;
export declare function setBalance(api: ApiPromise, who: string, value: string): Promise<void>;
export declare function establishHrmpChannel(api: ApiPromise, sender: number, receiver: number, maxCapacity: number, maxMessageSize: number): Promise<void>;
export declare function sendHrmpMessage(api: ApiPromise, recipient: string, data: string): Promise<void>;
