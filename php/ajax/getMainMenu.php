<?php
/**
 * this script loads the main menu from the db
 * and converts the generated array to a json string
 * and prints it out
 */
session_start();
require_once('../dbMapper/mapDbMapper.php');
require_once('../dbMapper/secure/globals.php');

header('Content-Type: text/plain');

$map = new MapDbMapper(DBSERVER,DBNAME,DBUSER,DBPASSWORD);
$res = false;
if (isset($_GET['tab'])) {
	$res = $map->getMainMenu();
}
else if (isset($_GET['content'])) {
	$res = $map->selectByUid('mode', $_SESSION['mode']);
	if ($res) {
		$res = $map->getMainMenuEntries($res);
	}
}
if ($res) {
	print json_encode($res);
}
else {
	print "-99";
}

?>