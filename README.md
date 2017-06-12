# cluster-cerebellum
`cluster-cerebellum` is a cluster control module. It complements the native `cluster` module and adds features like consecutive restarts of worker processes.

:exclamation: This is still in alpha and API may change.

1. [Installation](#installation)
2. [Usage](#usage)
3. [API](./API.md)

## Installation
```shell
npm install --save cluster-cerebellum
```

## Usage

```javascript
const cerebellum = require('cluster-cerebellum')

const options = {
	exec: 'worker.js',
	numberOfWorkers: 3
}

cerebellum.setupCluster(options)

cerebellum.startCluster()

```



