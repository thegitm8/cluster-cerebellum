var cluster = require('cluster')
var os 		= require('os')
var expect 	= require('chai').expect
var sinon 	= require('sinon')

describe('cluster-cerebellum functional tests', function() {

	this.timeout(5000)

	var expectedNumberOfWorkers = os.cpus().length
	var defaultClusterConfig = {
		exec: 					'test/test_worker.js',
		numberOfWorkers: 		expectedNumberOfWorkers,
		timeToWaitBeforeKill: 	100
	}
	var cerebellum

	beforeEach(function beforeEachClusterTest() {

		delete require.cache[require.resolve('../lib')]
		cerebellum = require(require.resolve('../lib'))

	})

	afterEach(function afterEachClusterTest(done) {

		cerebellum.killCluster()

		cerebellum.on('allWorkersKilled', done)

	})

	describe('configuration', function() {

		it('creates default settings when no configuration object is provided.', function() {

			cerebellum.setupCluster()

			var defaultConfig = cerebellum.clusterSettings()

			expect(defaultConfig.expectedNumberOfWorkers).to.equal(expectedNumberOfWorkers)
			expect(defaultConfig.restart).to.be.false // eslint-disable-line
			expect(defaultConfig.timeToWaitBeforeKill).to.equal(5000)
			expect(defaultConfig.useOnline).to.be.false // eslint-disable-line
			expect(typeof defaultConfig.log).to.equal('function')

		})

		it('creates settings based on provided configuration object.', function() {

			cerebellum.setupCluster({
				exec: 'test/worker.js',
				args: [ '--args', 'test' ],
				silent: true,
				numberOfWorkers: 2,
				restart: true,
				timeToWaitBeforeKill: 1000,
				useOnline: true,
				log: function(w) {
					return function(msg) {}
				}
			})

			var clusterSettings = cerebellum.clusterSettings() // eslint-disable-line

			expect(clusterSettings.cluster.exec).to.equal('test/worker.js')
			expect(cluster.settings.exec).to.equal('test/worker.js')

			expect(clusterSettings.cluster.args).to.have.members([ '--args', 'test' ])
			expect(cluster.settings.args).to.have.members([ '--args', 'test' ])

			expect(clusterSettings.cluster.silent).to.be.true // eslint-disable-line
			expect(cluster.settings.silent).to.be.true // eslint-disable-line

			expect(clusterSettings.expectedNumberOfWorkers).to.equal(2)
			expect(clusterSettings.restart).to.be.true // eslint-disable-line
			expect(clusterSettings.timeToWaitBeforeKill).to.equal(1000)
			expect(clusterSettings.useOnline).to.be.true // eslint-disable-line
			expect(typeof clusterSettings.log).to.equal('function')

		})

		it('creates settings based on provided environment variables.', function() {

			var originalEnv = process.env

			process.env = Object.assign(originalEnv, {
				CEREBELLUM_ENV_EXEC: 'test/worker.js',
				CEREBELLUM_ENV_ARGS: '--args test',
				CEREBELLUM_ENV_SILENT: 'true',
				CEREBELLUM_NUM_OF_WORKERS: '2',
				CEREBELLUM_RESTART_WORKERS: 'true',
				CEREBELLUM_WORKER_TIMEOUT: '1000',
				CEREBELLUM_USE_ONLINE: 'true'
			})

			cerebellum.setupCluster()

			var clusterSettings = cerebellum.clusterSettings() // eslint-disable-line

			expect(clusterSettings.cluster.exec).to.equal('test/worker.js')
			expect(cluster.settings.exec).to.equal('test/worker.js')

			expect(clusterSettings.cluster.args).to.have.members([ '--args', 'test' ])
			expect(cluster.settings.args).to.have.members([ '--args', 'test' ])

			expect(clusterSettings.cluster.silent).to.be.true // eslint-disable-line
			expect(cluster.settings.silent).to.be.true // eslint-disable-line

			expect(clusterSettings.expectedNumberOfWorkers).to.equal(2)
			expect(clusterSettings.restart).to.be.true // eslint-disable-line
			expect(clusterSettings.timeToWaitBeforeKill).to.equal(1000)
			expect(clusterSettings.useOnline).to.be.true // eslint-disable-line
			expect(typeof clusterSettings.log).to.equal('function')

			delete process.env['CEREBELLUM_ENV_EXEC']
			delete process.env['CEREBELLUM_ENV_ARGS']
			delete process.env['CEREBELLUM_ENV_SILENT']
			delete process.env['CEREBELLUM_NUM_OF_WORKERS']
			delete process.env['CEREBELLUM_RESTART_WORKERS']
			delete process.env['CEREBELLUM_WORKER_TIMEOUT']
			delete process.env['CEREBELLUM_USE_ONLINE']

		})

		it('uses default settings when not configured before calling startCluster.', function() {

			cerebellum.startCluster()
			var defaultConfig = cerebellum.clusterSettings()

			expect(defaultConfig.expectedNumberOfWorkers).to.equal(expectedNumberOfWorkers)
			expect(defaultConfig.restart).to.be.false // eslint-disable-line
			expect(defaultConfig.timeToWaitBeforeKill).to.equal(5000)
			expect(defaultConfig.useOnline).to.be.false // eslint-disable-line
			expect(typeof defaultConfig.log).to.equal('function')

		})

	})

	describe('startup/restart', function() {

		it('starts a cluster with a specified number of workers.', function(done) {

			cerebellum.setupCluster(defaultClusterConfig)
			cerebellum.startCluster()

			cerebellum.on('allWorkersStarted', function() {

				expect(Object.keys(cluster.workers).length).to.equal(expectedNumberOfWorkers)
				done()

			})

		})

		it('restarts all workers', function(done) {

			cerebellum.setupCluster(defaultClusterConfig)
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
