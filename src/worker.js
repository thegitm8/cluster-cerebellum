'use strict'

process.on('message', msg => {

	switch(msg.type) {
		case 'shutdown':
			setTimeout(() => server.close(() => process.exit(0)), 3000)
			break
		default:
			return
	}

})

module.exports = (function clusterCerebellumWorker() {

	let listener = []

	return {

	}

})()
