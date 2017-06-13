var cluster         = require('cluster');
var os              = require('os');
var expect          = require('chai').expect;
var sinon           = require('sinon');

describe('cluster-cerebellum', function() {
    var clusterTools;

    before(function() {
        cluster.setupMaster({ exec: 'test/test_worker.js' });
    });

    beforeEach(function() {
        delete require.cache[require.resolve('../src')];
        clusterTools = require(require.resolve('../src'));
    });

    afterEach(function(done) {
        Object.keys(cluster.workers)
            .forEach(function(id) {
                if (!cluster.workers[id].process.killed) {
                    cluster.workers[id].kill();
                }
            });

        done();
    });

    it('forks a specified worker process', function(done) {
        var worker = cluster.fork();

        worker.on('online', function() {
            expect(Object.keys(cluster.workers).length).to.equal(1);
            done();
        });
    });

    it('restarts all workers', function(done) {
        var originalWorkers = [];

        for (var i = 0; i < os.cpus().length; i++) {
            originalWorkers.push(cluster.fork());
        }

        expect(Object.keys(cluster.workers).length).to.equal(os.cpus().length);

        var originalWorkerPids = originalWorkers.map(function(worker) {
            return worker.process.pid;
        });

        var restartEvent = clusterTools.gracefullRestart(originalWorkers);

        restartEvent.on('workersRestarted', function() {
            expect(Object.keys(cluster.workers).length).to.equal(os.cpus().length);

            var newWorkers = Object.keys(cluster.workers).map(function(wId) {
                return cluster.workers[wId];
            });

            newWorkers.forEach(function(worker) {
                expect(originalWorkerPids.indexOf(worker.process.pid)).to.equal(-1);
            });

            done();
        });
    });


    it('shuts down workers one after the other', function(done) {
        var notifier = {};
        var workers = [];
        var numberOfWorkers = os.cpus().length;

        for (var i = 0; i < numberOfWorkers; i++) {
            var worker = cluster.fork();
            notifier[worker.id] = sinon.spy();
            workers.push(worker);
        }

        expect(Object.keys(cluster.workers).length).to.equal(numberOfWorkers);

        var restartEvents = clusterTools.gracefullRestart(workers);

        restartEvents.on('workerStopped', function(stoppedWorker) {
            notifier[stoppedWorker.id]();
        });

        restartEvents.on('workersRestarted', function() {
            // skipping first worker
            for (var j = 1; j < numberOfWorkers; j++) {
                expect(notifier[workers[j].id].calledAfter(notifier[workers[j - 1].id])).to.be.ok;
            }

            done();
        });
    });
});
