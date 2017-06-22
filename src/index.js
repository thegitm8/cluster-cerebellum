'use strict'

const cluster 		= require('cluster')
const os 			= require('os')
const util 			= require('util')
const EventEmitter 	= require('events').EventEmitter
const debug 		= require('debug')('cerebellum:master')
const {
	cerebellumRestartWorker,
	cerebellumStopWorkerGracefully } 	= require('./cerebellum')

const cerebellumSetupCluster = require('./settings')

function CerebellumInterface() {

	// cerebellum is an instance of eventEmitter
	EventEmitter.call(this)

	let haltingCluster = false
	let restartingCluster = false

	this.clusterSettings = function _getClusterSettings() {

		return this.settings

	}

	/**
	 * [setupCluster description]
	 * @param  {[type]} configuration [description]
	 * @return {[type]}               [description]
	 */
	this.setupCluster = function _setupCluster(configuration = {}) {

		debug('Setting up cluster.')

		const that = this

		that.settings = cerebellumSetupCluster(configuration)

		// configure cluster module
		cluster.setupMaster(that.settings.cluster)

		cluster.on('fork', worker => {

			// decorating new workers
			worker.expectedNumberOfWorkers 	= that.settings.expectedNumberOfWorkers
			worker.timeToWaitBeforeKill 	= that.settings.timeToWaitBeforeKill
			worker.useOnline 				= that.settings.useOnline
			worker.restart 					= that.settings.restart
			worker.log 						= that.settings.log(worker)

			let exitToDisconnectDelay

			// creating unified and predictable worker events
			worker
				// starting worker
				.on(worker.useOnline ? 'online' : 'listening', () => {

					worker.log(`[${Object.keys(cluster.workers).length}/${worker.expectedNumberOfWorkers}] New worker forked.`)

					process.nextTick(() => worker.emit('workerStarted', worker))
					process.nextTick(() => that.emit('workerStarted', worker))

				})
				.on('disconnect', () => exitToDisconnectDelay = Date.now())
				.on('exit', (code, signal) => {


					// remove worker from cluster.workers object
					delete cluster.workers[worker.id]

					worker.log(`[${Object.keys(cluster.workers).length}/${worker.expectedNumberOfWorkers}] Worker stopped with signal [${signal}] and code [${code}].`)

					worker.log(`Delay between "exit" and "disconnect": ${Date.now() - exitToDisconnectDelay}`)

					process.nextTick(() => worker.emit('workerStopped', worker))
					process.nextTick(() => that.emit('workerStopped', worker))

				})
				.on('error', () => worker.log('error'))
				.on('workerStopped', () => {

					if(worker.restart && !haltingCluster) {

						worker.log('Restarting worker.')
						cluster.fork()

					}

				})
				

		})

	}

	/**
	 * [startCluster description]
	 * @param  {[type]} env [description]
	 * @return {[type]}     [description]
	 */
	this.startCluster = function _startCluster(env) {

		debug('Starting a new cluster.')

		const that = this
		const _runningWorkers = () => cluster.workers ? Object.keys(cluster.workers).length : 0
		const currentNumberOfWorkers 	= () => Object.keys(cluster.workers).length

		if(!that.settings)
			that.clusterSetup()

		while(_runningWorkers() <= that.settings.expectedNumberOfWorkers) {

			if(_runningWorkers() === that.settings.expectedNumberOfWorkers) {

				// wait one tick before informing listeners
				process.nextTick(() => that.emit('allWorkersStarted'))
				return that

			}

			cluster.fork()

		}

	}

	/**
	 * [stopCluster description]
	 * @return {[type]} [description]
	 */
	this.stopCluster = function _stopWorkersGracefully() {

		debug('Halting the cluster.')

		haltingCluster = true

		Object
			.keys(cluster.workers)
			.forEach( pid => cerebellumStopWorkerGracefully(cluster.workers[pid]) )

	}

	/**
	 * [killCluster description]
	 * @return {[type]} [description]
	 */
	this.killCluster = function _killCluster() {

		debug('Killing cluster.')

		const that = this

		haltingCluster = true

		Object
			.keys(cluster.workers)
			.forEach( pid => cluster.workers[pid].kill() )

		process.nextTick(() => that.emit('allWorkersKilled'))

	}

	/**
	 * [restartCluster description]
	 * @param  {[type]} workerPid [description]
	 * @return {[type]}           [description]
	 */
	this.restartCluster = function _restartCluster() {

		debug('Restarting cluster')

		const that = this

		function restartWorker(workers) {
			console.log('PING')

			if(workers.length < 1) {

				that.emit('allWorkersRestarted')
				return that

			}

			const worker = workers[0]
			const nextWorkers = workers.slice(1)

			return cerebellumStopWorkerGracefully(worker)
				.on('workerStopped', () => restartWorker(nextWorkers))

		}

		const workersToRestart = Object.keys(cluster.workers).map( id => cluster.workers[id] )

		restartWorker(workersToRestart)

	}

}

util.inherits(CerebellumInterface, EventEmitter)

module.exports = new CerebellumInterface()
