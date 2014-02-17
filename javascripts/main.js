$(document).ready(function(){
	$("#toc").append('<h4><a href="#" name="toc"></a>Table of contents</h4><ul></ul>')
	$("#main_content h2").each(function(i) {
	    var current = $(this);
	    $("#toc ul").append("<li><a id='link-" + i + "' href='#" + current.find('a').attr('name') + "' title='" + current.text() + "'>" + 
	        current.text() + "</a></li>");
	    current.find('a').addClass('up').attr('href', '#toc');
	});
});