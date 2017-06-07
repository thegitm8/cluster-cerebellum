const cluster = require('cluster')
const worker = require('../src/worker')

const server = require('net').createServer().listen(9001)

worker.onShutdown(exit => setTimeout(() => server.close(exit), 3000))


