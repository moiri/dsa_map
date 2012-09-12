<?php
/**
 * this script sets the mode session variable
 */
session_start();
require_once('../dbMapper/mapDbMapper.php');
require_once('../dbMapper/secure/globals.php');

header('Content-Type: text/plain');

$map = new MapDbMapper(DBSERVER,DBNAME,DBUSER,DBPASSWORD);

$_SESSION['mode'] = $_GET['mode'];

$nextId = $_SESSION['mode'];
$_SESSION['modeTree'] = null;

while ($res = $map->selectByUid('mode', $nextId)) {
	$_SESSION['modeTree'][$res['lvl']] = $res['id'];
	$nextId = $res['parentId'];
}
print "0";

?>