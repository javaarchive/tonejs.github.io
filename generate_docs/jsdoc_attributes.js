var fs = require('fs');

const descriptionFolder = process.argv[3]

if (!fs.existsSync(descriptionFolder)){
	fs.mkdirSync(descriptionFolder)
}

const heirarchyFile = descriptionFolder + 'classHierarchy.json'
const classListFile = descriptionFolder + 'classList.json'
const constructorsFile = descriptionFolder + 'constructors.json'
const defaultsFile = descriptionFolder + 'defaults.json'
const membersFile = descriptionFolder + 'members.json'
const methodsFile = descriptionFolder + 'methods.json'
const typesFile = descriptionFolder + 'types.json'

function stringify(file, json){
	fs.writeFileSync(file, JSON.stringify(json, undefined, '\t'))
}

function update(file, json){
	var fileContent = parseJSON(file)
	for (var className in json){
		fileContent[className] = json[className]
	}
	stringify(file, fileContent)
}

function parseJSON(file){
	return JSON.parse(fs.readFileSync(file, 'utf8'))
}

/**
 *  CLASS LIST
 */
function getClassList(json){

	const classList = {}

	for (var i = 0; i < json.length; i++){
		const item = json[i];
		if (item.kind === 'class' && item.access !== 'private'){
			var parent = item.meta.path.split('/')
			var level = parent[parent.length - 1]
			if (!classList[level]){
				classList[level] = []
			}
			classList[level].push(item.name)
		}
	}
	return classList;
}

/**
 *  CLASS HEIRARCHY
 */
function getClassHierarchy(json){


	var classHierarchy = {};

	for (var i = 0; i < json.length; i++){
		var item = json[i];
		if (item.kind === 'class' && item.access !== 'private' && item.augments){
			var parents = [];
			var parent = item.augments[0];
			var dotSplit = parent.split('.');
			parent = dotSplit[dotSplit.length - 1];
			getParents(json, item.name, parents);
			classHierarchy[item.name] = parents;
		}
	}
	return classHierarchy;
}

function getParents(json, className, parentList){
	for (var i = 0; i < json.length; i++){
		var item = json[i];
		if (item.kind === 'class' && item.access !== 'private' && item.augments){
			if (className === item.name){
				var parent = item.augments[0];
				var dotSplit = parent.split('.');
				parent = dotSplit[dotSplit.length - 1];
				parentList.push(parent);
				getParents(json, parent, parentList);
			}
		}
	}
}


/**
 *  CLASS DESCRIPTIONS
 */

function getConstructors(json){

	//the constructors
	var constructors = {};
	var i, item, cls, classSplit;
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === 'class' && item.access !== 'private'){
			var params = item.params;
			for (var p in params){
				params[p].type = params[p].type.names;
			}
			var single = false;
			//if it's a singleton
			if (item.tags){
				for (var t = 0; t < item.tags.length; t++){
					if (item.tags[t].title === 'singleton'){
						single = true;
					}
				}
			}
			constructors[item.name] = {
				description : item.classdesc,
				params : params,
				examples : item.examples,
			};
			if (single){
				constructors[item.name].singleton = true
			}
			if (item.augments){
				constructors[item.name].extends = item.augments[0]
			}
			if (item.deprecated){
				constructors[item.name].deprecated = item.deprecated
			}
		}
	}
	return constructors;
}

function getMethods(json){

	//functions
	var functions = {};
	var i, item, cls, classSplit;
	for (i = 0; i < json.length; i++){
		item = json[i]
		if (item.kind === 'function' && item.access !== 'private' && item.memberof){
			//ignore things that are inherited from Tone
			if (item.inherited && item.inherits.indexOf('Tone#') !== -1){
				continue
			}
			classSplit = item.memberof.split('.')
			cls = classSplit[classSplit.length - 1]
			if (cls === 'defaults'){
				continue;
			}
			if (!functions[cls]){
				functions[cls] = [];
			}
			var methodParams = item.params;
			if (methodParams){
				for (var p = 0; p < methodParams.length; p++){
					if (methodParams[p].type){
						methodParams[p].type = methodParams[p].type.names
					}
				}
			}
			var methodReturns = item.returns
			if (methodReturns){
				methodReturns = methodReturns[0]
				if (methodReturns.type){
					methodReturns.type = methodReturns.type.names
				}
			}
			const methodDescriptions = {
				description : item.description,
				params : methodParams,
				examples : item.examples,
				returns : methodReturns,
				scope : item.scope,
				name : item.name,
				lineno: lineno(item)
			}
			if (item.inherits){
				methodDescriptions.inherits = item.inherits.split('#')[0]
			}
			functions[cls].push(methodDescriptions)
		}
	}
	return functions;
}

function lineno(item){
	// split the path
	if (item.meta){
		const itemPath = item.meta.path.split('/')
		return `Tone/${itemPath[itemPath.length-1]}/${item.meta.filename}#L${item.meta.lineno}`
	}
}

function getMembers(json){

	//members
	const members = {};
	let i, item, cls, classSplit;
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === 'member' && item.access !== 'private' && item.memberof && item.scope === 'instance'){
			//ignore things that are inherited from Tone
			if (item.inherited && item.inherits.indexOf('Tone#') !== -1){
				continue
			}
			classSplit = item.memberof.split('.')
			cls = classSplit[classSplit.length - 1]
			if (!item.type){
				continue
			}
			if (!members[cls]){
				members[cls] = []
			}
			const memberDesc = {
				description : item.description,
				type : item.type.names,
				examples : item.examples,
				readonly : item.readonly,
				scope : item.scope,
				name : item.name,
				lineno: lineno(item)
			}
			if (item.inherits){
				memberDesc.inherits = item.inherits.split('#')[0]
			}
			//options
			if (item.tags){
				for (var t = 0; t < item.tags.length; t++){
					let tagName = item.tags[t].title
					if (tagName === 'signal'){
						memberDesc.signal = true
					}
				}
			}
			members[cls].push(memberDesc)
		}
	}
	return members;
}

function getTypedefs(json){


	//typedef
	var typedefs = [];
	var i, item, cls, classSplit;
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.kind === 'typedef' && item.access !== 'private'){
			typedefs.push({
				description : item.description,
				name : item.type.names[0],
				value : item.defaultvalue
			})
		}
	}
	return typedefs.sort((a, b) => a.name > b.name)
}

function getDefaults(json){

	//defaults
	var defaults = {};
	var i, item, cls, classSplit;
	for (i = 0; i < json.length; i++){
		item = json[i];
		if (item.access !== 'private' && item.memberof){
			classSplit = item.memberof.split('.');
			if (classSplit[2] === 'defaults'){
				var className = classSplit[1];
				if (!defaults[className]){
					defaults[className] = {};
				}
				var defVal = defaults[className];
				for (var s = 3; s < classSplit.length; s++){
					var innerName = classSplit[s];
					if (!defVal[innerName]){
						defVal[innerName] = {};
					}
					defVal = defVal[innerName];
				}
				if (item.meta.code.type !== 'ObjectExpression'){
					defVal[item.name] = item.meta.code.value;
				}
			}
		}
	}
	return defaults;
}

const json = JSON.parse(fs.readFileSync(process.argv[2]))

stringify(classListFile, getClassList(json))
stringify(heirarchyFile, getClassHierarchy(json))
stringify(constructorsFile, getConstructors(json))
stringify(methodsFile, getMethods(json))
stringify(membersFile, getMembers(json))
stringify(typesFile, getTypedefs(json))
stringify(defaultsFile, getDefaults(json))
