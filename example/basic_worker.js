const cluster = require('cluster')

const server = require('net')
	.createServer()
	.listen(9001)

const timeout = (Math.floor(Math.random() * (10)) + 1)

setTimeout(() => {

	if(timeout > 2) {

		// throw new Error('custom error')

	}

}, 1000)

process.on('message', msg => {

	switch(msg.type) {
		case 'shutdown':
			setTimeout(() => server.close(() => process.exit(0)), 3000)
			break
		default:
			return
	}

})
