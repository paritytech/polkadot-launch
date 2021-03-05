import Web3 from "web3";
export declare function parallelSend(web3: Web3, startingNonce: number, _value: string, nbIterations: number, fromAccount: string, toAccount: string): void;
export declare function startNodes(): Promise<void>;
export declare function killAll(): void;
