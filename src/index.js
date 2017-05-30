'use strict'

const cluster = require('cluster')
const cerebellum = require('./cerebellum')

function clusterCerebellumInterface( config ) {

	cluster.cerebellumSettings( config )

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