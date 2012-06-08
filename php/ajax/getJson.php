<?php 
/**
 * this script gets informaion from the db
 * and returns te results as json string
 */

session_start();
require_once('../dbMapper/mapDbMapper.php');
require_once('../dbMapper/secure/globals.php');

header('Content-Type: text/plain');

$map = new MapDbMapper(DBSERVER,DBNAME,DBUSER,DBPASSWORD);
$res = false;

if ($_GET['j'] == 'content') {
	// main menu content requested
	// get mode information
	$res = $map->selectByUid('mode', $_SESSION['mode']);
	if ($res) {
		$pattern = null;
		if (isset($_GET['pattern'])) {
			// get main menu entries with search pattern
			$pattern = $_GET['pattern'];
		}
		$res = $map->getMainMenuEntries($res, $pattern);
	}
}
else if ($_GET['j'] == 'tab') {
	// tabs requested -> return menu structure
	$res = $map->getMainMenu();
}
else if ($_GET['j'] == 'allImg') {
	$res = $map->getAllImgs();
}

if ($res) {
	print json_encode($res);
}
else {
	print "-99";
}

?>