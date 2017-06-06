'use strict'

const cerebellum = require('../src')

cerebellum.setupCluster({
	exec: 'example/basic_worker.js',
	numberOfWorkers: 6,
	timeToWaitBeforeKill: 15000,
	restart: true
})

cerebellum.startCluster()

cerebellum.on('allWorkersStarted', () => {

	setTimeout(() => cerebellum.restartCluster(), 1000)

})

cerebellum.on('allWorkersRestarted', () => {

	setTimeout(() => cerebellum.stopCluster(), 1000)

})
