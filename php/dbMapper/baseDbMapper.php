<?php
/**
 * Class to handle the global communication with the DB
 * 
 * @author moiri
 */
class BaseDBMapper {
	var $server = "";
	var $database = "";
	var $login = "";
	var $password = "";
	var $names = "";
	var $handle = "";
	var $result = "";

	/**
	 * Open connection to mysql database
	 *
	 * @param string $server:	address of server
	 * @param string $database:	name of database
	 * @param string $login:	username
	 * @param string $password:	password
	 * @param string $names:	charset (optional, default: utf8)
	 */
	function BaseDbMapper($server="",$database="",$login="",$password="",$names="utf8") {
		$this->server = $server;
		$this->database = $database;
		$this->login = $login;
		$this->password = $password;
		$this->names = $names;
		$this->handle = @mysql_connect( $this->server, $this->login, $this->password)
		or die ("Error: Connection to MySQL-database failed!");
		$this->result = mysql_select_db($this->database,$this->handle);
		mysql_query("SET NAMES '".$this->names."';");
	}

	/**
	 * Get a single row of a db table by foreign key
	 *
	 * @param string $table: 	the name of the db table
	 * @param string $fk: 		name of the foreign key
	 * @param int $id: 			the foreign key of the row to be selected
	 * @return an array with all row entries or false if no entry was selected
	 */
	function selectByFk($table, $fk, $id) {
		$retValue = false;
		$sql = sprintf("SELECT * FROM %s WHERE %s='%d';",
				mysql_real_escape_string($table),
				mysql_real_escape_string($fk),
				mysql_real_escape_string($id));
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);

		$num_rows = mysql_num_rows($result);
		if($num_rows >= 1) {
			$retValue = array();
			while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				array_push($retValue, $row);
			}
		}
		else {
			// no entry
			$retValue = false;
		}
		return $retValue;
	}

	/**
	 * Get a single row of a db table by unique id
	 *
	 * @param string $table: 	the name of the db table
	 * @param int $id: 			the unique id of the row to be selected
	 * @return an array with all row entries or false if no entry was selected
	 */
	function selectByUid($table, $id) {
		$retValue = false;
		$sql = sprintf("SELECT * FROM %s WHERE id='%d';",
				mysql_real_escape_string($table),
				mysql_real_escape_string($id));
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);

		$num_rows = mysql_num_rows($result);
		if($num_rows > 1) {
			// multiple ids -> there is an error in the db-structure, the id must be unique
			die ("Error: Invalid mySQL db!");
		}
		else if($num_rows == 1){
			$retValue = mysql_fetch_array($result, MYSQL_ASSOC);
		}
		else {
			// no entry
			$retValue = false;
		}
		return $retValue;
	}

	/**
	 * Get a single row of a data table by unique id and get all names of
	 * foreign keys by joining the linked tables (using naming convention)
	 *
	 * @param string $table: 	the name of the db table
	 * @param int $id: 			the unique id of the row to be selected
	 * @return an array with all row entries or false if no entry was selected
	 */
	function selectByUidJoin($table, $id) {
		$mainTable = $this->selectByUid($table, $id);
		$tableNb = 0;
		$join = "";
		$sql = "SELECT ";
		if($mainTable) {
			foreach($mainTable as $i => $value) {
				$sql .= "t0.".$i.", ";
				if(substr($i, 0, 3) == "id_") {
					$tableNb++;
					$tableName = substr($i, 3);
					$join .= " LEFT JOIN ".rtrim($tableName, "0..9")." t".$tableNb." ON t0.".$i." = t".$tableNb.".id";
					$sql .= "t".$tableNb.".name name_".$tableName.", ";
				}
			}
			$sql = rtrim($sql, ", ");
			$sql .= sprintf(" FROM %s t0%s WHERE t0.id='%d';",
					mysql_real_escape_string($table),
					$join,
					mysql_real_escape_string($id));

			if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
			else $errorQuery = "Error: Invalid mySQL query!";
			$result = mysql_query($sql, $this->handle)
			or die ($errorQuery);

			$num_rows = mysql_num_rows($result);
			if($num_rows > 1) {
				// multiple ids -> there is an error in the db-structure, the id must be unique
				die ("Error: Invalid mySQL db!");
			}
			else if($num_rows == 1){
				$retValue = mysql_fetch_array($result, MYSQL_ASSOC);
			}
			else {
				// no entry
				$retValue = false;
			}
		}
		else {
			// no entry
			$retValue = false;
		}
		return $retValue;
	}

	/**
	 * Get rows of a db table by condition
	 * @deprecated (no injection check)
	 *
	 * @param string $sql: query to execute on the db
	 * @return an array with all rows or false if no entry was selected
	 */
	function queryDb($sql) {
		$retValue = false;
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		$result = mysql_query($sql, $this->handle)
		or die ($errorQuery);

		$num_rows = mysql_num_rows($result);
		$retValue = array();
		if($num_rows >= 1) {
			while($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
				array_push($retValue, $row);
			}
		}
		else {
			// no entry
			$retValue = false;
		}
		return $retValue;
	}

	/**
	 * Insert values into db table
	 *
	 * @param string $table: 	the name of the db table
	 * @param array $entries:	an associative array of db entries e.g. $["colname1"] = "blabla" or
	 * 							an array with db entries eg $[0] = "blabla"
	 * @return inserted id if succeded
	 */
	function insert($table, $entries) {
		$hasColNames = true;
		$columnStr = " (";
		$valueStr = "VALUES(";
		foreach ($entries as $i => $value) {
			if(is_numeric($i)) $hasColNames = false;
			else $columnStr .= mysql_real_escape_string($i).", ";
			$valueStr .= "'".mysql_real_escape_string($value)."', ";
		}
		if($hasColNames) {
			$columnStr = rtrim($columnStr, ", ");
			$columnStr .= ")";
		}
		else {
			$columnStr = "";
		}
		$valueStr = rtrim($valueStr, ", ");
		$valueStr .= ")";
		$insertStr = $columnStr." ".$valueStr;
		$sql = sprintf("INSERT INTO %s%s;",
				mysql_real_escape_string($table),
				$insertStr);
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		mysql_query($sql, $this->handle)
		or die ($errorQuery);


		return mysql_insert_id();
	}

	/**
	 * Update values in db defined by id
	 *
	 * @param string $table: 	the name of the db table
	 * @param array $entries: 	an associative array of db entries e.g. $["colname1"] = "blabla"
	 * @param int $id: 			the unique id of the row to be selected
	 * @return true if succeded
	 */
	function updateByUid($table, $entries, $id) {
		$insertStr = "";
		foreach ($entries as $i => $value) {
			$insertStr .= mysql_real_escape_string($i)."='".mysql_real_escape_string($value)."', ";
		}
		$insertStr = rtrim($insertStr, ", ");
		$sql = sprintf("UPDATE %s SET %s WHERE id='%d';",
				mysql_real_escape_string($table),
				$insertStr,
				mysql_real_escape_string($id));
		if($this->debug) $errorQuery = "Error: Invalid mySQL query: ".$sql;
		else $errorQuery = "Error: Invalid mySQL query!";
		mysql_query($sql, $this->handle)
		or die ($errorQuery);

		return true;
	}
}

?>