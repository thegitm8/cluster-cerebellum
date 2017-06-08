'use strict'

const os = require('os')
const debug = require('debug')

function _stringToBoolean( string ) {

	if(string === 'true' || string === 'false')
		return string === 'true'

	if(string === '1' || string === '0')
		return Boolean(parseInt(string, 10))

	return !!string

}

function _createSetupMasterSettings(config) {

	// REF: https://nodejs.org/api/cluster.html#cluster_cluster_setupmaster_settings
	const setupMasterKeys = [
		'exec',
		'args',
		'silent',
		'stdio'
	]

	return setupMasterKeys.reduce((a, key) => {

		// favor values provided by config
		if(Object.keys(config).indexOf(key) > -1) {

			a[key] = config[key]

			return a

		}

		const environmentKey = `CEREBELLUM_ENV_${key.toUpperCase()}`

		if(key !== 'stdio' && process.env[environmentKey]) {

			let value

			switch(key) {
				case 'args':
					value = process.env[environmentKey].split(' ')
					break
				case 'silent':
					value = _stringToBoolean(process.env[environmentKey])
					break
				case 'exec':
				default:
					value = process.env[environmentKey]
			}
			
			a[key] = value

			return a

		}

		return a

	}, {})

}

module.exports = function _createCerebellumClusterSettings( config ) {

	return {
		cluster: 						_createSetupMasterSettings(config),
		expectedNumberOfWorkers: 		config.numberOfWorkers || process.env.CEREBELLUM_NUM_OF_WORKERS || os.cpus().length,
		restart: 						config.restart || _stringToBoolean(process.env.CEREBELLUM_RESTART_WORKERS) || false,
		timeToWaitBeforeKill: 			config.timeToWaitBeforeKill || process.env.CEREBELLUM_WORKER_TIMEOUT || 5000,
		useOnline: 						config.useOnline || process.env.CEREBELLUM_USE_ONLINE || false,
		log: 							typeof config.log === 'function' ? worker => config.log(worker) : worker => debug(`cerebellum:${worker.process.pid}`)
	}

}
