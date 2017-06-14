const cluster 	= require('cluster')
const os 		= require('os')
const expect 	= require('chai').expect
const sinon 	= require('sinon')

describe('cluster-cerebellum', function() {

	let cerebellum

	before(function() {
		
		cerebellum = require(require.resolve('../src'))
		cerebellum.setupCluster({ exec: 'test/test_worker.js' })

	})

	beforeEach(function() {

		delete require.cache[require.resolve('../src')]
		cerebellum = require(require.resolve('../src'))

	})

	afterEach(function(done) {

		Object.keys(cluster.workers)
			.forEach(function(id) {

				if (!cluster.workers[id].process.killed) {

					cluster.workers[id].kill()

				}

			})

		done()

	})

	it('forks a specified worker process', function(done) {

		const worker = cluster.fork()

		worker.on('online', function() {

			expect(Object.keys(cluster.workers).length).to.equal(1)
			done()

		})

	})

	it('restarts all workers', function(done) {

		const originalWorkers = []

		for (let i = 0; i < os.cpus().length; i++) {

			originalWorkers.push(cluster.fork())

		}

		expect(Object.keys(cluster.workers).length).to.equal(os.cpus().length)

		const originalWorkerPids = originalWorkers.map(worker => worker.process.pid)
		const restartEvent = cerebellum.restartCluster(originalWorkers)

		restartEvent.on('workersRestarted', function() {


			const newWorkers = Object.keys(cluster.workers).map( wId => cluster.workers[wId])

			expect(newWorkers.length).to.equal(os.cpus().length)

			newWorkers.forEach( worker =>
				expect(originalWorkerPids.indexOf(worker.process.pid)).to.equal(-1)
			)

			done()

		})

	})


	it('shuts down workers one after the other', function(done) {

		const notifier = {}
		const workers = []
		const numberOfWorkers = os.cpus().length

		for (let i = 0; i < numberOfWorkers; i++) {

			const worker = cluster.fork()

			notifier[worker.id] = sinon.spy()
			workers.push(worker)

		}

		expect(Object.keys(cluster.workers).length).to.equal(numberOfWorkers)

		const restartEvents = cerebellum.restartCluster(workers)

		restartEvents.on('workerStopped', stoppedWorker => notifier[stoppedWorker.id]())

		restartEvents.on('workersRestarted', function() {

			// skipping first worker
			for (let j = 1; j < numberOfWorkers; j++) {

				expect(notifier[workers[j].id].calledAfter(notifier[workers[j - 1].id])).to.be.ok

			}

			done()

		})

	})

})
