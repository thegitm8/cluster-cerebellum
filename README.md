# cluster-cerebellum

[![version](https://img.shields.io/npm/v/cluster-cerebellum.svg)](https://www.npmjs.com/package/cluster-cerebellum)
[![npm downloads](https://img.shields.io/npm/dt/cluster-cerebellum.svg)](https://www.npmjs.com/package/cluster-cerebellum)
[![liscense](https://img.shields.io/npm/l/cluster-cerebellum.svg)](https://www.npmjs.com/package/cluster-cerebellum)
[![Known Vulnerabilities](https://snyk.io/test/github/thegitm8/cluster-cerebellum/badge.svg)](https://snyk.io/test/github/thegitm8/cluster-cerebellum)
[![Build Status](https://travis-ci.org/thegitm8/cluster-cerebellum.svg?branch=master)](https://travis-ci.org/thegitm8/cluster-cerebellum)

`cluster-cerebellum` is a cluster control module. It complements the native `cluster` module and adds features like consecutive restarts of worker processes.

:exclamation: **This is still in alpha and API may change.**

1. [Installation](#installation)
2. [Usage](#usage)
3. [API](./API.md)

## Installation
```shell
npm install --save cluster-cerebellum
```

## Usage

```javascript
const cerebellum = require('cluster-cerebellum')

const options = {
	exec: 'worker.js',
	numberOfWorkers: 3
}

cerebellum.setupCluster(options)

cerebellum.startCluster()

```



