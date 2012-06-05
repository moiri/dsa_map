<?php
/**
 * this script sets the mode session variable
 */
session_start();

header('Content-Type: text/plain');

$_SESSION['mode'] = $_GET['mode'];
print "0";

?>