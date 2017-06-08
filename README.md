# cluster-cerebellum

:exclamation::exclamation::exclamation: This is currently a work in progress. To get updates about the status of this and my other projects, follow me on Twitter ([@GitM8](https://twitter.com/gitm8)).

`cluster-cerebellum` is a cluster control module. It complements the native `cluster` module and adds features like consecutive restarts of worker processes.




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



