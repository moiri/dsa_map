$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu, map, img;
	map = new Map('map-canvas');
	$('#map-canvas').height($(window).height()-80);
	mainMenu = new MainMenu('menu-main', map.initMapOnCanvas);
	mainMenu.drawMenu();
	infoMenu = new InfoMenu('menu-info', map.initMapOnCanvas);
	infoMenu.drawMenu();
	//map.initMap();
	img = [];
	map.loadImages(img);
	map.enableMoveMap();
	map.enableZoom();
});