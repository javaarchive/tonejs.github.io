---
layout: default
title: demos
---

# Demos

<link rel="stylesheet" type="text/css" href="/assets/css/demo.css">
<div id="demos">
	{% for demo in site.data.demos %}
		<div class="demo">
			<a href="{{demo.url}}" target="_blank">
				<img src="/assets/images/{{demo.image}}">
			</a>
			<div id="title">
				<div id="text">{{demo.title}}</div>
			</div>
		</div>
	{% endfor %}
</div>

# Submit your project

Using Tone.js? I'd love to hear it. Please submit your project [here](https://goo.gl/forms/lS7HCvRCULlRdCXm1).
