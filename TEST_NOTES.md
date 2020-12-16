### Simple test

### Many transfers at once from one node

12 blocks for 100tx

```
(node:19103) UnhandledPromiseRejectionWarning: Error: Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!
    at Object.TransactionError (/Users/antoineestienne/GitHubRepo/polkadot-launch/node_modules/web3-core-helpers/lib/errors.js:87:21)
    at /Users/antoineestienne/GitHubRepo/polkadot-launch/node_modules/web3-core-method/lib/index.js:424:49
    at runMicrotasks (<anonymous>)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at runNextTicks (internal/process/task_queues.js:62:3)
    at processImmediate (internal/timers.js:434:9)
```

thrown before 50m blocks went by

