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

cerebellum.startCluster()

```

### Configuration
```javascript
cerebellum.setupCluster({
	// cluster.setupMaster
	exec: 'worker.js',
	args: '{ arg1: "someValue" }',
	silent: false
	stdio: 
	// cerebellum config
	numberOfWorkers: 4,
	restart: true
	timeToWaitBeforeKill: 2000,
	useOnline: false,
	// functions
	log: (worker, message) => console.log(`${worker.process.pid} => ${message}`),
	// stat
})
```

## API
###
## Events
### Events (cluster)
#### Event: `allWorkersRestarted`
#### Event: `allWorkersStarted`
#### Event: `restartedWorker`
#### Event: `workerStarted`
### Events (worker)
#### Event: `workerStarted`
#### Event: `workerStopped`
