var cluster = require('cluster')
var os 		= require('os')
var expect 	= require('chai').expect
var sinon 	= require('sinon')

describe('cluster-cerebellum', function() {

	var expectedNumberOfWorkers = os.cpus().length
	var workerFile = 'test/test_worker.js'
	var cerebellum

	beforeEach(function() {

		delete require.cache[require.resolve('../lib')]
		cerebellum = require(require.resolve('../lib'))

		cerebellum.setupCluster({
			exec: 					workerFile,
			numberOfWorkers: 		expectedNumberOfWorkers,
			timeToWaitBeforeKill: 	100
		})
		
	})

	afterEach(function(done) {

		cerebellum.killCluster()

		cerebellum.on('allWorkersKilled', done)

	})

	it('starts a cluster with a specified number of workers.', function(done) {

		cerebellum.startCluster()

		cerebellum.on('allWorkersStarted', function() {

			expect(Object.keys(cluster.workers).length).to.equal(expectedNumberOfWorkers)
			done()

		})

	})

	it('restarts all workers', function(done) {

		cerebellum.startCluster()

		var originalWorkerPids

		cerebellum.on('allWorkersStarted', function() {

			originalWorkerPids = Object.keys(cluster.workers).map(function (w) {

				return cluster.workers[w].process.pid

			})

			cerebellum.restartCluster()

		})

		cerebellum.on('allWorkersRestarted', function() {

			var newWorkers = Object.keys(cluster.workers).map(function(w) {

				return cluster.workers[w]

			})

			expect(newWorkers.length).to.equal(expectedNumberOfWorkers)

			newWorkers.forEach( worker =>
				expect(originalWorkerPids.indexOf(worker.process.pid)).to.equal(-1)
			)

			done()

		})

	})


	// it('shuts down workers one after the other', function(done) {

	// 	const notifier = {}
	// 	const workers = []
	// 	const numberOfWorkers = os.cpus().length

	// 	for (let i = 0; i < numberOfWorkers; i++) {

	// 		const worker = cluster.fork()

	// 		notifier[worker.id] = sinon.spy()
	// 		workers.push(worker)

	// 	}

	// 	expect(Object.keys(cluster.workers).length).to.equal(numberOfWorkers)

	// 	const restartEvents = cerebellum.restartCluster(workers)

	// 	restartEvents.on('workerStopped', stoppedWorker => notifier[stoppedWorker.id]())

	// 	restartEvents.on('workersRestarted', function() {

	// 		// skipping first worker
	// 		for (let j = 1; j < numberOfWorkers; j++) {

	// 			expect(notifier[workers[j].id].calledAfter(notifier[workers[j - 1].id])).to.be.ok

	// 		}

	// 		done()

	// 	})

	// })

})
