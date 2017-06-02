'use strict'

const cluster = require('cluster')

cluster.prototype.cerebellumSettings = function cerebellumSettings( config ) {

	const cluster = this
	const clusterSettings = {}

	if(config.execArgv) cluster.clusterSettings.exec = config.execArgv
	if(config.exec) 	cluster.clusterSettings.exec = config.exec
	if(config.args) 	cluster.clusterSettings.exec = config.args
	if(config.silent) 	cluster.clusterSettings.exec = config.silent
	if(config.stdio) 	cluster.clusterSettings.exec = config.stdio
	if(config.uid) 		cluster.clusterSettings.exec = config.uid
	if(config.gid) 		cluster.clusterSettings.exec = config.gid

	return {
		// runtime
		_workersToStop: 			[],
		_haltProcess: 				false,
		_useOnline: 				config.useOnline || false,

		// configuration
		clusterSettings: 			clusterSettings,
		expectedNumberOfWorkers: 	config.worker || process.env.CEREBELLUM_NUM_OF_WORKERS || os.cpus().length,
		workeStopTimeout: 			config.workerTimeout || 2000
	}

}

cluster.prototype.cerebellumStartWorker = function cerebellumStartWorker( args ) {

	const cluster = this
	const envArgs = typeof args === 'function' ? args() : args
	const worker = cluster.fork(envArgs)

	if(cluster.cerebellum._useOnline) {

		worker.on('online', () => worker.emit('started'))

	} else {

		worker.on('listen', () => worker.emit('started'))

	}

	return worker

}

cluster.prototype.cerebellumRestartWorker = function cerebellumRestartWorker( workerId ) {

	const cluster = this
	const worker = cluster.workers[ workerId ]

	if(!worker)
		return

	cluster.cerebellumStopWorkerGracefully( workerId )

	worker.on('disconnect', () => {

		const newWorker = cluster.cerebellumStartWorker()

		newWorker.on('started', () => {

			cluster.emit('restartedWorker', workerId)
		})
	})

}

cluster.prototype.cerebellumStopWorkerGracefully = function cerebellumStopWorkerGracefully( workerId, callback ) {

	const cluster = this

	if(!workerId) {

		// stop if no work needs to be done
		if( cluster.cerebellum._workersToStop.length === 0 ) return

		const _workerId = cluster.cerebellum._workersToStop[0]
		const _workersToStop = cluster.cerebellum._workersToStop.slice(1)

		cluster.cerebellum._workersToStop = _workersToStop

		return cluster.cerebellumStopWorkerGracefully( _workerId, cluster.cerebellumStartWorkers )

	}

	const worker = cluster.workers[ workerId ]

	worker.send({ type: 'shutdown' })

	const _killWorkerAfterTimeout = setTimeout(() => {

		worker.kill()

		if(typeof callback === 'function')
			callback()

	}, cluster.cerebellum.workeStopTimeout )

	worker.on('disconnect', () => {

		// need to call disconnect, to remove worker from cluster.workers array
		worker.disconnect()
		if(typeof callback === 'function')
			callback()

		clearTimeout(_killWorkerAfterTimeout)

	})

	return worker

}










// #############################################################################################################









cluster.prototype.cerebellumStartWorkers = function cerebellumStartWorkers( args ) {

	const cluster = this

	cluster.settings(cluster.cerebllum.clusterSettings)

	// only start workers if process is not stopping
	if(!cluster.cerebellum._haltProcess) {

		const envArgs = typeof args === 'function' ? args() : args
		const _currentNumberOfWorkers = () => Object.keys(cluster.workers).length

		while(_currentNumberOfWorkers() < cluster.cerebellum.expectedNumberOfWorkers ) {

			const worker = cluster.fork(envArgs)

			worker
				// .on('error', () => null) // worker.error
				// .on('disconnect', () => null)
				.on('exit', cluster.cerebellumStartWorkers) // after worker shutdown
				.on('message', msg => {

					switch(msg.type) {
						case 'shutdown':
						default:
							return
					}

				})

			if(cluster.cerebellum._useOnline) {

				worker.on('online', cluster.cerebellumStopNextWorker)

			} else {

				worker.on('listen', cluster.cerebellumStopNextWorker)

			}
				

		}

	}

}

cluster.prototype.cerebellumRestartWorkers = function cerebellumRestartWorkers() {

	const cluster = this

	cluster.cerebellum._workersToStop = Object.keys(cluster.workers)

	cluster.cerebellumStopNextWorker()

}

cluster.prototype.cerebellum = function cerebellum() {

}

cluster.prototype.cerebellumKillWorkers = function cerebellumKillWorkers() {

	const cluster = this

	cluster.cerebellum._haltProcess = true

	Object.keys(cluster.workers).forEach( workerId => cluster.workers[workerId].kill() )

}


cluster.prototype.cerebellumStopWorkersGracefully = function cerebellumStopWorkers() {

	const cluster = this

	cluster.cerebellum._haltProcess = true

	Object.keys(cluster.workers).forEach( cluster.cerebellumStopWorkerGracefully )

}