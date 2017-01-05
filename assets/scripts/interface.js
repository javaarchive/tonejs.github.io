var interfaceContainer = document.createElement('div')
interfaceContainer.id = 'InterfaceContainer'
window.addEventListener('load', function(){
	document.body.appendChild(interfaceContainer)
})

function makeElement(name, container){
	if (!container){
		container = interfaceContainer
	}
	var element = document.createElement('div')
	element.classList.add(name)
	container.appendChild(element)
	return element
}

/**
 *  MomentaryButton
 */
function MomentaryButton(text, downCb, upCb, container){
	var element = makeElement('MomentaryButton', container)
	element.textContent = text

	function buttonDown(e){
		e.preventDefault()
		downCb(text)
	}
	function buttonUp(e){
		e.preventDefault()
		upCb(text)
	}
	element.addEventListener('mousedown', buttonDown)
	element.addEventListener('touchstart', buttonDown)
	element.addEventListener('mouseup', buttonUp)
	element.addEventListener('touchend', buttonUp)
}

/**
 *  Monitor
 */
function Monitor(value, labelText, container){
	var element = makeElement('Monitor', container)

	if (labelText){
		var label = makeElement('Label', element)
		label.textContent = labelText
	}

	var valueElement = makeElement('Value', element)
	
	function update(){
		requestAnimationFrame(update)

		var val = value
		if (typeof value === 'function'){
			val = value()
		} 
		if(typeof val === 'number'){
			val = val.toFixed(3)
		}
		valueElement.textContent = val
	}
	update()
}

/**
 *  Toggle
 */
function Toggle(onText, offText, callback, container){
	var element = makeElement('Toggle', container)
	element.textContent = onText

	var state = false

	element.addEventListener('click', function(e){
		e.preventDefault()
		state = !state
		if (state){
			element.classList.add('Active')
			element.textContent = offText
		} else {
			element.classList.remove('Active')
			element.textContent = onText
		}
		callback(state)
	})
}

/**
 *  TransportControls
 */
function TransportControls(container){
	var element = makeElement('TransportControls', container)

	Toggle('▶', '◼', function(state){
		if (state){
			Tone.Transport.start()
		} else {
			Tone.Transport.stop()
		}
	}, element)

	Monitor(function(){
		return Tone.Transport.position
	}, undefined, element)
}

/**
 *  TempoSlider
 */
function TempoSlider(container){
	var element = makeElement('TempoSlider', container)
}
