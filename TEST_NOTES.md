### Simple test

There is small cost difference between what the transfer should have cost and what it cost

=> reproduce the same test on the standalone

### Many transfers at once from one node

12 blocks for 100tx
7 bllocks for 100tx

=>also test with standalone

```
(node:19103) UnhandledPromiseRejectionWarning: Error: Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!
    at Object.TransactionError (/Users/antoineestienne/GitHubRepo/polkadot-launch/node_modules/web3-core-helpers/lib/errors.js:87:21)
    at /Users/antoineestienne/GitHubRepo/polkadot-launch/node_modules/web3-core-method/lib/index.js:424:49
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at runNextTicks (internal/process/task_queues.js:62:3)
    at processImmediate (internal/timers.js:434:9)
```

thrown before 50m blocks went by (non-critical)

=> probably a client error

143 blocks for 1000 tx

### Many transfers from many nodes

11 blocks for 5x20 tx

## Misc
getBlocks is always behing block event emmission (is it because of blockheader vs completed block?)
=>needs to wait one block before it is "best block", confirmed by relay

block time is usually between 12 and 20seconds

Ive been able to "break the blockchain", i.e. no new blocks on the explorer avec 300seconds (in te case of many tx)

=> leave 2 nodes

=> Should I use the Ferrari? yes, both

=> add an issue in the polkadot-launch repo about n+1

=> possible to break the blockchain, if evm execution time>block
=> we dont have an appropriate gas limit


=> worth it to ask Alan to setup a machine with the good requirements? ferrari should be enough
=> use the ferrari for the tests

### meeting with Oskar
=> we should eventually use kubernetes for those type of tests
=> we need a report structure for errors