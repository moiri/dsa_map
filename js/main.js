$(document).ready(function() {
	// do stuff when DOM is ready
	var mainMenu, infoMenu;
	mainMenu = new MainMenu('menu-main');
	mainMenu.drawMenu();
	infoMenu = new InfoMenu('menu-info');
	infoMenu.drawMenu();
});