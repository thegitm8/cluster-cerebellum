'use strict'

module.exports = (function clusterCerebellumWorker() {

	let listener = []

	function _callShutDownListener() {

		const _close = () => process.exit(0)

		if(listener.length > 0) {
			
			process.exit(0)
			return

		}
		
		listener.forEach( func => func(_close))

	}
	
	process.on('message', msg => {

		switch(msg.type) {
			case 'shutdown':
				_callShutDownListener()
				break
			default:
				return
		}

	})

	return {
		onShutdown: function addShutdownListener(func) {

			listener = [].concat(listener, func)

		}
	}

})()
