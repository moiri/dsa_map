$(document).ready(function() {
	// do stuff when DOM is ready

	var url = "php/ajax/getMainMenu.php";
	
	$.getJSON(url, function(data) {
		  var items = [];

		  $.each(data, function(key, val) {
		    items.push('<li id="' + key + '">' + val + '</li>');
		  });

		  $('<ul/>', {
		    'class': 'my-new-list',
		    html: items.join('')
		  }).appendTo('#mainMenu');
		});
});