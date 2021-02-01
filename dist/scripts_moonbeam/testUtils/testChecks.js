"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEveryBlock = void 0;
function readEveryBlock(web3, startingBlock) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentBlockNumber = (yield web3.eth.getBlock('latest')).number;
        let maxNbTx = 0;
        let totalNbTx = 0;
        for (let i = startingBlock; i <= currentBlockNumber; i++) {
            let block = yield web3.eth.getBlock(i);
            let nbTx = block.transactions.length;
            console.log('Block Number #', i, " nb of tx :", nbTx);
            if (nbTx > maxNbTx) {
                maxNbTx = nbTx;
            }
            totalNbTx += nbTx;
        }
        console.log('Max number tx per block is ', maxNbTx);
        console.log('Total number tx is ', totalNbTx);
        return totalNbTx;
    });
}
exports.readEveryBlock = readEveryBlock;
