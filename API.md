# API

* [Events](#events)
	* [Events (cluster)](#eventscluster)
		* [allworkersRestarted](#event-allworkersrestarted)
		* [allWorkersStarted](#event-allWorkersstarted)
		* [restartedWorker](#event-restartedworker)
		* [workerStarted](#event-workerstarted)
	* [Events (worker)](#eventsworker)
		* [restartedWorker](#event-restartedworker-1)
		* [workerStarted](#event-workerstarted-1)
* [killCluster](#killcluster)
* [restartCluster](#restartcluster)
* [setupCluster](#setupclusteroptionsobject)
* [startCluster](#startcluster)
* [stopCluster](#stopcluster)

## Events
### Events (cluster)
#### Event: `allWorkersKilled`
#### Event: `allWorkersRestarted`
#### Event: `allWorkersStarted`
#### Event: `restartedWorker`
#### Event: `workerStarted`
### Events (worker)
#### Event: `workerStarted`
#### Event: `workerStopped`

## killCluster()
## restartCluster()
## setupCluster(options:object)
`setupCluster` is used to configure the way workers are forked (pretty much the same way the native [cluster.setupMaster](https://nodejs.org/api/cluster.html#cluster_cluster_setupmaster_settings) works). You can call `setupCluster` more than once, but changes will only be reflected in future forks. The current forking behavior reflects the current settings.

Cerebellum is also environmental aware. Each option (except function or stream options) can be set via environment variable, but local values will have precedence (if you've provided `CEREBELLUM_ENV_EXEC` in the environment and `exec` option on `setupCluster`, the value provided to `setupCluster` will be taken.)

The following options are available:

#### exec (`CEREBELLUM_ENV_EXEC`)
The file to be forked on `clusterStart`, defaults to the file calling `startCluster`.

#### args (`CEREBELLUM_ENV_ARGS`)
Array of ommandline arguments passed to the forked worker. If set via environment variable the provided string will be split on spaces.
```shell
CEREBELLUM_ENV_ARGS="--use http"
```
#### silent (`CEREBELLUM_ENV_SILENT`)
Whether or not to send output to masters stdio.

#### stdio
Configures the stdio of forked processes. When this option is provided, it overrides `silent`. For more information, [have a lok here](https://nodejs.org/api/child_process.html#child_process_options_stdio). 

#### numberOfWorkers (`CEREBELLUM_NUM_OF_WORKERS`)
The number of processes to be forked. Defaults to number of cpus (`os.cpus().length`).

#### restart (`CEREBELLUM_RESTART_WORKERS`)
Automatically restarting forked workers if they die. Defaults to `true`.

#### timeToWaitBeforeKill (`CEREBELLUM_WORKER_TIMEOUT`)
Cerebellum tries to shutdown workers gracefully by giving them time to finish on there own. Here you can provide your own value in milliseconds. Default is 5000 ms.

#### useOnline (`CEREBELLUM_USE_ONLINE`)
By default the `workerStarted` event will be emited on the workers `listening` event. If you instead want to `workerStarted` to be emitted on `online` (maybe you are not running a server), you can set this to true.

#### log
`log` is a higher order function initialized with a worker instance.

```javascript
const options = {
	log: function(worker) { // <= will be executed on forking a new worker

		return function(message) {

			// do logging stuff here
			console.log(`${worker.process.pid} => ${msg}`)

		}

	}
}

// or

const options = { log: worker => msg => console.log(`${worker.process.pid} => ${msg}`) }

```

## startCluster()
## stopCluster()



