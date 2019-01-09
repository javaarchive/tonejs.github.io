const fs = require('fs')
const child_process = require('child_process')

// open the passed in file
const data = JSON.parse(fs.readFileSync(process.argv[2]))

data.forEach(datum => {
	if (datum.name === 'version' && datum.scope === "static"){
		const version = datum.meta.code.value
		console.log(version)
	}
})
