const fs = require('fs')
const child_process = require('child_process')

// open the passed in file
const data = JSON.parse(fs.readFileSync(process.argv[2]))

let printedConsole = false

data.forEach(datum => {

	if (datum.name === 'version' && datum.scope === 'static' && datum.meta.code.value !== 'version'){
		const version = datum.meta.code.value
		console.log(version)
		printedConsole = true
	}
})

//stopgap for now
if (!printedConsole){
	console.log('r13')
}