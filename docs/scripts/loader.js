$(function(){
	$(window).on("hashchange", setHash);	

	function setHash(){
		var hash = window.location.hash.substring(1);
		if (hash === ""){
			return;
		}
		var method;
		//split hash at the .
		if (hash.split(".").length === 2){
			var split = hash.split(".");
			hash = split[0];
			method = split[1];
		}
		var url = location.protocol+'//'+location.host+location.pathname + hash + ".html";
		$("#page").load( url+" #content", function(){
			$(document).attr("title", hash.toUpperCase());
			var scrollTop = 0;
			$(this).scrollTop(0);
			if (method){
				//minus the topbar height
				var topbarHeight = $("#topBar").height();
				scrollTop = $(this).find("#"+method+".listItem").position().top - topbarHeight;
			}
			$(this).scrollTop(scrollTop);

			//if the hamburger is visible, hide the search bar
			if ($(window).width() <= 650){
				$("#sidebar").css("display", "none");
			} else {
				$("#sidebar").css("display", "inherit");
			}
		});
		//highlight the active page
		hash = hash.toLowerCase();
		for (var i = 0; i < allListItems.length; i++){
			var item = allListItems[i];
			if (item.name === hash){
				item.element.addClass("active");
			} else {
				item.element.removeClass("active");
			}
		}

	}

	//SEARCH BAR

	//get the names of all the items in the search bar
	var allListItems = [];
	$(".item").each(function(i, el){
		var name = $(el).find("a").text().toLowerCase();
		allListItems.push({
			"name" : name,
			"element" : $(el)
		});
	});

	$("#search input").on("input", function(e){
		var word = $(e.target).val().toLowerCase();
		for (var i = 0; i < allListItems.length; i++){
			var item = allListItems[i];
			if (item.name.indexOf(word) === -1){
				item.element.css("display", "none");
			} else {
				item.element.css("display", "inherit");
			}
		}
	});

	$("#clear").on("click", function(){
		$("#search input").val("");
		$(".item").css("display", "inherit");
	});

	//the hamburger menu
	$("#hamburger").on("click", function(){
		$("#sidebar").css("display", $("#sidebar").css("display") ==="none" ? "initial" : "none");
	});

	setHash();

	//add the Tone.js logo
	var topbar = $("#topBar");

	var logo = new Logo({
		"container" : topbar.get(0),
		"height" : 29,
		"width" : 140
	});
});