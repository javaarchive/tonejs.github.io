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
	iframe.allow = "autoplay"
	element.appendChild(iframe)
	const version = getVersion()
	code = code.replace(/from ["']tone["']/gm, `from "https://unpkg.com/tone@${version}?module"`)
	const content = `
	<script type="module">
		window.onerror = e => {
			window.parent.postMessage({ error : e })
		}
		${code}
	</script>
	`
	const blob = new Blob([content], { type : 'text/html' })
	const loaded = new Promise((done) => {
		iframe.onload = done
	})
	iframe.src = URL.createObjectURL(blob)
	await loaded
	return iframe
}

const runText = "▶ Run"
const stopText = "◼ Stop"

async function main(){
	
	// @ts-ignore
	self.MonacoEnvironment = {
		getWorkerUrl: function(moduleId, label) {
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
		const errorText = document.createElement('span')
		errorText.id = 'error'
		element.appendChild(errorText)
		
		let iframe = null
		let iframePromise = null
		button.addEventListener("click", async e => {
			if (button.textContent === runText){
				errorText.textContent = ""
				button.textContent = "Loading..."
				button.disabled = true
				iframePromise = runCode(editor.getValue(), element)
				iframe = await iframePromise
				button.disabled = false
				button.textContent = stopText
				window.addEventListener('message', e => {
					if(iframe && e.source === iframe.contentWindow){
						iframe.remove()
						errorText.textContent = e.data.error
						stopIframe()
					}
				})
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

		//cancel it
		editor.onDidChangeModelContent(() => {
			stopIframe()
		})
	});

	/**
	 * Add the declaration
	 */
	const declr = await fetchToneDts()

	monaco.languages.typescript.typescriptDefaults.addExtraLib(
		declr,
		"file:///node_modules/tone/index.d.ts"
	);
}
if (!IS_IFRAME){
	main()
}
