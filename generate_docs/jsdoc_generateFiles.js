const version = process.argv[2]
const classList = require(`../_data/${version}/classList.json`)
const fs = require('fs')

const outputFolder = process.argv[3]

function toFrontMatter(obj){
	let output = ''
	for (let param in obj){
		output += `${param} : ${obj[param]}\n`
	}
	return `---\n${output}---`
}

if (!fs.existsSync(`${outputFolder}/${version}`)){
	fs.mkdirSync(`${outputFolder}/${version}`)
}

// for each file in the class list, generate an md file
for (let category in classList){
	//fwd files
	const files = classList[category]
	files.forEach(f => {
		fs.writeFileSync(`${outputFolder}/${f}.md`, toFrontMatter({
			title : f,
			layout : 'forward'
		}))

		fs.writeFileSync(`${outputFolder}/${version}/${f}.md`, toFrontMatter({
			title : f,
			version,
			layout : 'docs',
			category,
		}))
	})
}
