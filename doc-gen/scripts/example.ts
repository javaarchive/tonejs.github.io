import {IS_IFRAME, getVersion} from "./common"
import * as monaco from "monaco-editor";

// add Tone.js to it
async function fetchToneDts(){
	//get the currently loaded version on the page
	const response = await fetch(`./assets/tone.d.ts`)
	if (response.ok){
		return await response.text()
	} else {
		throw new Error("couldn't load description")
	}
}

async function runCode(code, element){
	const iframe  = document.createElement('iframe');
	iframe.sandbox.add("allow-scripts")
	iframe.sandbox.add("allow-same-origin")
	iframe.allow = "autoplay"
	element.appendChild(iframe)
	const version = getVersion()
	const unpkgTone = `https://unpkg.com/tone@${version}?module`
	code = code.replace(/from ["']tone["']/gm, `from "${unpkgTone}"`)
	const content = `
	<script>
		// don't print the tone.js logging to the console
		window.TONE_SILENCE_LOGGING = true;
		//overwrite console.log to send info the client
		const originalLog = console.log.bind(console)
		console.log = (...args) => {
			originalLog(...args)
			// defer the logging until after it's loaded
			setTimeout(() => {
				window.parent.postMessage({ console : args }, "*")
			}, 1)
		}
	</script>
	<script type="module">
		// stop it after 30 seconds max
		import { getContext, Destination } from "${unpkgTone}"
		Destination.volume.rampTo(-Infinity, 1, "+30");
		setTimeout(() => {
			// let the parent know 
			window.parent.postMessage({ done : true }, "*")
		}, 32000)
	</script>
	<script type="module">

		window.onerror = e => {
			window.parent.postMessage({ error : e }, "*")
		}
		${code}
		window.parent.postMessage({ loaded : true }, "*")
	</script>
	`
	const blob = new Blob([content], { type : 'text/html' })
	const loaded = new Promise((done) => {
		iframe.onload = done
	})
	iframe.src = URL.createObjectURL(blob)
	await loaded
	await Promise.race([
		new Promise((done, error) => {
			window.addEventListener('message', e => {
				if(e.source === iframe.contentWindow) {
					if (e.data.loaded){
						done()
					} else if (e.data.error){
						error(e.data.error)
					}
				}
			})
		}),
		new Promise((_, error) => {
			// 10 second timeout
			setTimeout(() => {
				error("Timeout!")
			}, 10000)
		})
	])
	return iframe
}

const runText = "► Run"
const stopText = "◼ Stop"

async function main(){
	
	// @ts-ignore
	self.MonacoEnvironment = {
		getWorkerUrl: function(_, label) {
			if (label === "typescript" || label === "javascript") {
				return "./assets/ts.worker.bundle.js";
			}
			return "./assets/editor.worker.bundle.js";
		}
	};

	document.querySelectorAll(".example pre").forEach((example: HTMLElement) => {

		const content = example.textContent

		const model = monaco.editor.createModel(content.trim(), "typescript");
		const element = example.parentElement

		const editor = monaco.editor.create(element, {
			model,
			theme: "vs-dark",
			scrollBeyondLastLine: false,
			minimap: {
				enabled: false
			}
		});
		example.textContent = ""

		//add a run button to the bottom
		const button = document.createElement("button")
		button.textContent = runText
		element.appendChild(button)
		const infoText = document.createElement('span')
		infoText.id = 'info'
		element.appendChild(infoText)
		
		let iframe = null
		let iframePromise = null
		button.addEventListener("click", async e => {
			if (button.textContent === runText){
				infoText.textContent = ""
				button.textContent = "Loading..."
				button.disabled = true
				iframePromise = runCode(editor.getValue(), element)
				try {
					iframe = await iframePromise
					button.disabled = false
					button.textContent = stopText
					window.addEventListener('message', e => {
						if(iframe && e.source === iframe.contentWindow){
							if (e.data.done){
								stopIframe()
							} else if (e.data.error){
								iframeError(e.data.error)
							} else if (e.data.console){
								infoText.classList.remove('error')
								infoText.textContent = `log: ${e.data.console.map(c => JSON.stringify(c))}`
							}
						}
					})
				} catch(e){
					iframeError(e)
				}
			} else {
				stopIframe()
			}
		})
		
		function stopIframe(){
			button.textContent = runText
			button.disabled = false
			if (iframe){
				iframe.remove()
				iframe = null
				iframePromise = null
			} else if (iframePromise){
				//stop it once it's started
				iframePromise.then(stopIframe)
			}
		}

		function iframeError(e){
			stopIframe()
			infoText.textContent = e
			infoText.classList.add('error')
		}

		//cancel it
		editor.onDidChangeModelContent(() => {
			stopIframe()
		})
	});

	monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
		target: monaco.languages.typescript.ScriptTarget.ES2015,
		allowNonTsExtensions: true,
		lib: ["ES2015"]
	});

	console.log()

	/**
	 * Add the declaration
	 */
	let declr = await fetchToneDts()

	// add the console
	declr += `
		interface Console {
			log(message?: any, ...optionalParams: any[]): void;
		}
		declare var Console: {
			prototype: Console;
			new(): Console;
		};
		const console = new Console()
	`

	monaco.languages.typescript.typescriptDefaults.addExtraLib(
		declr,
		"file:///node_modules/tone/index.d.ts"
	);
}
if (!IS_IFRAME){
	main()
}
