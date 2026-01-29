# Create Operations Saga

The create operations saga handles the creation of operation metadata objects. It creates new operation objects with unique IDs and database names.

## Actions

| Action                    | Type    | Description                                    |
| ------------------------- | ------- | ---------------------------------------------- |
| `createOperationsRequest` | Request | Initiates operation creation                   |
| `createOperationsSuccess` | Success | Signals successful creation with operation IDs |

## Files

| File         | Description                           |
| ------------ | ------------------------------------- |
| `watcher.js` | Watches and handles creation requests |
| `worker.js`  | Creates operations                    |
| `actions.js` | Redux action creators                 |
