<?php
// File: database.php
// Summary: Functions to query the database.

include_once "config.php";

// Global database connection id
$connection = null;

// Connects to the database server and selects the database.
// Don't call this directly, query() function calls it if the
// connection haven't been made.
function connect() {
	global $config, $connection;
	
	// Database connection credentials
	$host = $config['host'];
	$user = $config['user'];
	$pass = $config['pass'];
	$db   = $config['db'];
	
	// Connects the database server and selects the default database
	$connection = mysqli_connect($host, $user, $pass, $db);
	
	// TODO: Check for errors when connecting to the database server
	return $connection;
}

// Execute a query in the database.
// If there's a result, a two-dimensional array with the data is returned.
// Otherwise, an empty array is returned.
function query($query_string, $args = array()) {
	global $connection;
	
	// Check if the connection is alive
	if ($connection == null) {
		// ... and if not then make the connection
		connect();
	}
	
	// Generate the query string cleaning the arguments first
	if (!empty($args)) {
		// Run every argument through mysqli_real_escape_string to clean it
		$escape = function($arg) {
			global $connection;
			return mysqli_real_escape_string($connection, $arg);
		};
		
		$args = array_map($escape, $args);
		// ... and then join those arguments with the query string
		$query_string = vsprintf($query_string, $args);
	}
	
	// Loop through the results and put them in an array
	$results_table = array();
	$results = mysqli_query($connection, $query_string); // This executes the query
	if ($results) {
		if (!is_bool($results)) {
			while ($result = mysqli_fetch_assoc($results)) { // ... and this fetch the results
				$results_table[] = $result;                  // Those results are put in the array
			}
		}
	} else {
		// TODO: Log this error instead of printing it
		print $query_string;
		print mysqli_error($connection);
	}
	
	return $results_table;
}
