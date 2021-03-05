export declare function generateChainSpec(bin: string, chain: string): Promise<void>;
export declare function generateChainSpecRaw(bin: string, chain: string): Promise<void>;
export declare function startNode(bin: string, name: string, wsPort: number, port: number, spec: string, flags?: string[]): void;
export declare function exportGenesisWasm(bin: string, chain?: string): Promise<string>;
export declare function exportGenesisState(bin: string, id?: string, chain?: string): Promise<string>;
export declare function startCollator(bin: string, id: string, wsPort: number, port: number, chain?: string, spec?: string, flags?: string[]): Promise<void>;
export declare function startSimpleCollator(bin: string, id: string, spec: string, port: string): void;
export declare function purgeChain(bin: string, spec: string): void;
export declare function killAll(): void;
