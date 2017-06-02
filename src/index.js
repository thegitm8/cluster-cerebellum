'use strict'

const cluster = require('cluster')
const cerebellum = require('./cerebellum')

function setupCerebellumConfiguration( config ) {

	const cluster = this
	const setupMasterKeys = [ 'execArgv', 'exec', 'args', 'silent', 'stdio', 'uid', 'gid' ]

	const clusterSettings = Object.keys(config).reduce((a, next) => {

		if(setupMasterKeys.indexOf(config[next]) > -1)
			a[next] = config[next]


		return a

	}, {})

	cluster.setupMaster(clusterSettings)

	return {
		// runtime
		

		// configuration
		clusterSettings: 			clusterSettings,
		expectedNumberOfWorkers: 	config.worker || process.env.CEREBELLUM_NUM_OF_WORKERS || os.cpus().length,
		workeStopTimeout: 			config.workerTimeout || 2000
	}

}

function clusterCerebellumInterface( config ) {

	const settings = setupCerebellumConfiguration( config )
	const _workersToStop = []
	const _haltProcess = false
	const _useOnline = config.useOnline || false

	function startWorkers(args = {}) {
		
		cluster.cerebellumStartWorkers( args )

	}

	function stopWorkersGracefully() {

		cluster.cerebellum.haltProcess = true
		cluster.cerebellum.workersToStop = Object.keys(cluster.workers)

		cluster.cerebellumStopNextWorker()

	}

	function restartWorkers(workerPid) {

		_workersToStop = Object.keys(cluster.workers)

		_stopNextWorker()

	}
	

	return {
		start: 		startWorkers,
		restart: 	restartWorkers,
		stop: 		stopWorkersGracefully
	}

}