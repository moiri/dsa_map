<?php
/**
 * this script loads the main menu from the db
 * and converts the generated array to a json string
 * and prints it out
 */
require_once('../dbMapper/mapDbMapper.php');
require_once('../dbMapper/secure/globals.php');

header('Content-Type: text/plain');

$map = new MapDbMapper(DBSERVER,DBNAME,DBUSER,DBPASSWORD);
$menu = $map->getMainMenu();
if ($menu) {
	print json_encode($menu);
}
else {
	print "-99";
}

?>