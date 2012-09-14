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

if ($_GET['j'] == 'contentMain') {
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
		$cnt = 1;
		$modeTree = array();
		while (isset($_SESSION['modeTree'][$cnt])) {
			$modeTree[$cnt] = $_SESSION['modeTree'][$cnt];
			$cnt++;
		}
		$res['main']['modeIdTree'] = $modeTree;
		$res['main']['activeMode'] = $_SESSION['mode'];
	}
}
else if ($_GET['j'] == 'contentInfo') {
	$res = true;
}
else if ($_GET['j'] == 'tab') {
	// tabs requested -> return menu structure
	$res = $map->getMainMenu();
}
else if ($_GET['j'] == 'allImg') {
	$res = $map->getAllImgs();
}
else if ($_GET['j'] == 'imgById') {
	// get mode information
	$modeId = $_SESSION['mode'];
	if (isset($_GET['modeId'])) {
		$modeId = $_GET['modeId'];
	}
	$mode = $map->selectByUid('mode', $modeId);
	if ($mode) {
		$res = $map->selectByUid($mode['tableName'], $_GET['id']);
		if (!isset($res['mode'])) {
			$res['mode'] = array(
					'id' => $mode['id'],
					'drawOrder' => $mode['drawOrder']
					);
		}
	}
}

if ($res) {
	print json_encode($res);
}
else {
	print "-99";
}

?>