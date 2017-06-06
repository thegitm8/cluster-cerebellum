'use strict'

const cluster = require('cluster')
const debug = require('debug')

function cerebellumRestartWorker( workerId ) {

	const worker = cluster.workers[ workerId ]

	cluster.cerebellumStopWorkerGracefully( workerId )

	worker.on('disconnect', () => {

		const newWorker = cluster.cerebellumStartWorker()

		newWorker.once('started', () => {

			cluster.emit('restartedWorker', workerId)

		})

	})

}

function cerebellumStopWorkerGracefully( worker ) {

	worker.send({ type: 'shutdown' })

	const _killWorkerAfterTimeout = setTimeout(() => {

		worker.log(`Exceeded timeout (${worker.timeToWaitBeforeKill}). Commiting suicide.`)
		worker.kill()

	}, worker.timeToWaitBeforeKill )

	worker.on('exit', () => clearTimeout(_killWorkerAfterTimeout))

	return worker

}

module.exports = {
	cerebellumRestartWorker,
	cerebellumStopWorkerGracefully
}
