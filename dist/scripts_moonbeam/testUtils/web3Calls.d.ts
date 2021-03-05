import { TransactionReceipt, TransactionConfig } from "web3-core";
import Web3 from "web3";
export declare function sendTxWrapped(web3: Web3, txConfig: TransactionConfig): Promise<TransactionReceipt>;
export declare function sendTxSync(web3: Web3, txConfig: TransactionConfig): Promise<void>;
